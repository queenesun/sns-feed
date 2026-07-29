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

export function useLikePost() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: likePost,

        onMutate: async (postId) => {
            // 이전 쿼리 취소
            await queryClient.cancelQueries({ queryKey: ['posts'] })

            // 현재 캐시 데이터 저장 (롤백용)
            const previousData = queryClient.getQueryData(['posts'])

            // 낙관적 업데이트
            queryClient.setQueryData(['posts'], (old: any) => {
                if (!old) return old

                return {
                    ...old,
                    pages: old.pages.map((page: any) => ({
                        ...page,
                        posts: page.posts.map((post: Post) => {
                            if (post.id === postId) {
                                const isLiked = post.likedBy.includes(1) // currentUser.id = 1

                                return {
                                    ...post,
                                    likes: isLiked ? post.likes - 1 : post.likes + 1,
                                    likedBy: isLiked ?
                                        post.likedBy.filter(id => id !== 1)
                                        : [...post.likedBy, 1]
                                }
                            }

                            return post
                        })
                    }))
                }
            })

            // 롤백용 데이터 반환
            return { previousData }
        },

        onError: (err, postId, context) => {
            // 에러 시 롤백
            if (context?.previousData) {
                queryClient.setQueryData(['posts'], context.previousData)
            }
        },

        onSettled: () => {
            // 성공 / 실패 관계없이 리패칭
            queryClient.invalidateQueries({ queryKey: ['posts'] })
        }
    })
}