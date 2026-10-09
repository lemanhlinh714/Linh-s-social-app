import {type StyleProp, type TextStyle} from 'react-native'

import {useTheme} from '#/alf'
import {Text} from '#/components/Typography'

export function SpacedogWordmark({
  fill,
  width = 64,
  style,
}: {
  fill?: string
  width?: number
  style?: StyleProp<TextStyle>
}) {
  const t = useTheme()
  const fontSize = width * 0.22

  return (
    <Text
      style={[
        {
          color: fill || t.atoms.text.color,
          fontSize,
          lineHeight: fontSize * 1.2,
          fontWeight: '700',
        },
        style,
      ]}>
      Spacedog
    </Text>
  )
}
