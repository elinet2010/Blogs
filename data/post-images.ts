/** Carrusel en la vista detalle de un post (Picsum por seed). */
export const POST_DETAIL_CAROUSEL_SLIDE_COUNT = 3;
export const POST_DETAIL_IMAGE_WIDTH_PX = 1200;
export const POST_DETAIL_IMAGE_HEIGHT_PX = 675;

export function buildPostDetailCarouselImageUrl(
  postId: number,
  slideIndex: number,
): string {
  return `https://picsum.photos/seed/blog-detail-${postId}-s${slideIndex}/${POST_DETAIL_IMAGE_WIDTH_PX}/${POST_DETAIL_IMAGE_HEIGHT_PX}`;
}
