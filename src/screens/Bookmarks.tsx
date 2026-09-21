import {useCallback, useMemo, useState} from 'react'
import {Pressable, View} from 'react-native'
import {type $Typed} from '@atproto/lex'
import {msg} from '@lingui/core/macro'
import {useLingui} from '@lingui/react'
import {Trans} from '@lingui/react/macro'
import {
  type NavigationProp,
  useFocusEffect,
  useNavigation,
} from '@react-navigation/native'

import {useInitialNumToRender} from '#/lib/hooks/useInitialNumToRender'
import {usePostViewTracking} from '#/lib/hooks/usePostViewTracking'
import {
  type CommonNavigatorParams,
  type NativeStackScreenProps,
} from '#/lib/routes/types'
import {cleanError} from '#/lib/strings/errors'
import {useBookmarkMutation} from '#/state/queries/bookmarks/useBookmarkMutation'
import {useBookmarksQuery} from '#/state/queries/bookmarks/useBookmarksQuery'
import {useSession} from '#/state/session'
import {Post} from '#/view/com/post/Post'
import {PostFeed} from '#/view/com/posts/PostFeed'
import {EmptyState} from '#/view/com/util/EmptyState'
import {List} from '#/view/com/util/List'
import {PostFeedLoadingPlaceholder} from '#/view/com/util/LoadingPlaceholder'
import {atoms as a, useTheme, web} from '#/alf'
import {Button, ButtonIcon, ButtonText} from '#/components/Button'
import {BookmarkDeleteLarge, BookmarkFilled} from '#/components/icons/Bookmark'
import {CircleQuestion_Stroke2_Corner2_Rounded as QuestionIcon} from '#/components/icons/CircleQuestion'
import {Heart2_Stroke1_Corner0_Rounded as HeartIcon} from '#/components/icons/Heart2'
import * as Layout from '#/components/Layout'
import {ListFooter} from '#/components/Lists'
import * as Skele from '#/components/Skeleton'
import * as toast from '#/components/Toast'
import {Text} from '#/components/Typography'
import {useAnalytics} from '#/analytics'
import {IS_IOS} from '#/env'
import {app} from '#/lexicons'
import * as bsky from '#/types/bsky'

type Props = NativeStackScreenProps<CommonNavigatorParams, 'Bookmarks'>

export function BookmarksScreen({}: Props) {
  const ax = useAnalytics()
  const {_, i18n} = useLingui()
  const t = useTheme()
  const [tab, setTab] = useState<'saved' | 'liked'>('saved')
  const isVietnamese = i18n.locale.startsWith('vi')
  const savedLabel = isVietnamese ? 'Đã lưu' : _(msg`Saved`)
  const likedLabel = isVietnamese ? 'Đã thích' : _(msg`Likes`)
  const savedPostsLabel = isVietnamese ? 'Bài viết đã lưu' : _(msg`Saved Posts`)

  useFocusEffect(
    useCallback(() => {
      ax.metric('bookmarks:view', {})
    }, [ax]),
  )

  return (
    <Layout.Screen testID="bookmarksScreen">
      <Layout.Header.Outer>
        <Layout.Header.BackButton />
        <Layout.Header.Content>
          <Layout.Header.TitleText>{savedPostsLabel}</Layout.Header.TitleText>
        </Layout.Header.Content>
        <Layout.Header.Slot />
      </Layout.Header.Outer>
      <Layout.Center style={web([a.sticky, {top: 52}, a.z_10, t.atoms.bg])}>
        <View
          accessibilityRole="tablist"
          style={[
            a.flex_row,
            t.atoms.border_contrast_low,
            {borderBottomWidth: 1},
          ]}>
          <Pressable
            accessibilityRole="tab"
            accessibilityState={{selected: tab === 'saved'}}
            onPress={() => setTab('saved')}
            style={[a.flex_1, a.align_center, a.justify_center, {height: 52}]}>
            <Text
              style={[
                a.text_md,
                a.font_semi_bold,
                tab === 'saved' ? t.atoms.text : t.atoms.text_contrast_medium,
              ]}>
              {savedLabel}
            </Text>
            {tab === 'saved' && (
              <View
                style={[
                  a.absolute,
                  {bottom: -1, height: 3, left: '15%', right: '15%'},
                  {backgroundColor: t.palette.primary_500},
                ]}
              />
            )}
          </Pressable>
          <Pressable
            accessibilityRole="tab"
            accessibilityState={{selected: tab === 'liked'}}
            onPress={() => setTab('liked')}
            style={[a.flex_1, a.align_center, a.justify_center, {height: 52}]}>
            <Text
              style={[
                a.text_md,
                a.font_semi_bold,
                tab === 'liked' ? t.atoms.text : t.atoms.text_contrast_medium,
              ]}>
              {likedLabel}
            </Text>
            {tab === 'liked' && (
              <View
                style={[
                  a.absolute,
                  {bottom: -1, height: 3, left: '15%', right: '15%'},
                  {backgroundColor: t.palette.primary_500},
                ]}
              />
            )}
          </Pressable>
        </View>
      </Layout.Center>
      {tab === 'saved' ? <BookmarksInner /> : <LikedPostsInner />}
    </Layout.Screen>
  )
}

function LikedPostsInner() {
  const {_, i18n} = useLingui()
  const {currentAccount} = useSession()
  const emptyMessage = i18n.locale.startsWith('vi')
    ? 'Chưa có bài viết đã thích'
    : _(msg`No likes yet`)

  if (!currentAccount) return null

  return (
    <PostFeed
      feed={`likes|${currentAccount.did}`}
      renderEmptyState={() => (
        <EmptyState
          icon={HeartIcon}
          message={emptyMessage}
          style={[a.pt_3xl]}
        />
      )}
    />
  )
}

type ListItem =
  | {
      type: 'loading'
      key: 'loading'
    }
  | {
      type: 'empty'
      key: 'empty'
    }
  | {
      type: 'bookmark'
      key: string
      bookmark: Omit<app.bsky.bookmark.defs.BookmarkView, 'item'> & {
        item: $Typed<app.bsky.feed.defs.PostView>
      }
    }
  | {
      type: 'bookmarkNotFound'
      key: string
      bookmark: Omit<app.bsky.bookmark.defs.BookmarkView, 'item'> & {
        item: $Typed<app.bsky.feed.defs.NotFoundPost>
      }
    }

function BookmarksInner() {
  const initialNumToRender = useInitialNumToRender()
  const [isPTRing, setIsPTRing] = useState(false)
  const trackPostView = usePostViewTracking('Bookmarks')
  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    error,
    refetch,
  } = useBookmarksQuery()

  const onRefresh = useCallback(async () => {
    setIsPTRing(true)
    try {
      await refetch()
    } finally {
      setIsPTRing(false)
    }
  }, [refetch, setIsPTRing])

  const onEndReached = useCallback(async () => {
    if (isFetchingNextPage || !hasNextPage || error) return
    try {
      await fetchNextPage()
    } catch {}
  }, [isFetchingNextPage, hasNextPage, error, fetchNextPage])

  const items = useMemo(() => {
    const i: ListItem[] = []

    if (isLoading) {
      i.push({type: 'loading', key: 'loading'})
    } else if (error || !data) {
      // handled in Footer
    } else {
      const bookmarks = data.pages.flatMap(p => p.bookmarks)

      if (bookmarks.length > 0) {
        for (const bookmark of bookmarks) {
          if (bsky.isType(app.bsky.feed.defs.notFoundPost, bookmark.item)) {
            i.push({
              type: 'bookmarkNotFound',
              key: bookmark.item.uri,
              bookmark: {
                ...bookmark,
                item: bookmark.item,
              },
            })
          }
          if (bsky.isType(app.bsky.feed.defs.postView, bookmark.item)) {
            i.push({
              type: 'bookmark',
              key: bookmark.item.uri,
              bookmark: {
                ...bookmark,
                item: bookmark.item,
              },
            })
          }
        }
      } else {
        i.push({type: 'empty', key: 'empty'})
      }
    }

    return i
  }, [isLoading, error, data])

  const isEmpty = items.length === 1 && items[0]?.type === 'empty'

  return (
    <List
      data={items}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      refreshing={isPTRing}
      onRefresh={() => void onRefresh()}
      onEndReached={() => void onEndReached()}
      onEndReachedThreshold={4}
      onItemSeen={(item: ListItem) => {
        if (item.type === 'bookmark') {
          trackPostView(item.bookmark.item)
        }
      }}
      ListFooterComponent={
        <ListFooter
          isFetchingNextPage={isFetchingNextPage}
          error={cleanError(error)}
          onRetry={fetchNextPage}
          style={[isEmpty && a.border_t_0]}
        />
      }
      initialNumToRender={initialNumToRender}
      windowSize={9}
      maxToRenderPerBatch={IS_IOS ? 5 : 1}
      updateCellsBatchingPeriod={40}
      sideBorders={false}
    />
  )
}

function BookmarkNotFound({
  hideTopBorder,
  post,
}: {
  hideTopBorder: boolean
  post: $Typed<app.bsky.feed.defs.NotFoundPost>
}) {
  const t = useTheme()
  const {_} = useLingui()
  const {mutateAsync: bookmark} = useBookmarkMutation()

  const remove = async () => {
    try {
      await bookmark({action: 'delete', uri: post.uri})
      toast.show(_(msg`Removed from saved posts`), {
        type: 'info',
      })
    } catch (err) {
      toast.show(cleanError(err), {
        type: 'error',
      })
    }
  }

  return (
    <View
      style={[
        a.flex_row,
        a.align_start,
        a.px_xl,
        a.py_lg,
        a.gap_sm,
        !hideTopBorder && a.border_t,
        t.atoms.border_contrast_low,
      ]}>
      <Skele.Circle size={42}>
        <QuestionIcon size="lg" fill={t.atoms.text_contrast_low.color} />
      </Skele.Circle>
      <View style={[a.flex_1, a.gap_2xs]}>
        <View style={[a.flex_row, a.gap_xs]}>
          <Skele.Text style={[a.text_md, {width: 80}]} />
          <Skele.Text style={[a.text_md, {width: 100}]} />
        </View>

        <Text
          style={[
            a.text_md,
            a.leading_snug,
            a.italic,
            t.atoms.text_contrast_medium,
          ]}>
          <Trans>This post was deleted by its author</Trans>
        </Text>
      </View>
      <Button
        label={_(msg`Remove from saved posts`)}
        size="tiny"
        color="secondary"
        onPress={() => void remove()}>
        <ButtonIcon icon={BookmarkFilled} />
        <ButtonText>
          <Trans>Remove</Trans>
        </ButtonText>
      </Button>
    </View>
  )
}

function BookmarkItem({
  item,
  hideTopBorder,
}: {
  item: Extract<ListItem, {type: 'bookmark'}>
  hideTopBorder: boolean
}) {
  const ax = useAnalytics()
  return (
    <Post
      post={item.bookmark.item}
      hideTopBorder={hideTopBorder}
      onBeforePress={() => {
        ax.metric('bookmarks:post-clicked', {})
      }}
    />
  )
}

function BookmarksEmpty() {
  const t = useTheme()
  const {_} = useLingui()
  const navigation = useNavigation<NavigationProp<CommonNavigatorParams>>()

  return (
    <EmptyState
      icon={BookmarkDeleteLarge}
      message={_(msg`Nothing saved yet`)}
      textStyle={[t.atoms.text_contrast_medium, a.font_medium]}
      button={{
        label: _(msg`Button to go back to the home timeline`),
        text: _(msg`Go home`),
        onPress: () => navigation.navigate('Home' as never),
        size: 'small',
        color: 'secondary',
      }}
      style={[a.pt_3xl]}
    />
  )
}

function renderItem({item, index}: {item: ListItem; index: number}) {
  switch (item.type) {
    case 'loading': {
      return <PostFeedLoadingPlaceholder />
    }
    case 'empty': {
      return <BookmarksEmpty />
    }
    case 'bookmark': {
      return <BookmarkItem item={item} hideTopBorder={index === 0} />
    }
    case 'bookmarkNotFound': {
      return (
        <BookmarkNotFound
          post={item.bookmark.item}
          hideTopBorder={index === 0}
        />
      )
    }
    default:
      return null
  }
}

const keyExtractor = (item: ListItem) => item.key
