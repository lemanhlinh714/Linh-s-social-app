import {type StyleProp, type TextStyle} from 'react-native'

import {BrandWordmark} from './BrandWordmark'

export function Logotype({
  fill,
  width = 64,
  style,
}: {
  fill?: string
  width?: number
  style?: StyleProp<TextStyle>
}) {
  return <BrandWordmark width={width} fill={fill} style={style} />
}
