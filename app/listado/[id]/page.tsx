import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { fetchPostById } from "@/lib/api-posts";
import { PostDetail } from "@/components/post-detail/PostDetail";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const n = Number(id);
  if (!Number.isFinite(n)) return { title: "Post" };
  const post = await fetchPostById(n);
  if (!post) return { title: "No encontrado" };
  return { title: post.title.slice(0, 60) };
}

export default async function PostDetailPage({ params }: Props) {
  const { id } = await params;
  const n = Number(id);
  if (!Number.isFinite(n)) notFound();

  const post = await fetchPostById(n);
  if (!post) notFound();

  return <PostDetail initialPost={post} />;
}
