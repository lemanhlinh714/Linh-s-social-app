import {useLingui} from '@lingui/react/macro'

import {PressableScale} from '#/lib/custom-animations/PressableScale'
import {getBrandName} from '#/lib/brand'
import {DandelionMark} from '#/view/icons/DandelionMark'

export function HomeHeaderLogo({
  size,
  onPress,
}: {
  size: number
  onPress: () => void
}) {
  const {t: l, i18n} = useLingui()

  return (
    <PressableScale
      accessibilityLabel={l`${getBrandName(i18n.locale)} home`}
      accessibilityHint={l`Press once to scroll to the top, then press again to refresh the feed.`}
      hitSlop={10}
      onPress={onPress}>
      <DandelionMark size={size} />
    </PressableScale>
  )
}
