export interface PostDto {
  id: number;
  content: string;
  imageUrl?: string | null;
  userId: number;
  createdAt?: string;
}

export interface PostCreateRequestDto {
  content: string;
}

export interface FeedPost extends PostDto {
  authorName?: string;
  isLikedByMe?: boolean;
}
