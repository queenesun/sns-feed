import { useEffect, useRef } from 'react'
import { usePosts } from '../../hooks/usePosts'
import PostCard from '../../components/PostCard/PostCard'
import PostForm from '../../components/PostForm/PostForm'
import type { Post } from '../../types'
import styles from './Feed.module.css'

function Feed() {
    // useInfiniteQuery에서 반환하는 값들
    const {
        data,               // 페이지별로 묶인 데이터 { pages: [...] }
        isLoading,          // 처음 로딩 중
        error,              // 에러
        fetchNextPage,      // 다음 페이지 가져오는 함수
        hasNextPage,        // 다음 페이지 있는지 (true/false)
        isFetchingNextPage  // 다음 페이지 로딩 중
    } = usePosts(1)

    // IntersectionObserver가 감시할 DOM 요소
    const observerRef = useRef<HTMLDivElement>(null)

    // 스크롤 감지 설정
    useEffect(() => {
        // observerRef가 없거나 다음 페이지가 없으면 실행 안 함
        if (!observerRef.current || !hasNextPage) return;

        // IntersectionObserver 생성
        const observer = new IntersectionObserver(
            (entries) => {
                // entries[0].isIntersecting: 감시 영역이 화면에 보이는지
                if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
                    fetchNextPage()
                }
            },
            {
                threshold: 0.1  // 요소의 10%가 보이면 트리거
            }
        )

        // 감시 시작
        observer.observe(observerRef.current)

        // 컴포넌트 언마운트 시 감시 중단
        return () => observer.disconnect()
    }, [fetchNextPage, hasNextPage, isFetchingNextPage])

    // 처음 로딩 중
    if (isLoading) {
        return (
            <div className={styles.loading}>
                <div className={styles.spinner}></div>
                <p>로딩 중...</p>
            </div>
        )
    }

    // 에러 발생
    if (error) {
        return (
            <div className={styles.error}>
                <p>포스트를 불러오는데 실패했습니다</p>
                <p className={styles.errorMessage}>{error.message}</p>
            </div>
        )
    }

    return (
        <div className={styles.feed}>
            <div className={styles.header}>
                <h1>피드</h1>
            </div>

            {/* 포스트 작성 폼 */}
            <PostForm />

            {/* 포스트 목록 */}
            <div className={styles.posts}>
                {/* data.pages: [page1, page2, page3, ...] */}
                {data?.pages.map((page, pageIndex) => (
                    <div key={pageIndex}>
                        {/* page.posts: 각 페이지의 포스트 배열 */}
                        {page.posts.map((post: Post) => (
                            <PostCard key={post.id} post={post} />
                        ))}
                    </div>
                ))}
            </div>

            {/* 다음 페이지가 있으면 표시 */}
            {hasNextPage && (
                // 이 div를 IntersectionObserver가 감시함
                <div ref={observerRef} className={styles.observer}>
                    {isFetchingNextPage ? (
                        // 다음 페이지 로딩 중
                        <div className={styles.loadingMore}>
                            <div className={styles.spinner}></div>
                            <p>더 불러오는 중...</p>
                        </div>
                    ) : (
                        // 수동으로 더 불러오기 (백업용)
                        <button
                            onClick={() => fetchNextPage()}
                            className={styles.loadMoreBtn}
                        >
                            더보기
                        </button>
                    )}
                </div>
            )}
        </div>
    )
}

export default Feed;