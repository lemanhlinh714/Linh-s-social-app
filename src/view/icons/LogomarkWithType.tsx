import {View, type StyleProp, type ViewStyle} from 'react-native'

import {DandelionMark} from './DandelionMark'
import {BrandWordmark} from './BrandWordmark'

export function LogomarkWithType({
  fill,
  width = 136,
  style,
}: {
  fill?: string
  width?: number
  style?: StyleProp<ViewStyle>
}) {
  return (
    <View style={[{flexDirection: 'row', alignItems: 'center', gap: width * 0.06}, style]}>
      <DandelionMark size={width * 0.24} />
      <BrandWordmark width={width * 0.68} fill={fill} />
    </View>
  )
}
