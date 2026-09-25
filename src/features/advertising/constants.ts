export const AD_BOOKING_PROFILE = 'lelinh1.bsky.social'
export const AD_BOOKING_PROFILE_URL = `/profile/${AD_BOOKING_PROFILE}`
export const AD_ROTATION_SECONDS = 15
export const MAX_SIDEBAR_ADS = 5

export type SidebarAd = {
  id: string
  title?: string
  description?: string
  targetUrl?: string
}

export const SIDEBAR_ADS: SidebarAd[] = [
  {
    id: 'placeholder',
  },
]
