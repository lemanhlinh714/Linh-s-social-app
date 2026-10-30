import {type StyleProp, type TextStyle} from 'react-native'

import {useTheme} from '#/alf'
import {getBrandName} from '#/lib/brand'
import {Text} from '#/components/Typography'
import {useLingui} from '@lingui/react/macro'

export function BrandWordmark({
  fill,
  width = 64,
  style,
}: {
  fill?: string
  width?: number
  style?: StyleProp<TextStyle>
}) {
  const t = useTheme()
  const {i18n} = useLingui()
  const brandName = getBrandName(i18n.locale)
  const fontSize = width * (brandName.length > 10 ? 0.16 : 0.2)

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
      {brandName}
    </Text>
  )
}