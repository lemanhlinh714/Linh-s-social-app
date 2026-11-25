import {forwardRef} from 'react'
import {StyleSheet} from 'react-native'
import type Svg from 'react-native-svg'
import {type LucideIcon} from 'lucide-react-native'

import {useTheme} from '#/alf'
import {type Props, sizes} from './common'

export function createLucideIcon(
  Icon: LucideIcon,
  {
    strokeWidth = 2,
    filled = false,
  }: {strokeWidth?: number; filled?: boolean} = {},
) {
  const IconWithRef = Icon as React.ComponentType<
    React.ComponentProps<LucideIcon> & React.RefAttributes<Svg>
  >
  const Adapter = forwardRef<Svg, Props>(function LucideIconAdapter(
    {fill, size = 'md', gradient: _gradient, style, ...rest},
    ref,
  ) {
    const t = useTheme()
    const color =
      (typeof fill === 'string' ? fill : undefined) ??
      StyleSheet.flatten(style)?.color ??
      t.palette.primary_500

    return (
      <IconWithRef
        {...rest}
        color={color}
        fill={filled ? color : 'none'}
        ref={ref}
        size={sizes[size]}
        strokeWidth={strokeWidth}
        style={style}
      />
    )
  })
  return Object.assign(Adapter, {
    svgPaths: [] as string[],
    svgViewBox: '0 0 24 24',
    svgStrokeWidth: strokeWidth,
  })
}
