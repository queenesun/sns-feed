import { useInfiniteQuery } from '@tanstack/react-query';
import { fetchPosts } from '../api/posts';

export function usePosts() {
    return useInfiniteQuery({
        queryKey: ['posts'],
        queryFn: ({ pageParam = 1 }) => fetchPosts(pageParam),
        getNextPageParam: (lastPage) => lastPage.nextPage,
        initialPageParam: 1
  });
}