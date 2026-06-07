import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import BlogPost from "./BlogPost";

vi.mock("../blogMeta.json", () => ({
  default: [
    {
      slug: "test-post-1",
      title: "Test Blog Title 1",
      excerpt: "Test excerpt 1",
      date: "May 25, 2026",
      readTime: "6 min read",
      category: "Test Category"
    },
    {
      slug: "test-post-2",
      title: "Test Blog Title 2",
      excerpt: "Test excerpt 2",
      date: "May 26, 2026",
      readTime: "5 min read",
      category: "Test Category"
    }
  ]
}));

describe("BlogPost Component", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renders a loading state initially and then shows the blog post on successful fetch", async () => {
    const mockMarkdown = `---
title: Test Blog Title 1
category: Test Category
---
# This is my test blog markdown body
And some more text about loans.

| Heading One | Heading Two |
| ----------- | ----------- |
| Table Cell A | Table Cell B |
`;

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(mockMarkdown)
    } as Response);

    render(
      <MemoryRouter initialEntries={["/blog/test-post-1"]}>
        <Routes>
          <Route path="/blog/:slug" element={<BlogPost />} />
        </Routes>
      </MemoryRouter>
    );

    // Wait for the blog content to render using async query
    const heading = await screen.findByRole("heading", { name: "Test Blog Title 1", level: 1 });
    expect(heading).toBeInTheDocument();
    
    expect(screen.getByText("This is my test blog markdown body")).toBeInTheDocument();
    expect(screen.getByText("And some more text about loans.")).toBeInTheDocument();

    // Verify markdown table elements rendered correctly
    expect(screen.getByText("Heading One")).toBeInTheDocument();
    expect(screen.getByText("Heading Two")).toBeInTheDocument();
    expect(screen.getByText("Table Cell A")).toBeInTheDocument();
    expect(screen.getByText("Table Cell B")).toBeInTheDocument();
    
    // Check related post recommendation
    expect(screen.getByText("Test Blog Title 2")).toBeInTheDocument();
  });

  it("renders 'Post Not Found' when fetch fails", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false
    } as Response);

    render(
      <MemoryRouter initialEntries={["/blog/non-existent-slug"]}>
        <Routes>
          <Route path="/blog/:slug" element={<BlogPost />} />
        </Routes>
      </MemoryRouter>
    );

    // Wait for the error page to render
    const notFoundHeading = await screen.findByRole("heading", { name: "Post Not Found", level: 1 });
    expect(notFoundHeading).toBeInTheDocument();
    expect(screen.getByText("Sorry, the article you are looking for does not exist.")).toBeInTheDocument();
  });
});
