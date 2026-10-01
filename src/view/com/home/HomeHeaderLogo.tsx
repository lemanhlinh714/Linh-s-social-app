import {Image} from 'expo-image'
import {useLingui} from '@lingui/react/macro'

import {PressableScale} from '#/lib/custom-animations/PressableScale'

const homeLogo = require('../../../../assets/images/home-logo.png')

export function HomeHeaderLogo({
  size,
  onPress,
}: {
  size: number
  onPress: () => void
}) {
  const {t: l} = useLingui()

  return (
    <PressableScale
      accessibilityLabel={l`Bluesky home`}
      accessibilityHint={l`Press once to scroll to the top, then press again to refresh the feed.`}
      hitSlop={10}
      onPress={onPress}>
      <Image
        source={homeLogo}
        accessible={false}
        accessibilityIgnoresInvertColors
        contentFit="contain"
        style={{width: size, height: size}}
      />
    </PressableScale>
  )
}
