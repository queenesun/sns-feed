import { useState } from 'react';
import { useComments, useCreateComment } from '../../hooks/useComments';
import styles from './CommentSection.module.css';
import type { Comment } from '../../types'

interface CommentSectionProps {
    postId: number
}

// 게시글 하나에 대한 댓글 목록 + 댓글 작성 폼을 담당하는 컴포넌트
// 버튼을 눌러 댓글 영역을 펼치고/접을 수 있는 아코디언 형태로 동작함
function CommentSection({ postId }: CommentSectionProps) {
    // 댓글 영역이 펼쳐져 있는지 여부 (토글 버튼으로 제어)
    const [isOpen, setIsOpen] = useState(false)
    // 댓글 입력창의 현재 입력값 (제어 컴포넌트)
    const [content, setContent] = useState('')

    // postId에 해당하는 댓글 목록을 서버에서 조회 (react-query)
    const { data: comments, isLoading } = useComments(postId)
    // 댓글 작성 요청을 보내는 mutation
    const createCommentMutation = useCreateComment()


    // 댓글 작성 폼 제출 핸들러
    const handleSubmit = (e: React.FormEvent) => {
        // 폼 기본 제출 동작(새로고침) 방지
        e.preventDefault()

        // 공백만 입력된 경우 등록하지 않음
        if (!content.trim()) return

        // 댓글 생성 요청 실행
        createCommentMutation.mutate(
            { postId, content },
            {
                // 성공 시 입력창을 비움
                onSuccess: () => {
                    setContent('')
                }
            }
        )
    }

    // 댓글 작성 시각(date)을 현재 시각과 비교해 "n초/분/시간/일 전" 형태의 문자열로 변환
    const timeAgo = (date: string) => {
        // 작성 시각과 현재 시각의 차이를 초 단위로 계산
        const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000)

        if (seconds < 60) return `${seconds}초 전`
        if (seconds < 3600) return `${Math.floor(seconds / 60)}분 전`
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}시간 전`
        return `${Math.floor(seconds / 86400)}일 전`
    }

    return (
        <div className={styles.section}>
            {/* 댓글 영역 열기/닫기 토글 버튼, 현재 댓글 개수를 함께 표시 */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={styles.toggleBtn}
            >
                💬댓글 {comments?.length || 0}개
            </button>

            {/* 열려 있을 때만 댓글 목록과 작성 폼을 렌더링 */}
            {isOpen && (
                <div className={styles.content}>
                    {isLoading ? (
                        // 댓글 목록 조회 중 로딩 표시
                        <p className={styles.loading}>로딩 중...</p>
                    ) : (
                        <div className={styles.comments}>
                            {/* 댓글 목록을 순회하며 각 댓글 렌더링 */}
                            {comments?.map((comment: Comment) => (
                                <div key={comment.id} className={styles.comment}>
                                    {/* 댓글 작성자 프로필 이미지 */}
                                    <img
                                        src={comment.author.avatar}
                                        alt={comment.author.username}
                                        className={styles.avatar}
                                    />
                                    <div className={styles.commentBody}>
                                        <div className={styles.commentHeader}>
                                            {/* 작성자 이름 */}
                                            <span className={styles.username}>
                                                {comment.author.username}
                                            </span>
                                            {/* 작성 시각을 상대 시간으로 표시 */}
                                            <span className={styles.time}>
                                                {timeAgo(comment.createdAt)}
                                            </span>
                                        </div>
                                        {/* 댓글 본문 내용 */}
                                        <p className={styles.commentContent}>{comment.content}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* 댓글 작성 폼 */}
                    <form onSubmit={handleSubmit} className={styles.form}>
                        {/* 댓글 입력창 (제어 컴포넌트, content 상태와 연결) */}
                        <input
                            type="text"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="댓글을 입력하세요..."
                            className={styles.input}
                        />

                        {/* 작성 요청 진행 중이거나 입력값이 비어있으면 비활성화 */}
                        <button
                            type="submit"
                            className={styles.submitBtn}
                            disabled={createCommentMutation.isPending || !content.trim()}
                        >
                            {createCommentMutation.isPending ? '작성 중...' : '작성'}
                        </button>

                    </form>
                </div>
            )}
        </div >
    )
}

export default CommentSection
