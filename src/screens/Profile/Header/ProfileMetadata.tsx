import {View} from 'react-native'
import {msg} from '@lingui/core/macro'
import {useLingui} from '@lingui/react'

import {hasExternalLinkTarget} from '#/lib/strings/url-helpers'
import {useProfileMetadataQuery} from '#/state/queries/profile-metadata'
import {atoms as a, useTheme} from '#/alf'
import {PinLocation_Stroke2_Corner0_Rounded as PinLocation} from '#/components/icons/PinLocation'
import {Link} from '#/components/Link'
import {Text} from '#/components/Typography'
import {ExternalLinkIcon} from './ExternalLinkIcon'

export function ProfileMetadata({did}: {did: string}) {
  const t = useTheme()
  const {_} = useLingui()
  const {data} = useProfileMetadataQuery(did)
  const links =
    data?.links.filter(link => hasExternalLinkTarget(link.url)) ?? []

  if (!data || (!data.location && links.length === 0)) return null

  return (
    <View style={[a.flex_row, a.flex_wrap, a.gap_md]}>
      {data.location && (
        <View style={[a.flex_row, a.align_center, a.gap_xs]}>
          <PinLocation
            width={16}
            height={16}
            fill={t.atoms.text_contrast_medium.color}
          />
          <Text style={[a.text_sm, t.atoms.text_contrast_medium]}>
            {data.location}
          </Text>
        </View>
      )}
      {links.map(link => {
        const url = link.url.trim()
        const name = link.label.trim() || url

        return (
          <Link
            key={`${name}:${url}`}
            to={url}
            label={_(msg`Open ${name}`)}
            style={[a.self_start]}>
            {({hovered}) => (
              <View style={[a.flex_row, a.align_center, a.gap_xs]}>
                <ExternalLinkIcon url={url} />
                <Text
                  style={[
                    a.text_sm,
                    t.atoms.text_contrast_medium,
                    hovered && a.underline,
                  ]}
                  numberOfLines={1}>
                  {name}
                </Text>
              </View>
            )}
          </Link>
        )
      })}
    </View>
  )
}
