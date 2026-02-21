import { useQuery } from "@tanstack/react-query";
import { sanityClient } from "@/lib/sanity";

export type SanityTrekBlogListItem = {
  title: string;
  slug: string;
  shortIntro?: string;
  publishAt?: string;
};

export type SanityTrekBlogDetail = {
  title: string;
  slug: string;
  author?: string;
  status?: string;
  publishAt?: string;
  shortIntro?: string;
  content?: any;
  featuredImage?: any;
  imageAltText?: string;
  highlights?: string[];
  itinerary?: any[];
  metaTitle?: string;
  metaDescription?: string;
};

export function useTrekBlogs(trekSlug: string) {
  return useQuery({
    queryKey: ["trekBlogs", trekSlug],
    enabled: Boolean(trekSlug),
    staleTime: 1000 * 60 * 5,
    queryFn: async (): Promise<SanityTrekBlogListItem[]> => {
      return sanityClient.fetch(
        `
        *[_type == "trekBlog" && trekSlug == $trekSlug && defined(slug.current) && status == "PUBLISHED"]
        | order(coalesce(publishAt, _createdAt) desc) {
          title,
          "slug": slug.current,
          shortIntro,
          publishAt
        }
        `,
        { trekSlug }
      );
    },
  });
}

export function useTrekBlog(trekSlug: string, blogSlug: string) {
  return useQuery({
    queryKey: ["trekBlogs", trekSlug, blogSlug],
    enabled: Boolean(trekSlug) && Boolean(blogSlug),
    staleTime: 1000 * 60 * 5,
    queryFn: async (): Promise<SanityTrekBlogDetail | null> => {
      return sanityClient.fetch(
        `
        *[_type == "trekBlog" && trekSlug == $trekSlug && slug.current == $blogSlug][0]{
          title,
          "slug": slug.current,
          author,
          status,
          publishAt,
          shortIntro,
          content,
          featuredImage,
          imageAltText,
          highlights,
          itinerary,
          metaTitle,
          metaDescription
        }
        `,
        { trekSlug, blogSlug }
      );
    },
  });
}

