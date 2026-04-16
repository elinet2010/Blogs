import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PostImageCarousel } from "./PostImageCarousel";

vi.mock("next/image", () => ({
  default: ({
    alt,
    src,
    ...rest
  }: {
    alt: string;
    src: string;
    width: number;
    height: number;
    className?: string;
  }) => (
    // eslint-disable-next-line @next/next/no-img-element -- mock en pruebas
    <img alt={alt} src={src} data-testid="carousel-img" {...rest} />
  ),
}));

describe("PostImageCarousel", () => {
  afterEach(() => {
    cleanup();
  });

  it("renderiza imagen y pie con título recortado", () => {
    render(<PostImageCarousel postId={3} title="Un título bastante largo para probar el slice del caption" />);
    const img = screen.getByTestId("carousel-img");
    expect(img).toHaveAttribute("src", expect.stringContaining("blog-detail-3-s0"));
    expect(screen.getByText(/Imagen 1 de 3/)).toBeInTheDocument();
    expect(screen.getByText(/…/)).toBeInTheDocument();
  });

  it("cambia de slide con flechas y puntos", () => {
    render(<PostImageCarousel postId={1} title="Corto" />);
    expect(screen.getByTestId("carousel-img").getAttribute("src")).toContain("-s0");
    fireEvent.click(screen.getByRole("button", { name: "Imagen siguiente" }));
    expect(screen.getByTestId("carousel-img").getAttribute("src")).toContain("-s1");
    fireEvent.click(screen.getByRole("tab", { name: "Imagen 3" }));
    expect(screen.getByTestId("carousel-img").getAttribute("src")).toContain("-s2");
    fireEvent.click(screen.getByRole("button", { name: "Imagen anterior" }));
    expect(screen.getByTestId("carousel-img").getAttribute("src")).toContain("-s1");
  });
});
