export interface User {
    id: number;
    username: string;
    avatar: string;
}
export interface Post {
    id: number;
    author: User;
    content: string;
    image?: string;
    likes: number;
    likedBy: number[];
    commentCount: number;
    createdAt: string;
}
export interface Comment {
    id: number;
    postId: number;
    author: User;
    content: string;
    createdAt: string;
}
export interface CreatePostInput {
    content: string;
    image?: string;
}
export interface CreateCommentInput {
    postId: number;
    content: string;
}