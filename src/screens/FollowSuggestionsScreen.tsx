import {useState} from 'react'
import {Pressable, View} from 'react-native'
import {Trans, useLingui} from '@lingui/react/macro'

import {
  type AllNavigatorParams,
  type NativeStackScreenProps,
} from '#/lib/routes/types'
import {useModerationOpts} from '#/state/preferences/moderation-opts'
import {useProfilesQuery} from '#/state/queries/profile'
import {useSuggestedFollowsByActorWithDismiss} from '#/state/queries/suggested-follows'
import {useGetSuggestedFeedsQuery} from '#/state/queries/trending/useGetSuggestedFeedsQuery'
import {useSuggestedStarterPacksQuery} from '#/state/queries/useSuggestedStarterPacksQuery'
import {useSession} from '#/state/session'
import {StarterPackCard} from '#/screens/Search/components/StarterPackCard'
import {atoms as a, useTheme, web} from '#/alf'
import {Button, ButtonText} from '#/components/Button'
import * as FeedCard from '#/components/FeedCard'
import * as Layout from '#/components/Layout'
import {Loader} from '#/components/Loader'
import {Text} from '#/components/Typography'
import {IS_WEB} from '#/env'
import {
  FollowSuggestionRow,
  PINNED_FOLLOW_SUGGESTION_HANDLE,
} from '#/features/followSuggestions/FollowSuggestionRow'

type Props = NativeStackScreenProps<AllNavigatorParams, 'FollowSuggestions'>

export function FollowSuggestionsScreen({}: Props) {
  const t = useTheme()
  const {t: l} = useLingui()
  const [selectedSection, setSelectedSection] = useState<
    'accounts' | 'starterPacks' | 'feeds'
  >('accounts')
  const {currentAccount} = useSession()
  const moderationOpts = useModerationOpts()
  const {
    data: suggestedStarterPacks,
    isLoading: isLoadingStarterPacks,
    error: starterPacksError,
  } = useSuggestedStarterPacksQuery({enabled: true})
  const {
    data: suggestedFeeds,
    isLoading: isLoadingFeeds,
    error: suggestedFeedsError,
  } = useGetSuggestedFeedsQuery({enabled: true})
  const {
    data: pinnedProfileData,
    isLoading: isPinnedLoading,
    refetch: refetchPinnedProfile,
  } = useProfilesQuery({handles: [PINNED_FOLLOW_SUGGESTION_HANDLE]})
  const pinnedProfile = pinnedProfileData?.profiles[0]
  const {
    profiles,
    onDismiss,
    dismissedDids,
    isLoading,
    isFetchingReplacements,
    error,
    recId,
    refetch,
  } = useSuggestedFollowsByActorWithDismiss({
    did: currentAccount?.did ?? '',
    enabled: !!currentAccount?.did,
    excludeDid: pinnedProfile?.did,
    refillOnDismiss: true,
  })
  const showPinnedProfile =
    !!pinnedProfile &&
    pinnedProfile.did !== currentAccount?.did &&
    !pinnedProfile.viewer?.following &&
    !dismissedDids.includes(pinnedProfile.did)
  const suggestions = profiles.filter(
    suggestion =>
      suggestion.actor.did !== currentAccount?.did &&
      suggestion.actor.did !== pinnedProfile?.did,
  )

  return (
    <Layout.Screen testID="followSuggestionsScreen">
      <Layout.Header.Outer>
        <Layout.Header.BackButton />
        <Layout.Header.Content align="left">
          <Layout.Header.TitleText>Theo dõi</Layout.Header.TitleText>
        </Layout.Header.Content>
        <Layout.Header.Slot />
      </Layout.Header.Outer>
      <Layout.Content
        style={[a.flex_1, {minHeight: 0}, web({overflow: 'clip'})]}
        stickyHeaderIndices={IS_WEB ? undefined : [0]}>
        <View
          style={[
            a.p_lg,
            t.atoms.bg,
            web({position: 'sticky', top: 52, zIndex: 10}),
          ]}>
          <View style={[a.flex_row]} accessibilityRole="tablist">
            <Pressable
              accessibilityRole="tab"
              accessibilityState={{selected: selectedSection === 'accounts'}}
              onPress={() => setSelectedSection('accounts')}
              style={[
                a.flex_1,
                a.align_center,
                a.justify_center,
                a.px_xs,
                a.py_md,
                a.border_b,
                t.atoms.border_contrast_low,
                selectedSection === 'accounts' && {
                  borderBottomWidth: 2,
                  borderBottomColor: t.palette.primary_500,
                },
              ]}>
              <Text style={[a.text_sm, a.font_semi_bold]} numberOfLines={1}>
                <Trans>Accounts</Trans>
              </Text>
            </Pressable>
            <Pressable
              accessibilityRole="tab"
              accessibilityState={{
                selected: selectedSection === 'starterPacks',
              }}
              onPress={() => setSelectedSection('starterPacks')}
              style={[
                a.flex_1,
                a.align_center,
                a.justify_center,
                a.px_xs,
                a.py_md,
                a.border_b,
                t.atoms.border_contrast_low,
                selectedSection === 'starterPacks' && {
                  borderBottomWidth: 2,
                  borderBottomColor: t.palette.primary_500,
                },
              ]}>
              <Text style={[a.text_sm, a.font_semi_bold]} numberOfLines={1}>
                <Trans>Starter Packs</Trans>
              </Text>
            </Pressable>
            <Pressable
              accessibilityRole="tab"
              accessibilityState={{selected: selectedSection === 'feeds'}}
              onPress={() => setSelectedSection('feeds')}
              style={[
                a.flex_1,
                a.align_center,
                a.justify_center,
                a.px_xs,
                a.py_md,
                a.border_b,
                t.atoms.border_contrast_low,
                selectedSection === 'feeds' && {
                  borderBottomWidth: 2,
                  borderBottomColor: t.palette.primary_500,
                },
              ]}>
              <Text style={[a.text_sm, a.font_semi_bold]} numberOfLines={1}>
                <Trans>Feeds</Trans>
              </Text>
            </Pressable>
          </View>
        </View>

        <View style={[a.flex_1, a.p_lg, a.pt_md]}>
          {selectedSection === 'accounts' && (
            <>
              <Text style={[a.text_lg, a.font_semi_bold, a.pb_md]}>
                <Trans>Suggested accounts</Trans>
              </Text>
              {!currentAccount ? (
                <Text style={[a.pt_md, t.atoms.text_contrast_medium]}>
                  <Trans>Sign in to find people to follow.</Trans>
                </Text>
              ) : isLoading || isPinnedLoading || !moderationOpts ? (
                <View style={[a.py_lg]}>
                  <Loader />
                </View>
              ) : error && !showPinnedProfile && !suggestions.length ? (
                <View style={[a.align_center, a.gap_md, a.py_lg]}>
                  <Text style={[t.atoms.text_contrast_medium]}>
                    <Trans>Could not load suggested accounts.</Trans>
                  </Text>
                  <Button
                    label={l`Retry loading suggested accounts`}
                    color="secondary"
                    size="small"
                    onPress={() => {
                      void Promise.all([refetch(), refetchPinnedProfile()])
                    }}>
                    <ButtonText>
                      <Trans>Try again</Trans>
                    </ButtonText>
                  </Button>
                </View>
              ) : showPinnedProfile || suggestions.length ? (
                <>
                  {showPinnedProfile && (
                    <View
                      key={pinnedProfile.did}
                      style={[
                        a.py_md,
                        a.border_b,
                        t.atoms.border_contrast_low,
                      ]}>
                      <FollowSuggestionRow
                        profile={pinnedProfile}
                        moderationOpts={moderationOpts}
                        position={0}
                        onDismiss={onDismiss}
                        compact
                      />
                    </View>
                  )}
                  {suggestions.map((suggestion, index) => (
                    <View
                      key={suggestion.actor.did}
                      style={[
                        a.py_md,
                        a.border_b,
                        t.atoms.border_contrast_low,
                      ]}>
                      <FollowSuggestionRow
                        profile={suggestion.actor}
                        moderationOpts={moderationOpts}
                        position={index + (showPinnedProfile ? 1 : 0)}
                        recId={suggestion.recId ?? recId}
                        onDismiss={onDismiss}
                        compact
                      />
                    </View>
                  ))}
                  {isFetchingReplacements && (
                    <View style={[a.py_lg]}>
                      <Loader />
                    </View>
                  )}
                </>
              ) : (
                <Text style={[a.pt_md, t.atoms.text_contrast_medium]}>
                  <Trans>No suggested accounts right now.</Trans>
                </Text>
              )}
            </>
          )}

          {selectedSection === 'starterPacks' && (
            <>
              <Text style={[a.text_lg, a.font_semi_bold, a.pb_md]}>
                <Trans>Suggested starter packs</Trans>
              </Text>
              {isLoadingStarterPacks ? (
                <View style={[a.py_lg]}>
                  <Loader />
                </View>
              ) : starterPacksError ? (
                <Text style={[a.pt_md, t.atoms.text_contrast_medium]}>
                  <Trans>Could not load suggested starter packs.</Trans>
                </Text>
              ) : suggestedStarterPacks?.starterPacks.length ? (
                suggestedStarterPacks.starterPacks.map(starterPack => (
                  <View key={starterPack.uri} style={[a.pt_md]}>
                    <StarterPackCard view={starterPack} />
                  </View>
                ))
              ) : (
                <Text style={[a.pt_md, t.atoms.text_contrast_medium]}>
                  <Trans>No suggested starter packs right now.</Trans>
                </Text>
              )}
            </>
          )}

          {selectedSection === 'feeds' && (
            <>
              <Text style={[a.text_lg, a.font_semi_bold, a.pb_md]}>
                <Trans>Suggested feeds</Trans>
              </Text>
              {isLoadingFeeds ? (
                <View style={[a.py_lg]}>
                  <Loader />
                </View>
              ) : suggestedFeedsError ? (
                <Text style={[a.pt_md, t.atoms.text_contrast_medium]}>
                  <Trans>Could not load suggested feeds.</Trans>
                </Text>
              ) : suggestedFeeds?.feeds.length ? (
                suggestedFeeds.feeds.map(feed => (
                  <View
                    key={feed.uri}
                    style={[a.py_md, a.border_b, t.atoms.border_contrast_low]}>
                    <FeedCard.Default view={feed} />
                  </View>
                ))
              ) : (
                <Text style={[a.pt_md, t.atoms.text_contrast_medium]}>
                  <Trans>No suggested feeds right now.</Trans>
                </Text>
              )}
            </>
          )}
        </View>
      </Layout.Content>
    </Layout.Screen>
  )
}
