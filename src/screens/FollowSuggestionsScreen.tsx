import {View} from 'react-native'

import {
  type AllNavigatorParams,
  type NativeStackScreenProps,
} from '#/lib/routes/types'
import {atoms as a, useTheme} from '#/alf'
import {Button, ButtonIcon, ButtonText} from '#/components/Button'
import {PersonPlus_Stroke2_Corner0_Rounded as PersonPlusIcon} from '#/components/icons/Person'
import * as Layout from '#/components/Layout'
import {Text} from '#/components/Typography'

const SUGGESTED_HANDLE = '@lelinh1.bsky.social'

type Props = NativeStackScreenProps<AllNavigatorParams, 'FollowSuggestions'>

export function FollowSuggestionsScreen({}: Props) {
  const t = useTheme()

  return (
    <Layout.Screen>
      <Layout.Header.Outer>
        <Layout.Header.BackButton />
        <Layout.Header.Content align="left">
          <Layout.Header.TitleText>Theo dõi</Layout.Header.TitleText>
        </Layout.Header.Content>
        <Layout.Header.Slot />
      </Layout.Header.Outer>
      <View style={[a.p_lg]}>
        <View style={[a.flex_row, a.align_center, a.gap_md]}>
          <View
            style={[
              a.align_center,
              a.justify_center,
              a.rounded_full,
              t.atoms.bg_contrast_50,
              {width: 48, height: 48},
            ]}>
            <Text style={[a.font_semi_bold]}>L</Text>
          </View>
          <View style={[a.flex_1]}>
            <Text style={[a.font_semi_bold]}>Lê Mạnh Linh</Text>
            <Text style={[a.text_sm, t.atoms.text_contrast_medium]}>
              {SUGGESTED_HANDLE}
            </Text>
          </View>
          <Button
            label={`Theo dõi ${SUGGESTED_HANDLE}`}
            disabled
            color="secondary"
            size="small">
            <ButtonIcon icon={PersonPlusIcon} />
            <ButtonText>Theo dõi</ButtonText>
          </Button>
        </View>
      </View>
    </Layout.Screen>
  )
}
