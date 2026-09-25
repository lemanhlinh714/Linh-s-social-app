import {useEffect, useState} from 'react'
import {View} from 'react-native'
import {msg} from '@lingui/core/macro'
import {useLingui} from '@lingui/react'

import {atoms as a, useTheme} from '#/alf'
import {InlineLinkText} from '#/components/Link'
import {Text} from '#/components/Typography'
import {
  AD_BOOKING_PROFILE_URL,
  AD_ROTATION_SECONDS,
  MAX_SIDEBAR_ADS,
  SIDEBAR_ADS,
  type SidebarAd,
} from './constants'

export function SidebarAdBanner({
  ads = SIDEBAR_ADS,
  rotationSeconds = AD_ROTATION_SECONDS,
}: {
  ads?: SidebarAd[]
  rotationSeconds?: number
}) {
  const t = useTheme()
  const {_} = useLingui()
  const visibleAds = ads.slice(0, MAX_SIDEBAR_ADS)
  const [activeIndex, setActiveIndex] = useState(0)
  const activeAd = visibleAds[activeIndex] ?? visibleAds[0]
  const adLabel = activeAd?.title || _(msg`Quảng cáo`)
  const bookingLabel = _(msg`Liên hệ để book quảng cáo`)

  useEffect(() => {
    setActiveIndex(0)
  }, [ads])

  useEffect(() => {
    if (visibleAds.length < 2 || rotationSeconds <= 0) return

    const interval = setInterval(() => {
      setActiveIndex(index => (index + 1) % visibleAds.length)
    }, rotationSeconds * 1000)

    return () => clearInterval(interval)
  }, [rotationSeconds, visibleAds.length])

  if (!activeAd) return null

  return (
    <View style={[a.w_full, a.gap_xs]}>
      <View
        accessibilityRole="image"
        accessibilityLabel={adLabel}
        accessibilityHint={activeAd.description || adLabel}
        style={[
          a.w_full,
          a.rounded_md,
          a.border,
          a.p_lg,
          a.justify_center,
          {minHeight: 120},
          t.atoms.border_contrast_low,
          t.atoms.bg_contrast_25,
        ]}>
        <Text
          style={[a.text_sm, a.text_center, t.atoms.text_contrast_low]}
          numberOfLines={2}>
          {adLabel}
        </Text>
        {activeAd.description && (
          <Text
            style={[
              a.mt_xs,
              a.text_xs,
              a.text_center,
              t.atoms.text_contrast_low,
            ]}
            numberOfLines={3}>
            {activeAd.description}
          </Text>
        )}
      </View>
      <InlineLinkText
        to={AD_BOOKING_PROFILE_URL}
        label={bookingLabel}
        style={[a.text_sm, a.text_center]}>
        {bookingLabel}
      </InlineLinkText>
    </View>
  )
}
