import Svg, {Path} from 'react-native-svg'
import {
  siDiscord,
  siFacebook,
  siGithub,
  siInstagram,
  siMastodon,
  siPinterest,
  siPixiv,
  siReddit,
  siShopee,
  siSnapchat,
  siSoundcloud,
  siSpotify,
  siTelegram,
  siThreads,
  siTiktok,
  siTumblr,
  siTwitch,
  siWhatsapp,
  siX,
  siYoutube,
  siZalo,
} from 'simple-icons'

import {hasExternalLinkTarget} from '#/lib/strings/url-helpers'
import {useTheme} from '#/alf'
import {ChainLink_Stroke2_Corner0_Rounded as ChainLinkIcon} from '#/components/icons/ChainLink'
import {getExternalLinkBrand} from './externalLinkBrand'

const BRAND_ICONS = {
  youtube: siYoutube,
  instagram: siInstagram,
  pixiv: siPixiv,
  facebook: siFacebook,
  x: siX,
  github: siGithub,
  spotify: siSpotify,
  soundcloud: siSoundcloud,
  tiktok: siTiktok,
  shopee: siShopee,
  zalo: siZalo,
  discord: siDiscord,
  reddit: siReddit,
  telegram: siTelegram,
  threads: siThreads,
  mastodon: siMastodon,
  twitch: siTwitch,
  pinterest: siPinterest,
  tumblr: siTumblr,
  snapchat: siSnapchat,
  whatsapp: siWhatsapp,
} as const

export function ExternalLinkIcon({url}: {url: string}) {
  const t = useTheme()

  if (!hasExternalLinkTarget(url)) return null

  const brand = getExternalLinkBrand(url)

  if (brand === 'generic') {
    return (
      <ChainLinkIcon
        width={16}
        height={16}
        fill={t.atoms.text_contrast_medium.color}
        accessibilityElementsHidden
      />
    )
  }

  const icon = BRAND_ICONS[brand]
  if (!icon) {
    return (
      <ChainLinkIcon
        width={16}
        height={16}
        fill={t.atoms.text_contrast_medium.color}
        accessibilityElementsHidden
      />
    )
  }

  const iconColor =
    icon.hex === '000000' ? t.atoms.text_contrast_high.color : `#${icon.hex}`

  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" accessibilityElementsHidden>
      <Path d={icon.path} fill={iconColor} />
    </Svg>
  )
}
