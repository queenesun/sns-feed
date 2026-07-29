export async function fetchPosts(page: number = 1, limit: number = 5) {
    const response = await fetch(`/api/posts?page=${page}&limit=${limit}`);

    if (!response.ok) {
        throw new Error('Failed to fetch posts')
    }

    return response.json()
}

export async function fetchPost(id: number) {
    const response = await fetch(`/api/posts/${id}`);

    if (!response.ok) {
        throw new Error('Failed to fetch post')
    }

    return response.json()
}

export async function createPost(content: string, image?: string) {
    const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content, image })
    })

    if (!response.ok) {
        throw new Error('Failed to create post')
    }

    return response.json()
}

export async function likePost(postId: number) {
    const response = await fetch(`/api/posts/${postId}/like`, {
        method: 'POST'
    })

    if (!response.ok) {
        throw new Error('Failed to like post')
    }

    return response.json()
}

export async function fetchComments(postId: number) {
    const response = await fetch(`/api/posts/${postId}/comments`)

    if (!response.ok) {
        throw new Error('Failed to fetch comments')
    }

    return response.json()
}


export async function createComment(postId: number, content: string) {
    const response = await fetch(`/api/comments`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ postId, content })
    })

    if (!response.ok) {
        throw new Error('Failed to create comment')
    }
    return response.json()
}