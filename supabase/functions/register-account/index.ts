const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'apikey, content-type, x-atproto-access-token, x-client-info',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

type DidDocument = {
  id?: string
  service?: Array<{
    id?: string
    type?: string | string[]
    serviceEndpoint?: string
  }>
}

type Session = {
  did?: string
  handle?: string
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {...corsHeaders, 'Content-Type': 'application/json'},
  })
}

function isUnsafeHostname(hostname: string) {
  const host = hostname.toLowerCase().replace(/\.$/, '')
  return (
    !host ||
    host === 'localhost' ||
    host.endsWith('.localhost') ||
    host.endsWith('.local') ||
    host.includes(':') ||
    /^\d{1,3}(\.\d{1,3}){3}$/.test(host)
  )
}

async function resolveDidDocument(did: string): Promise<DidDocument> {
  let url: URL

  if (did.startsWith('did:plc:')) {
    url = new URL(`https://plc.directory/${did}`)
  } else if (did.startsWith('did:web:')) {
    const hostname = decodeURIComponent(did.slice('did:web:'.length))
    if (hostname.includes('/') || hostname.includes(':') || isUnsafeHostname(hostname)) {
      throw new Error('Unsupported did:web identifier')
    }
    url = new URL(`https://${hostname}/.well-known/did.json`)
  } else {
    throw new Error('Unsupported DID method')
  }

  const response = await fetch(url, {
    headers: {Accept: 'application/json'},
    redirect: 'error',
    signal: AbortSignal.timeout(10_000),
  })
  if (!response.ok) {
    throw new Error(`DID document lookup failed (${response.status})`)
  }

  const document = (await response.json()) as DidDocument
  if (document.id !== did) {
    throw new Error('DID document identifier did not match')
  }
  return document
}

function getPdsUrl(document: DidDocument): URL {
  const pds = document.service?.find(service => {
    const types = Array.isArray(service.type) ? service.type : [service.type]
    return types.includes('AtprotoPersonalDataServer')
  })
  if (!pds?.serviceEndpoint) {
    throw new Error('DID document has no PDS endpoint')
  }

  const url = new URL(pds.serviceEndpoint)
  if (
    url.protocol !== 'https:' ||
    url.username ||
    url.password ||
    isUnsafeHostname(url.hostname)
  ) {
    throw new Error('DID document has an unsupported PDS endpoint')
  }
  return url
}

Deno.serve(async request => {
  if (request.method === 'OPTIONS') {
    return new Response('ok', {headers: corsHeaders})
  }
  if (request.method !== 'POST') {
    return jsonResponse({error: 'Method not allowed'}, 405)
  }

  const secretKey = Deno.env.get('APP_SUPABASE_SECRET_KEY')
  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  if (!secretKey || !supabaseUrl) {
    return jsonResponse({error: 'Server storage is not configured'}, 500)
  }

  const accessToken = request.headers.get('x-atproto-access-token')
  if (!accessToken) {
    return jsonResponse({error: 'Missing AT Protocol session token'}, 401)
  }

  let did: string
  try {
    const payload = await request.json()
    did = typeof payload?.did === 'string' ? payload.did : ''
    if (!did.startsWith('did:')) {
      return jsonResponse({error: 'Invalid DID'}, 400)
    }
  } catch {
    return jsonResponse({error: 'Invalid request body'}, 400)
  }

  try {
    const didDocument = await resolveDidDocument(did)
    const pdsUrl = getPdsUrl(didDocument)
    const sessionUrl = new URL(
      'xrpc/com.atproto.server.getSession',
      pdsUrl.href.endsWith('/') ? pdsUrl.href : `${pdsUrl.href}/`,
    )
    const sessionResponse = await fetch(sessionUrl, {
      headers: {Authorization: `Bearer ${accessToken}`},
      redirect: 'error',
      signal: AbortSignal.timeout(10_000),
    })
    if (!sessionResponse.ok) {
      return jsonResponse({error: 'AT Protocol session verification failed'}, 401)
    }

    const session = (await sessionResponse.json()) as Session
    if (session.did !== did) {
      return jsonResponse({error: 'Session DID did not match'}, 403)
    }

    const upsertResponse = await fetch(
      `${supabaseUrl.replace(/\/+$/, '')}/rest/v1/app_users?on_conflict=did`,
      {
        method: 'POST',
        headers: {
          apikey: secretKey,
          'Content-Type': 'application/json',
          Prefer: 'resolution=merge-duplicates,return=minimal',
        },
        body: JSON.stringify({
          did,
          handle: session.handle,
          pds_url: pdsUrl.origin,
          last_seen_at: new Date().toISOString(),
        }),
        signal: AbortSignal.timeout(10_000),
      },
    )
    if (!upsertResponse.ok) {
      return jsonResponse({error: 'Failed to save account record'}, 500)
    }
    return jsonResponse({ok: true})
  } catch {
    return jsonResponse({error: 'Account registration failed'}, 502)
  }
})