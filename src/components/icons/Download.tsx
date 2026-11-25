import DownloadIcon, {__iconData} from 'lucide-react-native/icons/download'

import {createLucideIcon} from './createLucideIcon'

export const Download_Stroke2_Corner0_Rounded = Object.assign(
  createLucideIcon(DownloadIcon),
  {
    svgPaths: __iconData.node.map(([, attributes]) => String(attributes.d)),
    svgViewBox: '0 0 24 24',
    svgStrokeWidth: 2,
  },
)
