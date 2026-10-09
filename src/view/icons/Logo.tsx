import {forwardRef} from 'react'
import {type SvgProps} from 'react-native-svg'
import {Image, type ImageProps} from 'expo-image'

import {flatten} from '#/alf'

type Props = {
  allowVariants?: boolean
  fill?: string
  size?: number
  style?: SvgProps['style']
} & Pick<SvgProps, 'height' | 'width'>

export const Logo = forwardRef<React.ComponentRef<typeof Image>, Props>(
  function LogoImpl(props, ref) {
    const {width = 32, height = width, size, style} = props
    const resolvedWidth = size ?? Number(width)
    const resolvedHeight = size ?? Number(height)

    return (
      <Image
        ref={ref}
        source={require('../../../assets/logo.png')}
        accessibilityLabel="Spacedog"
        accessibilityHint=""
        accessibilityIgnoresInvertColors
        contentFit="contain"
        style={[
          {width: resolvedWidth, height: resolvedHeight},
          flatten(style as never),
        ]}
      />
    )
  },
)
