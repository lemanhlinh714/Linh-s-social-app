import {View} from 'react-native'
import {Trans, useLingui} from '@lingui/react/macro'

import {atoms as a, useTheme} from '#/alf'
import {Button, ButtonIcon} from '#/components/Button'
import {PersonPlus_Stroke2_Corner0_Rounded as PersonPlusIcon} from '#/components/icons/Person'
import {Link} from '#/components/Link'
import {Text} from '#/components/Typography'

export function FollowSuggestions() {
  const t = useTheme()
  const {t: l} = useLingui()

  return (
    <View style={[a.p_lg, a.rounded_md, a.border, t.atoms.border_contrast_low]}>
      <Text style={[a.text_md, a.font_semi_bold, a.pb_md]}>
        <Trans>Gợi ý theo dõi</Trans>
      </Text>
      <View style={[a.flex_row, a.align_center, a.gap_sm]}>
        <View
          style={[
            a.align_center,
            a.justify_center,
            a.rounded_full,
            t.atoms.bg_contrast_50,
            {width: 40, height: 40},
          ]}>
          <Text style={[a.font_semi_bold]}>L</Text>
        </View>
        <View style={[a.flex_1]}>
          <Text style={[a.text_sm, a.font_semi_bold]} numberOfLines={1}>
            Lê Mạnh Linh
          </Text>
          <Text
            style={[a.text_xs, t.atoms.text_contrast_medium]}
            numberOfLines={1}>
            @lelinh1.bsky.social
          </Text>
        </View>
        <Button
          label={l`Theo dõi @lelinh1.bsky.social`}
          disabled
          color="secondary"
          size="small"
          shape="round">
          <ButtonIcon icon={PersonPlusIcon} />
        </Button>
      </View>
      <Link to="/connect-people" label={l`Hiển thị thêm`}>
        {({hovered, pressed}) => (
          <Text
            style={[
              a.text_sm,
              a.font_medium,
              a.mt_md,
              hovered || pressed ? t.atoms.text : t.atoms.text_contrast_medium,
            ]}>
            <Trans>Hiển thị thêm</Trans>
          </Text>
        )}
      </Link>
    </View>
  )
}
