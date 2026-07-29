import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createPost } from '../api/posts';
import type { CreatePostInput } from '../types';


// 커스텀 훅: "게시글 작성" 로직을 재사용 가능한 형태로 감싸둔 것
// PostForm 같은 컴포넌트에서 const { mutate } = useCreatePost() 형태로 가져다 씀
export function useCreatePost() {

    const queryClient = useQueryClient();

    // useMutation은 mutate 함수, isPending(로딩 상태), isError, data 등을 담은 객체를 반환
    return useMutation({
        // mutationFn: 실제로 실행될 비동기 함수
        // mutate(input)을 호출하면, 여기 정의된 함수가 그 input을 받아 실행됨
        mutationFn: (input: CreatePostInput) =>
            createPost(input.content, input.image),

        // onSuccess: mutationFn이 성공적으로 끝난 직후 실행되는 콜백
        onSuccess: () => {
            // 포스트 목록 캐시 무효화 → 자동 리패칭
            // queryKey: ['posts']로 캐싱된 데이터(예: 피드 목록)를 "오래된 데이터"로 표시
            // react-query가 해당 쿼리를 사용 중인 컴포넌트(예: Feed 페이지)에서
            // 자동으로 서버에 다시 요청해서 최신 게시글 목록을 반영
            queryClient.invalidateQueries({ queryKey: ['posts'] });
        }
    });
}