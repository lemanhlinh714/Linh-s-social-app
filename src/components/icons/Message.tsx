import {
  MessageCircle,
  MessageCirclePlus,
  MessageSquare,
} from 'lucide-react-native'

import {createLucideIcon} from './createLucideIcon'

export const Message_Stroke1_Corner0_Rounded_Filled = createLucideIcon(
  MessageSquare,
  {strokeWidth: 1},
)

export const Message_Stroke2_Corner0_Rounded_Filled = createLucideIcon(
  MessageCircle,
  {filled: true},
)

export const Message_Stroke2_Corner0_Rounded = createLucideIcon(MessageCircle)

export const MessagePlus_Stroke2_Corner0_Rounded =
  createLucideIcon(MessageCirclePlus)
