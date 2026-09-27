import {type StyleProp, View, type ViewStyle} from 'react-native'
import {Trans, useLingui} from '@lingui/react/macro'

import {
  useProgressGuide,
  useProgressGuideControls,
} from '#/state/shell/progress-guide'
import {atoms as a, useTheme} from '#/alf'
import {Button, ButtonIcon} from '#/components/Button'
import {TimesLarge_Stroke2_Corner0_Rounded as Times} from '#/components/icons/Times'
import {Text} from '#/components/Typography'
import {ProgressGuideTask} from './Task'

export function ProgressGuideList({style}: {style?: StyleProp<ViewStyle>}) {
  const t = useTheme()
  const {t: l} = useLingui()
  const guide = useProgressGuide('like-10-and-follow-7')
  const {endProgressGuide} = useProgressGuideControls()

  if (!guide) return null

  return (
    <View
      style={[
        a.flex_col,
        a.gap_md,
        a.rounded_md,
        t.atoms.bg_contrast_50,
        a.p_lg,
        style,
      ]}>
      <View style={[a.flex_row, a.align_center, a.justify_between]}>
        <Text style={[t.atoms.text, a.font_semi_bold, a.text_md]}>
          <Trans>Getting started</Trans>
        </Text>
        <Button
          variant="ghost"
          size="tiny"
          color="secondary"
          shape="round"
          label={l`Dismiss getting started guide`}
          onPress={endProgressGuide}
          style={[a.bg_transparent, {marginTop: -6, marginRight: -6}]}>
          <ButtonIcon icon={Times} size="xs" />
        </Button>
      </View>
      <ProgressGuideTask
        current={guide.numLikes + 1}
        total={11}
        title={l`Like 10 posts`}
        subtitle={l`Teach our algorithm what you like`}
      />
      <ProgressGuideTask
        current={guide.numFollows + 1}
        total={8}
        title={l`Follow 7 accounts`}
        subtitle={l`Bluesky is better with friends!`}
      />
    </View>
  )
}
