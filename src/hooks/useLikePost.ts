/*
React Query의 낙관적 업데이트(Optimistic Update) 예제

-> 누르면 서버 응답 기다리지 말고 화면부터 바로 바꾸고, 실패하면 원래대로 되돌리는 방식 (좋아요 버튼, 댓글 작성 등 즉각적인 반응이 중요한 곳에 사용함)

사용자의 행동(요청 전송) 
-> UI 선반영(서버 결과와 상관 X) 
-> 서버 요청 
-> 결과 처리 (성공 시 그대로 유지하거나 서버 데이터로 맞춤 / 실패 시 롤백 후 에러 알림)
*/

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { likePost } from '../api/posts';
import type { Post } from '../types';

// 좋아요 기능 전용 커스텀 훅
export function useLikePost() {
    // React Query 캐시에 접근하기 위한 객체
    const queryClient = useQueryClient();

    // mutation 생성 - 데이터 변경 (POST, PUT, DELETE 등) 담당
    return useMutation({
        // 실제 서버 API 호출 함수 likePost(postId)
        mutationFn: likePost,

        // async: 프로그램이 작업 완료를 기다리지 않고 다른 일을 먼저 하도록 만드는 비동기 코드
        // 서버 요청 직전에 실행 -> 낙관적 업데이트 처리
        onMutate: async (postId) => {
            // 이전 쿼리 취소(post 관련 진행 중인 요청 취소) -> 서버 응답이 뒤늦게 와서 캐시를 덮어쓰는 문제 방지
            await queryClient.cancelQueries({ queryKey: ['posts'] })

            // 현재 캐시 데이터 저장 (실패 시 롤백용)
            const previousData = queryClient.getQueryData(['posts'])

            // 핵심!!!!!!!!! 낙관적 업데이트 (서버 응답 기다리지 않고 React Query 캐시를 직접 수정해서 사용자가 "좋아요가 바로 눌린 것처럼" 느끼게 해주는 부분)
            queryClient.setQueryData(['posts'], (old: any) => {
                if (!old) return old // 캐시 없으면 종료

                return {
                    // 기존 데이터 복사
                    ...old,
                    // 무한 스크롤 데이터 구조 유지 (pages 배열 순회)
                    pages: old.pages.map((page: any) => ({
                        ...page,
                        posts: page.posts.map((post: Post) => { // 해당 페이지의 게시글 순회
                            if (post.id === postId) { // 클릭한 게시글 찾기
                                const isLiked = post.likedBy.includes(1) // 현재 유저 id = 1 이라고 가정하고 현재 유저가 좋아요 눌렀는지 확인

                                // 좋아요 상태 토글
                                return {
                                    ...post,
                                    likes: isLiked ? post.likes - 1 : post.likes + 1, // 이미 좋아요 한 상태면 좋아요 취소 
                                    likedBy: isLiked ?
                                        post.likedBy.filter(id => id !== 1)
                                        : [...post.likedBy, 1] // likedBy 배열 수정
                                }
                            }
                            // 다른 게시글은 그대로 유지
                            return post
                        })
                    }))
                }
            })

            // 롤백용 데이터(이전 캐시) 반환
            return { previousData }
        },

        // API 실패 시 실행
        onError: (err, postId, context) => {
            // 저장해둔 캐시가 있으면 원래 상태로 복구
            if (context?.previousData) {
                queryClient.setQueryData(['posts'], context.previousData)
            }
        },

        // 성공/실패 관계없이 실행 (최종적으로 서버 데이터와 동기화)
        onSettled: () => {
            // posts 쿼리 무효화 (다음 렌더링 때 서버에서 다시 가져옴)
            queryClient.invalidateQueries({ queryKey: ['posts'] })
        }
    })
}

/*[실행 흐름]
좋아요 버튼 클릭
↓
mutate(postId)
↓
onMutate
↓
화면 즉시 변경
(좋아요 수 +1)
↓
서버 API 요청
↓
성공
    ↓
    onSettled
    ↓
    서버 데이터 재조회

실패
    ↓
    onError
    ↓
    previousData로 롤백
    ↓
    onSettled
*/