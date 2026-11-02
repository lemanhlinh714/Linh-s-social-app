import {i18n} from '@lingui/core'

import {getBrandName} from '#/lib/brand'

export function bskyTitle(page: string, unreadCountLabel?: string) {
  const unreadPrefix = unreadCountLabel ? `(${unreadCountLabel}) ` : ''
  return `${unreadPrefix}${page} — ${getBrandName(i18n.locale)}`
}
