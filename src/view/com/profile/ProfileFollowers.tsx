import {
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import {View} from 'react-native'
import {useLingui} from '@lingui/react/macro'
import {useNavigation} from '@react-navigation/native'

import {useInitialNumToRender} from '#/lib/hooks/useInitialNumToRender'
import {type NavigationProp} from '#/lib/routes/types'
import {cleanError} from '#/lib/strings/errors'
import {logger} from '#/logger'
import {useProfileFollowersQuery} from '#/state/queries/profile-followers'
import {useResolveDidQuery} from '#/state/queries/resolve-uri'
import {useSession} from '#/state/session'
import {atoms as a} from '#/alf'
import {useIsFindContactsFeatureEnabledBasedOnGeolocation} from '#/components/contacts/country-allowlist'
import {SearchInput} from '#/components/forms/SearchInput'
import {PeopleRemove2_Stroke1_Corner0_Rounded as PeopleRemoveIcon} from '#/components/icons/PeopleRemove2'
import {ListFooter, ListMaybePlaceholder} from '#/components/Lists'
import {useAnalytics} from '#/analytics'
import {IS_NATIVE} from '#/env'
import {
  FollowersPromoBanner,
  useFollowersPromoDismissed,
} from '#/features/inviteFriends'
import {type app} from '#/lexicons'
import {List} from '../util/List'
import {ProfileCardWithFollowBtn} from './ProfileCard'

function renderItem({
  item,
  index,
  contextProfileDid,
}: {
  item: app.bsky.actor.defs.ProfileView
  index: number
  contextProfileDid: string | undefined
}) {
  return (
    <ProfileCardWithFollowBtn
      key={item.did}
      profile={item}
      noBorder={index === 0}
      position={index + 1}
      contextProfileDid={contextProfileDid}
    />
  )
}

function keyExtractor(item: app.bsky.actor.defs.ProfileView) {
  return item.did
}

export function ProfileFollowers({name}: {name: string}) {
  const {t: l} = useLingui()
  const ax = useAnalytics()
  const navigation = useNavigation<NavigationProp>()
  const initialNumToRender = useInitialNumToRender()
  const {currentAccount} = useSession()

  const isSortEnabled = ax.features.enabled(ax.features.FollowSortEnable)

  const [isPTRing, setIsPTRing] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const {
    data: resolvedDid,
    isLoading: isDidLoading,
    error: resolveError,
  } = useResolveDidQuery(name)
  const isMe = resolvedDid === currentAccount?.did
  const sort = isMe ? 'latest' : 'top'
  const {
    data,
    isLoading: isFollowersLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    error,
    refetch,
  } = useProfileFollowersQuery(resolvedDid, {
    sort,
  })

  const isError = !!resolveError || !!error

  const followers = useMemo(() => {
    if (data?.pages) {
      return data.pages.flatMap(page => page.followers)
    }
    return []
  }, [data])

  const deferredSearchQuery = useDeferredValue(searchQuery)
  const normalizedSearchQuery = deferredSearchQuery
    .trim()
    .replace(/^@/, '')
    .toLowerCase()
  const filteredFollowers = useMemo(() => {
    if (!normalizedSearchQuery) return followers
    return followers.filter(profile => {
      const handle = profile.handle.toLowerCase()
      const displayName = profile.displayName?.toLowerCase() || ''
      return (
        handle.includes(normalizedSearchQuery) ||
        displayName.includes(normalizedSearchQuery)
      )
    })
  }, [followers, normalizedSearchQuery])

  // Track pagination events - fire for page 3+ (pages 1-2 may auto-load)
  const paginationTrackingRef = useRef<{
    did: string | undefined
    page: number
  }>({did: undefined, page: 0})
  useEffect(() => {
    const currentPageCount = data?.pages?.length || 0
    // Reset tracking when profile changes
    if (paginationTrackingRef.current.did !== resolvedDid) {
      paginationTrackingRef.current = {did: resolvedDid, page: currentPageCount}
      return
    }
    if (
      resolvedDid &&
      currentPageCount >= 3 &&
      currentPageCount > paginationTrackingRef.current.page
    ) {
      ax.metric('profile:followers:paginate', {
        contextProfileDid: resolvedDid,
        itemCount: followers.length,
        page: currentPageCount,
        sort: isSortEnabled ? sort : undefined,
      })
    }
    paginationTrackingRef.current.page = currentPageCount
  }, [
    ax,
    data?.pages?.length,
    resolvedDid,
    followers.length,
    sort,
    isSortEnabled,
  ])

  const onRefresh = useCallback(async () => {
    setIsPTRing(true)
    try {
      await refetch()
    } catch (err) {
      logger.error('Failed to refresh followers', {message: err})
    }
    setIsPTRing(false)
  }, [refetch, setIsPTRing])

  const onEndReached = useCallback(async () => {
    if (isFetchingNextPage || !hasNextPage || !!error) return
    try {
      await fetchNextPage()
    } catch (err) {
      logger.error('Failed to load more followers', {message: err})
    }
  }, [isFetchingNextPage, hasNextPage, error, fetchNextPage])

  useEffect(() => {
    if (
      !normalizedSearchQuery ||
      filteredFollowers.length > 0 ||
      !hasNextPage ||
      isFetchingNextPage
    ) {
      return
    }
    void fetchNextPage()
  }, [
    normalizedSearchQuery,
    filteredFollowers.length,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  ])

  const renderItemWithContext = useCallback(
    ({item, index}: {item: app.bsky.actor.defs.ProfileView; index: number}) =>
      renderItem({item, index, contextProfileDid: resolvedDid}),
    [resolvedDid],
  )

  // track pageview
  useEffect(() => {
    if (resolvedDid) {
      ax.metric('profile:followers:view', {
        contextProfileDid: resolvedDid,
        isOwnProfile: isMe,
        sort: isSortEnabled ? sort : undefined,
      })
    }
  }, [ax, resolvedDid, isMe, sort, isSortEnabled])

  // track seen items
  const seenItemsRef = useRef<Set<string>>(new Set())
  useEffect(() => {
    seenItemsRef.current.clear()
  }, [resolvedDid])
  const onItemSeen = useCallback(
    (item: app.bsky.actor.defs.ProfileView) => {
      if (seenItemsRef.current.has(item.did)) {
        return
      }
      seenItemsRef.current.add(item.did)
      const position = followers.findIndex(p => p.did === item.did) + 1
      if (position === 0) {
        return
      }
      ax.metric('profileCard:seen', {
        profileDid: item.did,
        position,
        ...(resolvedDid !== undefined && {contextProfileDid: resolvedDid}),
        sort: isSortEnabled ? sort : undefined,
      })
    },
    [ax, followers, resolvedDid, sort, isSortEnabled],
  )

  const [followersPromoDismissed, setFollowersPromoDismissed] =
    useFollowersPromoDismissed()
  const findContactsEnabled =
    useIsFindContactsFeatureEnabledBasedOnGeolocation()
  // The banner deep-links into the Find and Invite Friends settings screen, so
  // mirror that screen's availability gates: native-only, allowed in the user's
  // region (geolocation allowlist), and not disabled by the feature flag. This
  // avoids promoting contact import where the settings entry itself is hidden.
  const showFollowersPromo =
    IS_NATIVE &&
    isMe &&
    findContactsEnabled &&
    !ax.features.enabled(ax.features.ImportContactsSettingsDisable) &&
    !followersPromoDismissed &&
    followers.length < 1 &&
    !isDidLoading &&
    !isFollowersLoading &&
    !isError

  return (
    <>
      {showFollowersPromo && (
        <FollowersPromoBanner
          onPress={() => navigation.navigate('FindContactsSettings')}
          onDismiss={() => setFollowersPromoDismissed(true)}
        />
      )}
      {followers.length < 1 ? (
        <ListMaybePlaceholder
          isLoading={isDidLoading || isFollowersLoading}
          isError={isError}
          emptyType="results"
          emptyMessage={
            isMe
              ? l`No followers yet`
              : l`This user doesn't have any followers.`
          }
          errorMessage={cleanError(resolveError || error)}
          onRetry={isError ? refetch : undefined}
          sideBorders={false}
          useEmptyState={true}
          emptyStateIcon={PeopleRemoveIcon}
          emptyStateButton={{
            label: l`Go back`,
            text: l`Go back`,
            color: 'secondary',
            size: 'small',
            onPress: () => navigation.goBack(),
          }}
        />
      ) : (
        <List
          data={filteredFollowers}
          renderItem={renderItemWithContext}
          keyExtractor={keyExtractor}
          refreshing={isPTRing}
          onRefresh={() => void onRefresh()}
          onEndReached={() => void onEndReached()}
          onEndReachedThreshold={4}
          onItemSeen={onItemSeen}
          ListHeaderComponent={
            <View style={[a.px_lg, a.pt_sm, a.pb_xs]}>
              <SearchInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                onClearText={() => setSearchQuery('')}
                label={l`Search accounts following this user`}
              />
            </View>
          }
          ListEmptyComponent={
            normalizedSearchQuery && !isFetchingNextPage ? (
              <ListMaybePlaceholder
                isLoading={false}
                isError={false}
                emptyType="results"
                emptyMessage={l`No accounts found`}
                sideBorders={false}
                useEmptyState={true}
              />
            ) : undefined
          }
          ListFooterComponent={
            <ListFooter
              isFetchingNextPage={isFetchingNextPage}
              error={cleanError(error)}
              onRetry={fetchNextPage}
            />
          }
          desktopFixedHeight
          initialNumToRender={initialNumToRender}
          windowSize={11}
          sideBorders={false}
        />
      )}
    </>
  )
}
