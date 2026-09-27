import {useCallback, useEffect, useMemo} from 'react'
import {type DidString} from '@atproto/syntax'
import {
  type InfiniteData,
  type QueryClient,
  useInfiniteQuery,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'

import {STALE} from '#/state/queries'
import {useGetSuggestedUsersForSeeMoreQuery} from '#/state/queries/trending/useGetSuggestedUsersForSeeMoreQuery'
import {useAppviewClient} from '#/state/session'
import {app} from '#/lexicons'
import type * as bsky from '#/types/bsky'

const suggestedFollowsReplacementQueryKeyRoot = 'suggested-follows-replacements'
const suggestedFollowsReplacementQueryKey = (did: string) => [
  suggestedFollowsReplacementQueryKeyRoot,
  did,
]

const suggestedFollowsByActorQueryKeyRoot = 'suggested-follows-by-actor'
export const suggestedFollowsByActorQueryKey = (did: string) => [
  suggestedFollowsByActorQueryKeyRoot,
  did,
]
const dismissedSuggestedFollowsQueryKey = (did: string) => [
  'dismissed-suggested-follows',
  did,
]

export function useSuggestedFollowsByActorQuery({
  did,
  enabled,
  staleTime = STALE.MINUTES.FIVE,
}: {
  did: string
  enabled?: boolean
  staleTime?: number
}) {
  const client = useAppviewClient()
  return useQuery({
    staleTime,
    queryKey: suggestedFollowsByActorQueryKey(did),
    queryFn: async () => {
      const data = await client.call(
        app.bsky.graph.getSuggestedFollowsByActor,
        {
          actor: did as DidString,
        },
      )
      const suggestions = data.suggestions.filter(
        profile => !profile.viewer?.following,
      )
      return {suggestions, recId: data.recIdStr}
    },
    enabled,
  })
}

export function useSuggestedFollowsByActorWithDismiss({
  did,
  enabled,
  staleTime,
  excludeDid,
  refillOnDismiss = false,
}: {
  did: string
  enabled?: boolean
  staleTime?: number
  excludeDid?: string
  refillOnDismiss?: boolean
}) {
  const {isLoading, data, error, refetch} = useSuggestedFollowsByActorQuery({
    did,
    enabled,
    staleTime,
  })
  const queryClient = useQueryClient()
  const client = useAppviewClient()
  const {data: dismissedDids = []} = useQuery<string[]>({
    queryKey: dismissedSuggestedFollowsQueryKey(did),
    queryFn: () => [],
    initialData: [],
    staleTime: Infinity,
    gcTime: Infinity,
    enabled: !!did,
  })
  const dismissedDidSet = useMemo(() => new Set(dismissedDids), [dismissedDids])
  const excludeDidSet = useMemo(
    () =>
      new Set([did, excludeDid].filter((value): value is string => !!value)),
    [did, excludeDid],
  )
  const originalProfiles = useMemo(
    () =>
      (data?.suggestions ?? [])
        .filter(
          profile =>
            !dismissedDidSet.has(profile.did) &&
            !excludeDidSet.has(profile.did),
        )
        .map(profile => ({
          actor: profile,
          recId: data?.recId,
        })),
    [data?.suggestions, data?.recId, dismissedDidSet, excludeDidSet],
  )
  const shouldLoadFallbacks =
    refillOnDismiss &&
    !!did &&
    (dismissedDids.length > 0 || (!isLoading && originalProfiles.length === 0))
  const seeMoreQuery = useGetSuggestedUsersForSeeMoreQuery({
    enabled: shouldLoadFallbacks,
    limit: 50,
  })
  // The actor-specific endpoint has no cursor, so use paginated suggestions for replacements.
  const replacementQuery = useInfiniteQuery({
    queryKey: suggestedFollowsReplacementQueryKey(did),
    queryFn: async ({pageParam}) => {
      return await client.call(app.bsky.actor.getSuggestions, {
        limit: 50,
        cursor: pageParam,
      })
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: lastPage =>
      typeof lastPage?.cursor === 'string' && lastPage.cursor.length > 0
        ? lastPage.cursor
        : undefined,
    staleTime: STALE.MINUTES.FIVE,
    enabled: shouldLoadFallbacks,
  })

  const replacementCandidates = useMemo(() => {
    const seenDids = new Set([
      ...excludeDidSet,
      ...(data?.suggestions.map(profile => profile.did) ?? []),
    ])
    const candidates = [
      ...(seeMoreQuery.data?.actors.map(actor => ({
        actor,
        recId: seeMoreQuery.data?.recId,
      })) ?? []),
      ...(replacementQuery.data?.pages.flatMap(page =>
        page.actors.map(actor => ({actor, recId: page.recIdStr})),
      ) ?? []),
    ]

    const uniqueCandidates = candidates.filter(({actor}) => {
      if (seenDids.has(actor.did) || actor.viewer?.following) return false
      seenDids.add(actor.did)
      return true
    })
    return {
      all: uniqueCandidates,
      available: uniqueCandidates.filter(
        ({actor}) => !dismissedDidSet.has(actor.did),
      ),
    }
  }, [
    data?.suggestions,
    dismissedDidSet,
    excludeDidSet,
    seeMoreQuery.data?.actors,
    seeMoreQuery.data?.recId,
    replacementQuery.data?.pages,
  ])
  const replacementTargetCount =
    originalProfiles.length > 0
      ? dismissedDids.length
      : replacementCandidates.all.length

  useEffect(() => {
    if (
      !shouldLoadFallbacks ||
      seeMoreQuery.isLoading ||
      seeMoreQuery.isFetching ||
      replacementQuery.isLoading ||
      replacementQuery.isFetchingNextPage ||
      replacementCandidates.available.length >= replacementTargetCount ||
      !replacementQuery.hasNextPage
    ) {
      return
    }
    void replacementQuery.fetchNextPage()
  }, [
    shouldLoadFallbacks,
    replacementCandidates.available.length,
    replacementTargetCount,
    seeMoreQuery.isLoading,
    seeMoreQuery.isFetching,
    replacementQuery.isLoading,
    replacementQuery.isFetchingNextPage,
    replacementQuery.hasNextPage,
    replacementQuery.fetchNextPage,
  ])

  const onDismiss = useCallback(
    (dismissedDid: string) => {
      queryClient.setQueryData<string[]>(
        dismissedSuggestedFollowsQueryKey(did),
        previous => [...new Set([...(previous ?? []), dismissedDid])],
      )
      queryClient.setQueryData(
        suggestedFollowsByActorQueryKey(did),
        (previous: typeof data) => {
          if (!previous) return previous
          return {
            ...previous,
            suggestions: previous.suggestions.filter(
              s => s.did !== dismissedDid,
            ),
          }
        },
      )
    },
    [did, queryClient],
  )

  const profiles = [
    ...originalProfiles,
    ...replacementCandidates.available.slice(0, replacementTargetCount),
  ]

  return {
    profiles,
    recId: data?.recId,
    onDismiss,
    dismissedDids,
    isLoading,
    isFetchingReplacements:
      seeMoreQuery.isFetching || replacementQuery.isFetching,
    error,
    refetch,
  }
}

export function* findAllProfilesInQueryData(
  queryClient: QueryClient,
  did: string,
): Generator<app.bsky.actor.defs.ProfileView, void> {
  yield* findAllProfilesInSuggestedFollowsQueryData(queryClient, did)
  yield* findAllProfilesInSuggestedFollowsByActorQueryData(queryClient, did)
}

function* findAllProfilesInSuggestedFollowsQueryData(
  queryClient: QueryClient,
  did: string,
) {
  const queryDatas = queryClient.getQueriesData<
    InfiniteData<app.bsky.actor.getSuggestions.$OutputBody>
  >({
    queryKey: [suggestedFollowsReplacementQueryKeyRoot],
  })
  for (const [_queryKey, queryData] of queryDatas) {
    if (!queryData?.pages) {
      continue
    }
    for (const page of queryData?.pages) {
      for (const actor of page.actors) {
        if (actor.did === did) {
          yield actor
        }
      }
    }
  }
}

function* findAllProfilesInSuggestedFollowsByActorQueryData(
  queryClient: QueryClient,
  did: string,
) {
  const queryDatas =
    queryClient.getQueriesData<app.bsky.graph.getSuggestedFollowsByActor.$OutputBody>(
      {
        queryKey: [suggestedFollowsByActorQueryKeyRoot],
      },
    )
  for (const [_queryKey, queryData] of queryDatas) {
    if (!queryData || !Array.isArray(queryData.suggestions)) {
      continue
    }
    for (const suggestion of queryData.suggestions) {
      if (suggestion.did === did) {
        yield suggestion
      }
    }
  }
}
