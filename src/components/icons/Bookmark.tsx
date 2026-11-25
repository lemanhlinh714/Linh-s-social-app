import {Bookmark as LucideBookmark, BookmarkX} from 'lucide-react-native'

import {createLucideIcon} from './createLucideIcon'

export const Bookmark = createLucideIcon(LucideBookmark)

export const BookmarkFilled = createLucideIcon(LucideBookmark, {filled: true})

export const BookmarkDeleteLarge = createLucideIcon(BookmarkX)
