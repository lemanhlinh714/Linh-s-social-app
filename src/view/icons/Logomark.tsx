import {type PathProps} from 'react-native-svg'

import {Logo} from './Logo'

export function Logomark({
  fill,
  width = 32,
  height = width,
  style,
}: {
  fill?: PathProps['fill']
  width?: number
  height?: number
  style?: React.ComponentProps<typeof Logo>['style']
}) {
  return (
    <Logo
      width={width}
      height={height}
      fill={typeof fill === 'string' ? fill : undefined}
      style={style}
    />
  )
}
