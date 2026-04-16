import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { Post } from "@/data/types";
import { POSTS_LIST_PAGE_SIZE } from "@/data/list-pagination";
import {
  createPostViaApi,
  fetchPostsPage,
  type CreatePostPayload,
} from "@/data/api-posts";
import { createLocalPostNumericId } from "@/data/local-post-id";
import { getUserMessageFromUnknownError } from "@/data/api-http";
import { computeVisiblePosts } from "@/data/visible-posts";

type EditedMap = Record<number, Partial<Post>>;

type PostsState = {
  remotePosts: Post[];
  isLoading: boolean;
  error: string | null;
  nextStart: number;
  hasMore: boolean;
  /** null = todos los autores; número = filtro JSONPlaceholder */
  listUserId: number | null;
  deletedIds: number[];
  editedById: EditedMap;
  localPosts: Post[];
  setLoading: (nextIsLoading: boolean) => void;
  setError: (errorMessage: string | null) => void;
  appendPosts: (postsToAppend: Post[]) => void;
  resetRemoteForList: (filterByAuthorUserId: number | null) => void;
  /** Primera página ya traída en el servidor — evita duplicar la petición inicial en el cliente. */
  seedFirstPageFromServer: (
    filterByAuthorUserId: number | null,
    firstPagePosts: Post[],
    pageSize: number,
  ) => void;
  fetchPage: (pageSize?: number) => Promise<void>;
  /** POST a la API y persistencia local; devuelve el id local del post. */
  createPostWithApi: (payload: CreatePostPayload) => Promise<number>;
  deletePost: (postId: number) => void;
  upsertEdit: (postId: number, partialPostFields: Partial<Post>) => void;
  addLocalPost: (newLocalPost: Post) => void;
  getVisiblePosts: () => Post[];
};

function dedupeAppend(existingPosts: Post[], incomingPosts: Post[]): Post[] {
  const postIdsAlreadyMerged = new Set(existingPosts.map((post) => post.id));
  const mergedPosts = [...existingPosts];
  for (const post of incomingPosts) {
    if (!postIdsAlreadyMerged.has(post.id)) {
      postIdsAlreadyMerged.add(post.id);
      mergedPosts.push(post);
    }
  }
  return mergedPosts;
}

export const usePostsStore = create<PostsState>()(
  persist(
    (setState, getState) => ({
      remotePosts: [],
      isLoading: false,
      error: null,
      nextStart: 0,
      hasMore: true,
      listUserId: null,

      deletedIds: [],
      editedById: {},
      localPosts: [],

      setLoading: (nextIsLoading) =>
        setState({ isLoading: nextIsLoading }),
      setError: (errorMessage) => setState({ error: errorMessage }),

      appendPosts: (postsToAppend) =>
        setState((previousState) => ({
          remotePosts: dedupeAppend(previousState.remotePosts, postsToAppend),
        })),

      resetRemoteForList: (filterByAuthorUserId) =>
        setState({
          remotePosts: [],
          nextStart: 0,
          hasMore: true,
          listUserId: filterByAuthorUserId,
          error: null,
          isLoading: false,
        }),

      seedFirstPageFromServer: (filterByAuthorUserId, firstPagePosts, pageSize) =>
        setState({
          remotePosts: firstPagePosts,
          nextStart: firstPagePosts.length,
          hasMore: firstPagePosts.length === pageSize,
          listUserId: filterByAuthorUserId,
          error: null,
          isLoading: false,
        }),

      fetchPage: async (pageSize = POSTS_LIST_PAGE_SIZE) => {
        const {
          isLoading,
          hasMore,
          nextStart,
          listUserId,
          appendPosts: appendRemotePostsBatch,
        } = getState();
        if (isLoading || !hasMore) return;

        setState({ isLoading: true, error: null });
        try {
          const apiUserIdFilter = listUserId ?? undefined;
          const fetchedPosts = await fetchPostsPage(
            nextStart,
            pageSize,
            apiUserIdFilter,
          );
          appendRemotePostsBatch(fetchedPosts);
          setState((previousState) => ({
            nextStart: previousState.nextStart + fetchedPosts.length,
            hasMore: fetchedPosts.length === pageSize,
            isLoading: false,
          }));
        } catch (caughtError: unknown) {
          setState({
            error: getUserMessageFromUnknownError(caughtError),
            isLoading: false,
          });
        }
      },

      createPostWithApi: async (payload) => {
        const apiPost = await createPostViaApi(payload);
        const localId = createLocalPostNumericId();
        setState((previousState) => ({
          localPosts: [
            ...previousState.localPosts,
            {
              id: localId,
              userId: apiPost.userId,
              title: apiPost.title,
              body: apiPost.body,
            },
          ],
        }));
        return localId;
      },

      deletePost: (postId) =>
        setState((previousState) => ({
          deletedIds: previousState.deletedIds.includes(postId)
            ? previousState.deletedIds
            : [...previousState.deletedIds, postId],
        })),

      upsertEdit: (postId, partialPostFields) =>
        setState((previousState) => ({
          editedById: {
            ...previousState.editedById,
            [postId]: {
              ...previousState.editedById[postId],
              ...partialPostFields,
            },
          },
        })),

      addLocalPost: (newLocalPost) =>
        setState((previousState) => ({
          localPosts: [...previousState.localPosts, newLocalPost],
        })),

      getVisiblePosts: () => {
        const stateSnapshot = getState();
        return computeVisiblePosts({
          remotePosts: stateSnapshot.remotePosts,
          localPosts: stateSnapshot.localPosts,
          deletedIds: stateSnapshot.deletedIds,
          editedById: stateSnapshot.editedById,
          listUserId: stateSnapshot.listUserId,
        });
      },
    }),
    {
      name: "posts-app-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (stateToPersist) => ({
        deletedIds: stateToPersist.deletedIds,
        editedById: stateToPersist.editedById,
        localPosts: stateToPersist.localPosts,
      }),
    },
  ),
);
