import type { Post } from "@/data/types";

export type PostsVisibleSlice = {
  remotePosts: Post[];
  localPosts: Post[];
  deletedIds: number[];
  editedById: Record<number, Partial<Post>>;
  listUserId: number | null;
};

export function computeVisiblePosts(slice: PostsVisibleSlice): Post[] {
  const deletedPostIds = new Set(slice.deletedIds);
  const postsById = new Map<number, Post>();
  for (const post of slice.remotePosts) {
    postsById.set(post.id, post);
  }
  for (const post of slice.localPosts) {
    postsById.set(post.id, post);
  }
  let visiblePosts = [...postsById.values()].filter(
    (post) => !deletedPostIds.has(post.id),
  );
  if (slice.listUserId != null) {
    visiblePosts = visiblePosts.filter(
      (post) => post.userId === slice.listUserId,
    );
  }
  return visiblePosts.map((post) => {
    const editsForPost = slice.editedById[post.id];
    return editsForPost ? { ...post, ...editsForPost } : post;
  });
}
