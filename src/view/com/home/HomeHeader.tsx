import {useCallback, useEffect, useMemo, useRef, useState} from 'react'
import {useNavigation} from '@react-navigation/native'

import {type NavigationProp} from '#/lib/routes/types'
import {emitScrollToTop} from '#/state/events'
import {type FeedSourceInfo} from '#/state/queries/feed'
import {useSession} from '#/state/session'
import {type RenderTabBarFnProps} from '#/view/com/pager/Pager'
import {TabBar} from '../pager/TabBar'
import {HomeHeaderLayout} from './HomeHeaderLayout'

export function HomeHeader(
  props: RenderTabBarFnProps & {
    testID?: string
    onPressSelected: () => void
    feeds: FeedSourceInfo[]
  },
) {
  const {feeds, onSelect: onSelectProp} = props
  const {hasSession} = useSession()
  const navigation = useNavigation<NavigationProp>()
  const [didScrollToTop, setDidScrollToTop] = useState(false)
  const previousPage = useRef(props.selectedPage)

  useEffect(() => {
    if (previousPage.current !== props.selectedPage) {
      previousPage.current = props.selectedPage
      setDidScrollToTop(false)
    }
  }, [props.selectedPage])

  const hasPinnedCustom = useMemo<boolean>(() => {
    if (!hasSession) return false
    return feeds.some(tab => {
      const isFollowing = tab.uri === 'following'
      return !isFollowing
    })
  }, [feeds, hasSession])

  const items = useMemo(() => {
    const pinnedNames = feeds.map(f => f.displayName)
    if (!hasPinnedCustom) {
      return pinnedNames.concat('Feeds ✨')
    }
    return pinnedNames
  }, [hasPinnedCustom, feeds])

  const onPressFeedsLink = useCallback(() => {
    navigation.navigate('Feeds')
  }, [navigation])

  const onPressLogo = useCallback(() => {
    if (didScrollToTop) {
      setDidScrollToTop(false)
      props.onPressSelected()
    } else {
      setDidScrollToTop(true)
      emitScrollToTop()
    }
  }, [didScrollToTop, props.onPressSelected])

  const onPressSelected = useCallback(() => {
    setDidScrollToTop(false)
    props.onPressSelected()
  }, [props.onPressSelected])

  const onSelect = useCallback(
    (index: number) => {
      setDidScrollToTop(false)
      if (!hasPinnedCustom && index === items.length - 1) {
        onPressFeedsLink()
      } else if (onSelectProp) {
        onSelectProp(index)
      }
    },
    [items.length, onPressFeedsLink, onSelectProp, hasPinnedCustom],
  )

  return (
    <HomeHeaderLayout
      tabBarAnchor={props.tabBarAnchor}
      onPressLogo={onPressLogo}>
      <TabBar
        key={items.join(',')}
        onPressSelected={onPressSelected}
        selectedPage={props.selectedPage}
        onSelect={onSelect}
        testID={props.testID}
        items={items}
        dragProgress={props.dragProgress}
        dragState={props.dragState}
        transparent
      />
    </HomeHeaderLayout>
  )
}
