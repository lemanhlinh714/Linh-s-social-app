import {type AtIdentifierString, toDatetimeString} from '@atproto/syntax'
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query'

import {useAppviewClient, usePdsClient, useSession} from '#/state/session'
import {type app, com} from '#/lexicons'

const COLLECTION = 'app.linh.profileMetadata'
const RKEY = 'self'
const RQKEY_ROOT = 'profile-metadata'
export const RQKEY = (did: string) => [RQKEY_ROOT, did]

export type ProfileMetadataLinkInput = {
  label: string
  url: string
}

export function useProfileMetadataQuery(did: string | undefined) {
  const appviewClient = useAppviewClient()

  return useQuery<app.linh.profileMetadata.Main | undefined>({
    queryKey: RQKEY(did || ''),
    enabled: !!did,
    queryFn: async () => {
      try {
        const response = await appviewClient.call(com.atproto.repo.getRecord, {
          repo: did as AtIdentifierString,
          collection: COLLECTION,
          rkey: RKEY,
        })
        return response.value as app.linh.profileMetadata.Main
      } catch {
        return undefined
      }
    },
  })
}

export function useProfileMetadataMutation() {
  const pdsClient = usePdsClient()
  const queryClient = useQueryClient()
  const {currentAccount} = useSession()

  return useMutation({
    mutationFn: async ({
      location,
      links,
    }: {
      location: string
      links: ProfileMetadataLinkInput[]
    }) => {
      if (!currentAccount) throw new Error('Not authenticated')

      const record = {
        $type: 'app.linh.profileMetadata',
        ...(location ? {location} : {}),
        links: links.map(link => ({
          label: link.label,
          url: link.url as app.linh.profileMetadata.ExternalLink['url'],
        })),
        updatedAt: toDatetimeString(new Date()),
      } satisfies app.linh.profileMetadata.Main

      return await pdsClient.call(com.atproto.repo.putRecord, {
        repo: pdsClient.assertDid,
        collection: COLLECTION,
        rkey: RKEY,
        record,
      })
    },
    onSuccess: async () => {
      if (currentAccount) {
        await queryClient.invalidateQueries({
          queryKey: RQKEY(currentAccount.did),
        })
      }
    },
  })
}
