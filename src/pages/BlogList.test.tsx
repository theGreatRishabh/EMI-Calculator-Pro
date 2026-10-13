import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import BlogList from "./BlogList";

let mockBlogPosts = [
  {
    slug: "test-post-1",
    title: "Test Title A",
    excerpt: "Test Excerpt A",
    date: "2026-05-01",
    readTime: "5 min read",
    category: "Category Alpha",
  },
  {
    slug: "test-post-2",
    title: "Test Title B",
    excerpt: "Test Excerpt B",
    date: "2026-06-01",
    readTime: "10 min read",
    category: "Category Beta",
  },
];

// Mock the blog metadata json file dynamically using a getter
vi.mock("../blogMeta.json", () => ({
  get default() {
    return mockBlogPosts;
  },
}));

describe("BlogList Component", () => {
  it("renders the blog list with header and post items sorted by date", () => {
    render(
      <MemoryRouter>
        <BlogList />
      </MemoryRouter>,
    );

    // Verify main header text
    expect(
      screen.getByRole("heading", { name: /Smart Loan Insights/i, level: 1 }),
    ).toBeInTheDocument();

    // Verify cards are rendered with their metadata
    expect(screen.getByText("Test Title A")).toBeInTheDocument();
    expect(screen.getByText("Test Excerpt A")).toBeInTheDocument();
    expect(screen.getByText("Category Alpha")).toBeInTheDocument();

    expect(screen.getByText("Test Title B")).toBeInTheDocument();
    expect(screen.getByText("Test Excerpt B")).toBeInTheDocument();
    expect(screen.getByText("Category Beta")).toBeInTheDocument();

    // Verify correct sorting (B is newer than A, so B should be rendered before A)
    const headings = screen.getAllByRole("heading", { level: 2 });
    expect(headings[0].textContent).toBe("Test Title B");
    expect(headings[1].textContent).toBe("Test Title A");
  });

  it("filters posts by search query and category", () => {
    mockBlogPosts = [
      {
        slug: "test-post-1",
        title: "Home Loan Refinancing",
        excerpt: "Tips on mortgage refinancing in Canada",
        date: "2026-05-01",
        readTime: "5 min read",
        category: "Home Loans",
      },
      {
        slug: "test-post-2",
        title: "Student Loan Secrets",
        excerpt: "How to survive education moratorium",
        date: "2026-06-01",
        readTime: "10 min read",
        category: "Education",
      },
    ];

    render(
      <MemoryRouter>
        <BlogList />
      </MemoryRouter>,
    );

    const searchInput = screen.getByLabelText("Search articles");
    expect(searchInput).toBeInTheDocument();

    // Search for "Refinancing"
    fireEvent.change(searchInput, { target: { value: "Refinancing" } });
    expect(screen.getByText("Home Loan Refinancing")).toBeInTheDocument();
    expect(screen.queryByText("Student Loan Secrets")).not.toBeInTheDocument();

    // Clear search
    const clearBtn = screen.getByLabelText("Clear search");
    fireEvent.click(clearBtn);
    expect(screen.getByText("Student Loan Secrets")).toBeInTheDocument();

    // Filter by Category button
    const eduCategoryBtn = screen.getByRole("button", { name: "Education" });
    fireEvent.click(eduCategoryBtn);
    expect(screen.getByText("Student Loan Secrets")).toBeInTheDocument();
    expect(screen.queryByText("Home Loan Refinancing")).not.toBeInTheDocument();
  });

  it("renders empty state message when no posts exist in catalog", () => {
    mockBlogPosts = [];

    render(
      <MemoryRouter>
        <BlogList />
      </MemoryRouter>,
    );

    expect(screen.getByText(/No blog posts found/i)).toBeInTheDocument();
  });

  it("handles pagination with Load More button when more than 6 posts exist", () => {
    mockBlogPosts = Array.from({ length: 8 }, (_, i) => ({
      slug: `post-${i + 1}`,
      title: `Article Number ${i + 1}`,
      excerpt: `Excerpt for article ${i + 1}`,
      date: `2026-05-0${(i % 9) + 1}`,
      readTime: "5 min read",
      category: "General",
    }));

    render(
      <MemoryRouter>
        <BlogList />
      </MemoryRouter>,
    );

    // Initial load should show top 6 posts sorted descending by date (articles 8 down to 3)
    expect(screen.getByText("Article Number 8")).toBeInTheDocument();
    expect(screen.getByText("Article Number 3")).toBeInTheDocument();
    expect(screen.queryByText("Article Number 1")).not.toBeInTheDocument();
    expect(screen.queryByText("Article Number 2")).not.toBeInTheDocument();

    // Load More button should be present
    const loadMoreBtn = screen.getByRole("button", {
      name: /Load More Articles/i,
    });
    expect(loadMoreBtn).toBeInTheDocument();

    // Click Load More
    fireEvent.click(loadMoreBtn);

    // Now articles 1 and 2 should also be visible
    expect(screen.getByText("Article Number 1")).toBeInTheDocument();
    expect(screen.getByText("Article Number 2")).toBeInTheDocument();

    // Load More button should disappear when all posts are displayed
    expect(
      screen.queryByRole("button", { name: /Load More Articles/i }),
    ).not.toBeInTheDocument();
  });
});
