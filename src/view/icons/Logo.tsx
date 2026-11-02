import {View, type StyleProp, type ViewStyle} from 'react-native'

import {flatten} from '#/alf'
import {getBrandName} from '#/lib/brand'
import {useLingui} from '@lingui/react/macro'
import {DandelionMark} from './DandelionMark'

type Props = {
  allowVariants?: boolean
  fill?: string
  size?: number
  style?: StyleProp<ViewStyle>
  height?: number
  width?: number
}

export function Logo({width = 32, height = width, size, style}: Props) {
  const {i18n} = useLingui()
  const resolvedWidth = size ?? Number(width)
  const resolvedHeight = size ?? Number(height)
  const resolvedSize = Math.min(resolvedWidth, resolvedHeight)

  return (
    <View
      accessible
      accessibilityLabel={getBrandName(i18n.locale)}
      accessibilityHint=""
      style={[
        {width: resolvedWidth, height: resolvedHeight, alignItems: 'center', justifyContent: 'center'},
        flatten(style as never),
      ]}>
      <DandelionMark size={resolvedSize} />
    </View>
  )
}
