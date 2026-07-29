// 좋아요 버튼 UI + 클릭 시 좋아요 요청 보내는 컴포넌트

import { useLikePost } from '../../hooks/useLikePost';
import styles from './LikeButton.module.css';

// 부모 컴포넌트가 넘겨주는 값
interface LikeButtonProps {
    postId: number;
    likes: number;
    isLiked: boolean;
}

export default function LikeButton({ postId, likes, isLiked }: LikeButtonProps) {
    // 커스텀 훅 사용(useLikePost.ts에서 useMutation 감싼 훅. onMutate, onError, onSettled 들어있음)
    const likeMutation = useLikePost()

    // 클릭 함수(버튼 누르면 실행)
    const handleLike = () => {
        likeMutation.mutate(postId)
        // 버튼 누르면 -> onMutate -> 캐시 수정 -> likePost() -> 성공 or 실패 -> onSettled
    }

    return (
        <button
            onClick={handleLike}
            className={`${styles.button} ${isLiked ? styles.liked : ''}`} // isLiked가 true면 css에서 .button, .liked 적용 / false면 .button만
            disabled={likeMutation.isPending}
        // 좋아요 누른 순간 likeMutation.isPending === true가 됨 -> <button disabled> 상태가 됨
        // 사용자가 좋아요 연타하면 API 요청이 여러 번 날아갈 수 있으므로.
        // 요청이 끝나면 isPending === false 로 바뀌고 다시 클릭 가능해짐
        >
            {isLiked ? '🩷' : '🤍'} {likes}
        </button>
    )
}

/* [전체 흐름]
게시글 렌더링
↓
LikeButton 표시
↓
사용자 클릭
↓
handleLike()
↓
mutate(postId)
↓
onMutate
↓
좋아요 수 즉시 변경
(낙관적 업데이트)
↓
서버 요청
↓
성공 → 유지
실패 → 롤백
↓
최종 리패칭
*/