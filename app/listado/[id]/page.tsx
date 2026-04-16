import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { fetchPostById } from "@/data/api-posts";
import { PostDetail } from "@/components/post-detail/PostDetail";
import { LocalPostDetailGate } from "@/components/post-detail/local-post-detail-gate/LocalPostDetailGate";

type PostDetailPageProps = { params: Promise<{ id: string }> };

export async function generateMetadata({
  params,
}: PostDetailPageProps): Promise<Metadata> {
  const { id: routeParamId } = await params;
  const numericPostId = Number(routeParamId);
  if (!Number.isFinite(numericPostId)) return { title: "Post" };
  const post = await fetchPostById(numericPostId);
  if (!post) {
    return {
      title: "Publicación",
      description: "Detalle de la publicación (incluye posts guardados en este dispositivo).",
    };
  }
  return { title: post.title.slice(0, 60) };
}

export default async function PostDetailPage({ params }: PostDetailPageProps) {
  const { id: routeParamId } = await params;
  const numericPostId = Number(routeParamId);
  if (!Number.isFinite(numericPostId)) notFound();

  const post = await fetchPostById(numericPostId);
  if (post) {
    return <PostDetail initialPost={post} />;
  }

  return <LocalPostDetailGate requestedPostId={numericPostId} />;
}
