import {useCallback} from 'react'
import {View} from 'react-native'
import {Trans, useLingui} from '@lingui/react/macro'
import {useNavigation} from '@react-navigation/native'

import {type NavigationProp} from '#/lib/routes/types'
import {atoms as a, web} from '#/alf'
import {Button, ButtonText} from '#/components/Button'
import * as Dialog from '#/components/Dialog'
import {useNuxDialogContext} from '#/components/dialogs/nuxs'
import {Text} from '#/components/Typography'

const ADMIN_DID = 'did:plc:gphlz3v6t7p2fi5uniuploi7'

export function AdminContactAnnouncement() {
  const {t: l} = useLingui()
  const navigation = useNavigation<NavigationProp>()
  const nuxDialogs = useNuxDialogContext()
  const control = Dialog.useDialogControl()

  Dialog.useAutoOpen(control)

  const onClose = useCallback(() => {
    nuxDialogs.dismissActiveNux()
  }, [nuxDialogs])

  const onPressAdminProfile = useCallback(() => {
    control.close(() => {
      navigation.navigate('Profile', {name: ADMIN_DID})
    })
  }, [control, navigation])

  return (
    <Dialog.Outer
      control={control}
      onClose={onClose}
      nativeOptions={{preventExpansion: true}}>
      <Dialog.Handle />
      <Dialog.ScrollableInner
        label={l`Thông tin liên hệ quản trị viên`}
        style={[web({maxWidth: 440})]}
        contentContainerStyle={[a.p_xl]}>
        <View style={[a.gap_lg]}>
          <View style={[a.gap_sm]}>
            <Text style={[a.text_xl, a.font_bold]}>
              <Trans>Tôi là quản trị viên của Parley</Trans>
            </Text>
            <Text style={[a.text_md]}>
              <Trans>
                Bạn có góp ý về thuật toán hoặc muốn trao đổi công việc? Hãy
                liên hệ với tôi bất cứ lúc nào.
              </Trans>
            </Text>
            <Text selectable>{ADMIN_DID}</Text>
          </View>
          <Button
            label={l`Xem hồ sơ quản trị viên`}
            size="large"
            color="primary"
            onPress={onPressAdminProfile}>
            <ButtonText>
              <Trans>Xem hồ sơ quản trị viên</Trans>
            </ButtonText>
          </Button>
          <Button
            label={l`Đã hiểu`}
            size="large"
            color="secondary"
            onPress={() => control.close()}>
            <ButtonText>
              <Trans>Đã hiểu</Trans>
            </ButtonText>
          </Button>
        </View>
      </Dialog.ScrollableInner>
    </Dialog.Outer>
  )
}
