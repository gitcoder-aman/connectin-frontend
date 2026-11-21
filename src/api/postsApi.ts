import { apiClient } from './client';
import { PostDto } from '@/types/post';

// 1x1 transparent PNG fallback byte array (68 bytes) to satisfy @RequestPart("file") when no user image is chosen
const TRANSPARENT_PNG_BASE64 =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

function createFallbackImageFile(): File {
  const byteCharacters = atob(TRANSPARENT_PNG_BASE64);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  return new File([byteArray], 'post-fallback.png', { type: 'image/png' });
}

/**
 * Posts Service API Client
 * Routed through Gateway at /api/v1/posts/**
 */
export const postsApi = {
  /**
   * Create a new post with text and optional image
   * POST /api/v1/posts/core
   */
  async createPost(content: string, file?: File | null): Promise<PostDto> {
    const formData = new FormData();

    // Part 1: post JSON DTO
    const postBlob = new Blob([JSON.stringify({ content })], {
      type: 'application/json',
    });
    formData.append('post', postBlob);

    // Part 2: file MultipartFile
    // The backend @RequestPart("file") expects a valid file for Cloudinary upload
    const imageToUpload = file || createFallbackImageFile();
    formData.append('file', imageToUpload);

    const response = await apiClient.post<PostDto>('/api/v1/posts/core', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /**
   * Get all community posts across platform
   * GET /api/v1/posts/core/all
   */
  async getAllPosts(): Promise<PostDto[]> {
    const response = await apiClient.get<PostDto[]>('/api/v1/posts/core/all');
    return Array.isArray(response.data) ? response.data : [];
  },

  /**
   * Get single post by ID
   * GET /api/v1/posts/core/{postId}
   */
  async getPostById(postId: number): Promise<PostDto> {
    const response = await apiClient.get<PostDto>(`/api/v1/posts/core/${postId}`);
    return response.data;
  },

  /**
   * Get all posts created by a specific user
   * GET /api/v1/posts/core/users/{userId}/all-posts
   */
  async getAllPostsByUser(userId: number): Promise<PostDto[]> {
    const response = await apiClient.get<PostDto[]>(
      `/api/v1/posts/core/users/${userId}/all-posts`
    );
    return Array.isArray(response.data) ? response.data : [];
  },

  /**
   * Like a post
   * POST /api/v1/posts/likes/{postId}
   */
  async likePost(postId: number): Promise<void> {
    await apiClient.post(`/api/v1/posts/likes/${postId}`);
  },

  /**
   * Unlike a post
   * DELETE /api/v1/posts/likes/{postId}
   */
  async unlikePost(postId: number): Promise<void> {
    await apiClient.delete(`/api/v1/posts/likes/${postId}`);
  },
};
