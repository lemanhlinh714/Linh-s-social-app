import {View} from 'react-native'
import {type ModerationOpts} from '@bsky/sdk/moderation'
import {useLingui} from '@lingui/react/macro'

import {atoms as a} from '#/alf'
import {Button, ButtonIcon} from '#/components/Button'
import {TimesLarge_Stroke2_Corner0_Rounded as DismissIcon} from '#/components/icons/Times'
import * as ProfileCard from '#/components/ProfileCard'
import {useAnalytics} from '#/analytics'
import type * as bsky from '#/types/bsky'

export const PINNED_FOLLOW_SUGGESTION_HANDLE = 'lelinh1.bsky.social'

export function FollowSuggestionRow({
  profile,
  moderationOpts,
  position,
  recId,
  onDismiss,
  compact = false,
}: {
  profile: bsky.profile.AnyProfileView
  moderationOpts: ModerationOpts
  position: number
  recId?: string
  onDismiss: (did: string) => void
  compact?: boolean
}) {
  const {t: l} = useLingui()
  const ax = useAnalytics()

  const dismiss = () => {
    onDismiss(profile.did)
    ax.metric('suggestedUser:dismiss', {
      logContext: 'ProfileInterstitial',
      position,
      suggestedDid: profile.did,
      recId,
    })
  }

  return (
    <ProfileCard.Outer>
      <ProfileCard.Header>
        <View style={[{width: 40, height: 40, flexShrink: 0}]}>
          <ProfileCard.Avatar
            profile={profile}
            moderationOpts={moderationOpts}
            size={40}
          />
        </View>
        <ProfileCard.Link
          profile={profile}
          style={[
            a.flex_1,
            {minWidth: 0, overflow: 'hidden', alignItems: 'stretch'},
          ]}>
          <ProfileCard.NameAndHandle
            profile={profile}
            moderationOpts={moderationOpts}
          />
        </ProfileCard.Link>
        <Button
          label={l`Dismiss this suggestion`}
          color="secondary"
          size="small"
          shape="round"
          onPress={event => {
            event.preventDefault()
            event.stopPropagation()
            dismiss()
          }}>
          <ButtonIcon icon={DismissIcon} />
        </Button>
        <ProfileCard.FollowButton
          profile={profile}
          moderationOpts={moderationOpts}
          logContext="ProfileCard"
          position={position}
          withIcon={compact ? true : false}
          shape={compact ? 'round' : undefined}
          onFollow={() => {
            ax.metric('suggestedUser:follow', {
              logContext: 'ProfileInterstitial',
              location: 'Card',
              recId,
              position,
              suggestedDid: profile.did,
              category: null,
            })
            onDismiss(profile.did)
          }}
        />
      </ProfileCard.Header>
      <ProfileCard.Link profile={profile}>
        <ProfileCard.Description
          profile={profile}
          numberOfLines={compact ? 1 : 2}
        />
      </ProfileCard.Link>
    </ProfileCard.Outer>
  )
}
