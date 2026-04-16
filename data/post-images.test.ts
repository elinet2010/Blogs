import { describe, expect, it } from "vitest";
import {
  POST_DETAIL_CAROUSEL_SLIDE_COUNT,
  POST_DETAIL_IMAGE_HEIGHT_PX,
  POST_DETAIL_IMAGE_WIDTH_PX,
  buildPostDetailCarouselImageUrl,
} from "./post-images";

describe("post-images", () => {
  it("buildPostDetailCarouselImageUrl arma URL de Picsum con seed estable", () => {
    const url = buildPostDetailCarouselImageUrl(7, 1);
    expect(url).toBe(
      `https://picsum.photos/seed/blog-detail-7-s1/${POST_DETAIL_IMAGE_WIDTH_PX}/${POST_DETAIL_IMAGE_HEIGHT_PX}`,
    );
    expect(POST_DETAIL_CAROUSEL_SLIDE_COUNT).toBe(3);
  });
});
