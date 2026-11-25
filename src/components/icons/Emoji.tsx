import {Frown, Heart, Laugh, Smile} from 'lucide-react-native'

import {createLucideIcon} from './createLucideIcon'

export const EmojiSad_Stroke2_Corner0_Rounded = createLucideIcon(Frown)

export const EmojiSmile_Stroke2_Corner0_Rounded = createLucideIcon(Smile)

export const EmojiArc_Stroke2_Corner0_Rounded = createLucideIcon(Laugh)

export const EmojiHeartEyes_Stroke2_Corner0_Rounded = createLucideIcon(Heart, {
  filled: true,
})
