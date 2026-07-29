import { http, HttpResponse, delay } from 'msw';
import { db } from './db';
import type { Post, Comment, CreatePostInput, CreateCommentInput } from
    '../types';
export const handlers = [
    // 포스트 목록 (페이지네이션)
    http.get('/api/posts', async ({ request }) => {
        await delay(500);
        const url = new URL(request.url);
        const page = Number(url.searchParams.get('page')) || 1;
        const limit = Number(url.searchParams.get('limit')) || 5;
        const start = (page - 1) * limit;
        const end = start + limit;
        const paginatedPosts = db.posts.slice(start, end);
        return HttpResponse.json({
            posts: paginatedPosts,
            hasMore: end < db.posts.length,
            nextPage: end < db.posts.length ? page + 1 : null
        });
    }),
    // 포스트 상세
    http.get('/api/posts/:id', async ({ params }) => {
        await delay(300);
        const post = db.posts.find(p => p.id === Number(params.id));
        if (!post) {
            return HttpResponse.json(
                { message: 'Post not found' },
                { status: 404 }
            );
        }
        return HttpResponse.json(post);
    }),
    // 포스트 작성
    http.post('/api/posts', async ({ request }) => {
        await delay(500);
        const body = await request.json() as CreatePostInput;
        const newPost: Post = {
            id: db.getNextPostId(),
            author: db.currentUser,
            content: body.content,
            image: body.image,
            likes: 0,
            likedBy: [],
            commentCount: 0,
            createdAt: new Date().toISOString()
        };
        db.posts.unshift(newPost);
        return HttpResponse.json(newPost, { status: 201 });
    }),
    // 좋아요 토글
    http.post('/api/posts/:id/like', async ({ params }) => {
        await delay(200);
        const post = db.posts.find(p => p.id === Number(params.id));
        if (!post) {
            return HttpResponse.json(
                { message: 'Post not found' },
                { status: 404 }
            );
        }
        const userId = db.currentUser.id;
        const isLiked = post.likedBy.includes(userId);
        if (isLiked) {
            post.likedBy = post.likedBy.filter(id => id !== userId);
            post.likes--;
        } else {
            post.likedBy.push(userId);
            post.likes++;
        }
        return HttpResponse.json(post);
    }),
    // 댓글 목록
    http.get('/api/posts/:id/comments', async ({ params }) => {
        await delay(300);
        const postComments = db.comments.filter(
            c => c.postId === Number(params.id)
        );
        return HttpResponse.json(postComments);
    }),
    // 댓글 작성
    http.post('/api/comments', async ({ request }) => {
        await delay(500);
        const body = await request.json() as CreateCommentInput;
        const newComment: Comment = {
            id: db.getNextCommentId(),
            postId: body.postId,
            author: db.currentUser,
            content: body.content,
            createdAt: new Date().toISOString()
        };
        db.comments.push(newComment);
        const post = db.posts.find(p => p.id === body.postId);
        if (post) {
            post.commentCount++;
        }
        return HttpResponse.json(newComment, { status: 201 });
    })
];
