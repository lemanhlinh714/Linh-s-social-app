import {View} from 'react-native'
import {Trans, useLingui} from '@lingui/react/macro'

import {
  type AllNavigatorParams,
  type NativeStackScreenProps,
} from '#/lib/routes/types'
import {useModerationOpts} from '#/state/preferences/moderation-opts'
import {useProfilesQuery} from '#/state/queries/profile'
import {useSuggestedFollowsByActorWithDismiss} from '#/state/queries/suggested-follows'
import {useSession} from '#/state/session'
import {atoms as a, useTheme} from '#/alf'
import {Button, ButtonText} from '#/components/Button'
import * as Layout from '#/components/Layout'
import {Loader} from '#/components/Loader'
import {Text} from '#/components/Typography'
import {
  FollowSuggestionRow,
  PINNED_FOLLOW_SUGGESTION_HANDLE,
} from '#/features/followSuggestions/FollowSuggestionRow'

type Props = NativeStackScreenProps<AllNavigatorParams, 'FollowSuggestions'>

export function FollowSuggestionsScreen({}: Props) {
  const t = useTheme()
  const {t: l} = useLingui()
  const {currentAccount} = useSession()
  const moderationOpts = useModerationOpts()
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
      <Layout.Content style={[a.flex_1]}>
        {!currentAccount ? (
          <Text style={[a.p_lg, t.atoms.text_contrast_medium]}>
            <Trans>Sign in to find people to follow.</Trans>
          </Text>
        ) : isLoading || isPinnedLoading || !moderationOpts ? (
          <View style={[a.p_lg]}>
            <Loader />
          </View>
        ) : error && !showPinnedProfile && !suggestions.length ? (
          <View style={[a.align_center, a.gap_md, a.p_lg]}>
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
                  a.px_lg,
                  a.py_md,
                  a.border_b,
                  t.atoms.border_contrast_low,
                ]}>
                <FollowSuggestionRow
                  profile={pinnedProfile}
                  moderationOpts={moderationOpts}
                  position={0}
                  onDismiss={onDismiss}
                />
              </View>
            )}
            {suggestions.map((suggestion, index) => (
              <View
                key={suggestion.actor.did}
                style={[
                  a.px_lg,
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
                />
              </View>
            ))}
            {isFetchingReplacements && (
              <View style={[a.p_lg]}>
                <Loader />
              </View>
            )}
          </>
        ) : (
          <Text style={[a.p_lg, t.atoms.text_contrast_medium]}>
            <Trans>No suggested accounts right now.</Trans>
          </Text>
        )}
      </Layout.Content>
    </Layout.Screen>
  )
}
