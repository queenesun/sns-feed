import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchComments, createComment } from '../api/posts';

export function useComments(postId: number) {
    return useQuery({
        queryKey: ['comments', postId],
        queryFn: () => fetchComments(postId)
    })
}

export function useCreateComment() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ postId, content }: { postId: number, content: string }) => createComment(postId, content),
        //댓글 목록 리패칭
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({
                queryKey: ['comments', variables.postId]
            })

            //포스트 목록 리패칭 (commentCount 업데이트)
            queryClient.invalidateQueries({ queryKey: ['posts'] })
        }
    })
}