import {logger} from '#/logger'
import {SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL} from '#/env'
import {type SessionAccount} from './types'

/** Register a DID without blocking login or session restoration. */
export async function registerAccountDid(account: SessionAccount) {
  if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
    logger.warn('Skipped Supabase DID registration: missing public config', {
      hasUrl: Boolean(SUPABASE_URL),
      hasPublishableKey: Boolean(SUPABASE_PUBLISHABLE_KEY),
    })
    return
  }
  if (!account.accessJwt) {
    logger.warn('Skipped Supabase DID registration: missing AT Protocol token')
    return
  }

  try {
    const response = await fetch(
      `${SUPABASE_URL.replace(/\/+$/, '')}/functions/v1/register-account`,
      {
        method: 'POST',
        headers: {
          apikey: SUPABASE_PUBLISHABLE_KEY,
          'Content-Type': 'application/json',
          'x-atproto-access-token': account.accessJwt,
        },
        body: JSON.stringify({did: account.did}),
      },
    )

    if (!response.ok) {
      const detail = await response.text().catch(() => '')
      logger.warn('Failed to register account DID', {
        status: response.status,
        safeMessage: detail.slice(0, 300),
      })
    }
  } catch (error) {
    logger.warn('Failed to register account DID', {
      safeMessage: error instanceof Error ? error.message : String(error),
    })
  }
}