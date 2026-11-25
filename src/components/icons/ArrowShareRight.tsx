import {Forward} from 'lucide-react-native'
import {__iconData} from 'lucide-react-native/icons/forward'

import {createLucideIcon} from './createLucideIcon'

export const ArrowShareRight_Stroke2_Corner2_Rounded = Object.assign(
  createLucideIcon(Forward),
  {
    svgPaths: __iconData.node.map(([, attributes]) => String(attributes.d)),
    svgViewBox: '0 0 24 24',
    svgStrokeWidth: 2,
  },
)
