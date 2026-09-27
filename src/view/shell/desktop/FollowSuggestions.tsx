import {View} from 'react-native'
import {Trans, useLingui} from '@lingui/react/macro'

import {useModerationOpts} from '#/state/preferences/moderation-opts'
import {useProfilesQuery} from '#/state/queries/profile'
import {useSuggestedFollowsByActorWithDismiss} from '#/state/queries/suggested-follows'
import {useSession} from '#/state/session'
import {atoms as a, useTheme} from '#/alf'
import {Link} from '#/components/Link'
import {Loader} from '#/components/Loader'
import {Text} from '#/components/Typography'
import {
  FollowSuggestionRow,
  PINNED_FOLLOW_SUGGESTION_HANDLE,
} from '#/features/followSuggestions/FollowSuggestionRow'

export function FollowSuggestions() {
  const t = useTheme()
  const {t: l} = useLingui()
  const {currentAccount} = useSession()
  const moderationOpts = useModerationOpts()
  const {data: pinnedProfileData, isLoading: isPinnedLoading} =
    useProfilesQuery({handles: [PINNED_FOLLOW_SUGGESTION_HANDLE]})
  const pinnedProfile = pinnedProfileData?.profiles[0]
  const {
    profiles,
    onDismiss,
    dismissedDids,
    isLoading,
    isFetchingReplacements,
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
  const recommendations = profiles
    .filter(
      suggestion =>
        suggestion.actor.did !== currentAccount?.did &&
        suggestion.actor.did !== pinnedProfile?.did,
    )
    .slice(0, 3 - (showPinnedProfile ? 1 : 0))

  return (
    <View style={[a.p_lg, a.rounded_md, a.border, t.atoms.border_contrast_low]}>
      <Text style={[a.text_md, a.font_semi_bold, a.pb_md]}>
        <Trans>Gợi ý theo dõi</Trans>
      </Text>
      {showPinnedProfile && moderationOpts && (
        <View
          style={[a.px_xs, a.py_sm, a.border_b, t.atoms.border_contrast_low]}>
          <FollowSuggestionRow
            profile={pinnedProfile}
            moderationOpts={moderationOpts}
            position={0}
            onDismiss={onDismiss}
            compact
          />
        </View>
      )}
      {recommendations.map((suggestion, index) =>
        moderationOpts ? (
          <View
            key={suggestion.actor.did}
            style={[a.px_xs, a.py_sm, a.border_b, t.atoms.border_contrast_low]}>
            <FollowSuggestionRow
              profile={suggestion.actor}
              moderationOpts={moderationOpts}
              position={index + (showPinnedProfile ? 1 : 0)}
              recId={suggestion.recId}
              onDismiss={onDismiss}
              compact
            />
          </View>
        ) : null,
      )}
      {(isLoading ||
        isPinnedLoading ||
        isFetchingReplacements ||
        !moderationOpts) && (
        <View style={[a.py_md]}>
          <Loader />
        </View>
      )}
      <Link to="/connect-people" label={l`Hiển thị thêm`}>
        {({hovered, pressed}) => (
          <Text
            style={[
              a.text_sm,
              a.font_medium,
              a.mt_md,
              hovered || pressed ? t.atoms.text : t.atoms.text_contrast_medium,
            ]}>
            <Trans>Hiển thị thêm</Trans>
          </Text>
        )}
      </Link>
    </View>
  )
}
