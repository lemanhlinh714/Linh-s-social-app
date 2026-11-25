import {
  UserRound,
  UserRoundCheck,
  UserRoundPlus,
  UserRoundX,
  UsersRound,
} from 'lucide-react-native'

import {createLucideIcon} from './createLucideIcon'

export const Person_Stroke2_Corner0_Rounded = createLucideIcon(UserRound)

export const Person_Stroke2_Corner2_Rounded = createLucideIcon(UserRound)

export const PersonCheck_Stroke2_Corner0_Rounded =
  createLucideIcon(UserRoundCheck)

export const PersonX_Stroke2_Corner0_Rounded = createLucideIcon(UserRoundX)

export const PersonX_Stroke2_Corner0_Rounded_Large =
  createLucideIcon(UserRoundX)

export const PersonPlus_Stroke2_Corner0_Rounded =
  createLucideIcon(UserRoundPlus)

export const PersonPlus_Filled_Stroke2_Corner0_Rounded = createLucideIcon(
  UserRoundPlus,
  {filled: true},
)

export const PersonPlus_Stroke2_Corner2_Rounded =
  createLucideIcon(UserRoundPlus)

export const PersonGroup_Stroke2_Corner2_Rounded = createLucideIcon(UsersRound)

export const Person_Filled_Corner2_Rounded = createLucideIcon(UserRound, {
  filled: true,
})
