import {useCallback, useEffect, useState} from 'react'
import {Linking, View} from 'react-native'
import {useSafeAreaInsets} from 'react-native-safe-area-context'
import {useLingui} from '@lingui/react/macro'
import {useQueryClient} from '@tanstack/react-query'

import {PressableScale} from '#/lib/custom-animations/PressableScale'
import {STALE} from '#/state/queries'
import {profilesQueryKey} from '#/state/queries/profile'
import {useAppviewClient, useSession} from '#/state/session'
import {useSetActiveLanding} from '#/state/shell/landing'
import {
  useLoggedOutView,
  useLoggedOutViewControls,
} from '#/state/shell/logged-out'
import {useEnableMinimalShellMode} from '#/state/shell/minimal-mode'
import {ErrorBoundary} from '#/view/com/util/ErrorBoundary'
import {LoggedOutLayout} from '#/view/com/util/layouts/LoggedOutLayout'
import {Login} from '#/screens/Login'
import {JoinRequest} from '#/screens/Messages/JoinRequest'
import {Signup} from '#/screens/Signup'
import {LandingScreen} from '#/screens/StarterPack/StarterPackLandingScreen'
import {atoms as a, native, tokens, useTheme} from '#/alf'
import {Admonition} from '#/components/Admonition'
import {Button, ButtonIcon, ButtonText} from '#/components/Button'
import {TimesLarge_Stroke2_Corner0_Rounded as XIcon} from '#/components/icons/Times'
import {Text} from '#/components/Typography'
import {useAnalytics} from '#/analytics'
import {IS_WEB} from '#/env'
import {app} from '#/lexicons'
import {SplashScreen} from './SplashScreen'

enum ScreenState {
  S_LoginOrCreateAccount,
  S_Login,
  S_CreateAccount,
  S_ChooseSignupMethod,
  S_StarterPack,
  S_GroupChatJoinRequest,
}
export {ScreenState as LoggedOutScreenState}

function getInitialScreenState(requestedAccountSwitchTo?: string): ScreenState {
  switch (requestedAccountSwitchTo) {
    case 'new':
      return ScreenState.S_ChooseSignupMethod
    case 'starterpack':
      return ScreenState.S_StarterPack
    case 'groupchat':
      return ScreenState.S_GroupChatJoinRequest
    case undefined:
      return ScreenState.S_LoginOrCreateAccount
    default:
      // DID or other string = login with that account
      return ScreenState.S_Login
  }
}

export function LoggedOut({onDismiss}: {onDismiss?: () => void}) {
  const {t: l} = useLingui()
  const ax = useAnalytics()
  const t = useTheme()
  const insets = useSafeAreaInsets()
  useEnableMinimalShellMode()
  const {requestedAccountSwitchTo} = useLoggedOutView()
  const initialScreenState = getInitialScreenState(requestedAccountSwitchTo)
  const [screenState, setScreenState] =
    useState<ScreenState>(initialScreenState)
  const {clearRequestedAccount} = useLoggedOutViewControls()
  const setActiveLanding = useSetActiveLanding()

  const queryClient = useQueryClient()
  const {accounts} = useSession()
  const client = useAppviewClient()
  const [signupChoiceReturnState, setSignupChoiceReturnState] = useState(
    ScreenState.S_LoginOrCreateAccount,
  )

  const onPressCreateAccount = useCallback(() => {
    ax.metric('splash:createAccountPressed', {})
    setSignupChoiceReturnState(screenState)
    setScreenState(ScreenState.S_ChooseSignupMethod)
  }, [ax, screenState])

  const onContinueToBluesky = useCallback(() => {
    if (IS_WEB) {
      window.open(
        'https://bsky.app/',
        'bluesky-signup',
        'popup,width=520,height=760',
      )
    } else {
      void Linking.openURL('https://bsky.app/')
    }
  }, [])

  useEffect(() => {
    const actors = accounts.map(acc => acc.did)
    if (actors.length === 0) return
    void queryClient.prefetchQuery({
      queryKey: profilesQueryKey(actors),
      staleTime: STALE.MINUTES.FIVE,
      queryFn: async () => {
        return await client.call(app.bsky.actor.getProfiles, {actors})
      },
    })
  }, [accounts, client, queryClient])

  const onPressDismiss = useCallback(() => {
    if (onDismiss) {
      onDismiss()
    }
    clearRequestedAccount()
    // Clear landing context when user dismisses the modal
    setActiveLanding(undefined)
  }, [clearRequestedAccount, onDismiss, setActiveLanding])

  /*
   * Back from the login or create-account step. Where it returns depends on how
   * the view was entered:
   * - Entered on the splash or a landing screen (starter pack, group chat
   *   invite): return there, i.e. the screen the user actually saw first.
   * - Dropped directly onto login/create-account (e.g. tapping "Create
   *   account" elsewhere in the app): there is no preceding screen in this
   *   view, so dismiss it. Fall back to the splash when the view cannot be
   *   dismissed (native with no session), since that is its natural root.
   */
  const onPressBack = useCallback(() => {
    if (
      initialScreenState === ScreenState.S_Login ||
      initialScreenState === ScreenState.S_CreateAccount
    ) {
      if (onDismiss) {
        onPressDismiss()
      } else {
        setScreenState(ScreenState.S_LoginOrCreateAccount)
      }
    } else {
      setScreenState(initialScreenState)
    }
  }, [initialScreenState, onDismiss, onPressDismiss])

  return (
    <View
      testID="noSessionView"
      style={[
        a.util_screen_outer,
        t.atoms.bg,
        {paddingTop: insets.top, paddingBottom: insets.bottom},
      ]}>
      <ErrorBoundary>
        {onDismiss && screenState === ScreenState.S_LoginOrCreateAccount ? (
          <Button
            label={l`Go back`}
            variant="solid"
            color="secondary_inverted"
            size="small"
            shape="round"
            PressableComponent={native(PressableScale)}
            style={[
              a.absolute,
              {
                top: insets.top + tokens.space.xl,
                right: tokens.space.xl,
                zIndex: 100,
              },
            ]}
            onPress={onPressDismiss}>
            <ButtonIcon icon={XIcon} />
          </Button>
        ) : null}

        {screenState === ScreenState.S_StarterPack ? (
          <LandingScreen setScreenState={setScreenState} />
        ) : screenState === ScreenState.S_GroupChatJoinRequest ? (
          <JoinRequest setScreenState={setScreenState} />
        ) : screenState === ScreenState.S_LoginOrCreateAccount ? (
          <SplashScreen
            onPressSignin={() => {
              setScreenState(ScreenState.S_Login)
              ax.metric('splash:signInPressed', {})
            }}
            onPressCreateAccount={onPressCreateAccount}
          />
        ) : undefined}
        {screenState === ScreenState.S_Login ? (
          <Login
            onPressBack={onPressBack}
            onPressCreateAccount={onPressCreateAccount}
          />
        ) : undefined}
        {screenState === ScreenState.S_ChooseSignupMethod ? (
          <SignupMethodScreen
            onBack={() => setScreenState(signupChoiceReturnState)}
            onPressLogin={() => setScreenState(ScreenState.S_Login)}
            onContinueToBluesky={onContinueToBluesky}
          />
        ) : undefined}
        {screenState === ScreenState.S_CreateAccount ? (
          <Signup onPressBack={onPressBack} />
        ) : undefined}
      </ErrorBoundary>
    </View>
  )
}

function SignupMethodScreen({
  onBack,
  onPressLogin,
  onContinueToBluesky,
}: {
  onBack: () => void
  onPressLogin: () => void
  onContinueToBluesky: () => void
}) {
  const {i18n, t: l} = useLingui()
  const isVietnamese = i18n.locale === 'vi'
  const [showAppNotice, setShowAppNotice] = useState(false)
  const [showBlueskySignupNotice, setShowBlueskySignupNotice] =
    useState(false)

  return (
    <LoggedOutLayout
      leadin={isVietnamese ? 'Tham gia trò chuyện' : l`Join the conversation`}
      title={isVietnamese ? 'Tạo tài khoản' : l`Create an account`}
      description={
        isVietnamese
          ? 'Chọn nơi bạn muốn tạo tài khoản.'
          : l`Choose where you want to create your account.`
      }
      scrollable>
      <View style={[a.gap_md, a.px_xl, a.pt_2xl]}>
        <Button
          testID="createBlueskyAccountButton"
          label={
            isVietnamese
              ? 'Tạo tài khoản Bluesky'
              : l`Create an account with Bluesky`
          }
          color="primary"
          size="large"
          onPress={() => {
            onContinueToBluesky()
            setShowBlueskySignupNotice(true)
          }}>
          <ButtonText>
            {isVietnamese ? 'Tạo bằng Bluesky' : l`Create with Bluesky`}
          </ButtonText>
        </Button>

        {showBlueskySignupNotice && (
          <Admonition type="tip">
            <Text>
              {isVietnamese
                ? 'Hãy đăng ký trong cửa sổ Bluesky vừa mở. Khi đăng ký xong, đóng cửa sổ đó, quay lại đây, chọn Đăng nhập và nhập tài khoản Bluesky của bạn. App chưa thể tự nhận kết quả đăng ký từ cửa sổ Bluesky.'
                : l`Finish signing up in the Bluesky window. When you're done, close it, return here, choose Sign in, and enter your Bluesky account. This app can't automatically receive the signup result from that window.`}
            </Text>
          </Admonition>
        )}

        <Button
          testID="createAppAccountButton"
          label={
            isVietnamese
              ? 'Tạo tài khoản bằng ứng dụng này'
              : l`Create an account with this app`
          }
          color="secondary"
          size="large"
          onPress={() => {
            setShowAppNotice(true)
          }}>
          <ButtonText>
            {isVietnamese ? 'Tạo bằng ứng dụng này' : l`Create with this app`}
          </ButtonText>
        </Button>

        {showAppNotice && (
          <Admonition type="tip">
            <Text>
              {isVietnamese
                ? 'Tính năng tạo tài khoản bằng ứng dụng này đang được cập nhật và hiện chưa khả dụng.'
                : l`Account creation in this app is being updated and is not available yet.`}
            </Text>
          </Admonition>
        )}

        <Button
          testID="signupMethodLoginButton"
          label={
            isVietnamese
              ? 'Đã có tài khoản? Đăng nhập'
              : l`Already have an account? Sign in`
          }
          color="secondary"
          size="large"
          onPress={onPressLogin}>
          <ButtonText>
            {isVietnamese
              ? 'Đã có tài khoản? Đăng nhập'
              : l`Already have an account? Sign in`}
          </ButtonText>
        </Button>

        <Button
          label={isVietnamese ? 'Quay lại' : l`Back`}
          color="secondary"
          size="large"
          onPress={onBack}>
          <ButtonText>{isVietnamese ? 'Quay lại' : l`Back`}</ButtonText>
        </Button>
      </View>
    </LoggedOutLayout>
  )
}
