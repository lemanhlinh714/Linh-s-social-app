export type ExternalLinkBrand =
  | 'youtube'
  | 'instagram'
  | 'pixiv'
  | 'facebook'
  | 'x'
  | 'github'
  | 'spotify'
  | 'soundcloud'
  | 'tiktok'
  | 'shopee'
  | 'zalo'
  | 'discord'
  | 'reddit'
  | 'telegram'
  | 'threads'
  | 'mastodon'
  | 'twitch'
  | 'pinterest'
  | 'tumblr'
  | 'snapchat'
  | 'whatsapp'
  | 'generic'

export function getExternalLinkBrand(url: string): ExternalLinkBrand {
  try {
    const normalizedUrl = /^[a-z][a-z\d+.-]*:\/\//i.test(url)
      ? url
      : `https://${url}`
    const hostname = new URL(normalizedUrl).hostname
      .toLowerCase()
      .replace(/^www\./, '')

    if (hostname === 'youtube.com' || hostname === 'youtu.be') return 'youtube'
    if (hostname === 'instagram.com') return 'instagram'
    if (hostname === 'pixiv.net') return 'pixiv'
    if (hostname === 'facebook.com' || hostname === 'fb.com') return 'facebook'
    if (hostname === 'x.com' || hostname === 'twitter.com') return 'x'
    if (hostname === 'github.com') return 'github'
    if (hostname === 'spotify.com' || hostname === 'open.spotify.com') {
      return 'spotify'
    }
    if (hostname === 'soundcloud.com') return 'soundcloud'
    if (hostname === 'tiktok.com' || hostname.endsWith('.tiktok.com')) {
      return 'tiktok'
    }
    if (
      hostname === 'discord.com' ||
      hostname.endsWith('.discord.com') ||
      hostname === 'discord.gg'
    ) {
      return 'discord'
    }
    if (
      hostname === 'reddit.com' ||
      hostname.endsWith('.reddit.com') ||
      hostname === 'redd.it'
    ) {
      return 'reddit'
    }
    if (
      hostname === 't.me' ||
      hostname === 'telegram.me' ||
      hostname === 'telegram.org'
    ) {
      return 'telegram'
    }
    if (hostname === 'threads.net' || hostname.endsWith('.threads.net')) {
      return 'threads'
    }
    if (
      hostname === 'mastodon.social' ||
      hostname === 'mastodon.online' ||
      hostname === 'mastodon.world' ||
      hostname === 'mastodon.art' ||
      hostname === 'mstdn.social'
    ) {
      return 'mastodon'
    }
    if (hostname === 'twitch.tv' || hostname.endsWith('.twitch.tv')) {
      return 'twitch'
    }
    if (hostname === 'pinterest.com' || hostname === 'pin.it') {
      return 'pinterest'
    }
    if (hostname === 'tumblr.com' || hostname.endsWith('.tumblr.com')) {
      return 'tumblr'
    }
    if (
      hostname === 'snapchat.com' ||
      hostname.endsWith('.snapchat.com') ||
      hostname === 't.snapchat.com'
    ) {
      return 'snapchat'
    }
    if (hostname === 'whatsapp.com' || hostname === 'wa.me') {
      return 'whatsapp'
    }
    if (
      hostname === 'shopee.vn' ||
      hostname === 'shopee.com' ||
      hostname === 'shopee.co.th'
    ) {
      return 'shopee'
    }
    if (hostname === 'zalo.me' || hostname === 'zaloapp.com') return 'zalo'

    // Recognize popular Vietnamese services even when their icon package
    // does not provide a brand mark yet; the renderer will use the fallback.
    if (
      hostname === 'lazada.vn' ||
      hostname === 'tiki.vn' ||
      hostname === 'sendo.vn' ||
      hostname === 'chotot.com' ||
      hostname === 'grab.com' ||
      hostname === 'momo.vn' ||
      hostname === 'vnpay.vn'
    ) {
      return 'generic'
    }
  } catch {
    return 'generic'
  }

  return 'generic'
}
