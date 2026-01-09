import { useQuery } from "@tanstack/react-query";
import { sanityClient } from "@/lib/sanity";
import { Blog } from "@shared/schema";

/**
 * Fetch all blogs (listing page)
 */
export function useBlogs() {
  return useQuery({
    queryKey: ["blogs"],
    staleTime: 1000 * 60 * 5, // 5 minutes
    cacheTime: 1000 * 60 * 30, // 30 minutes
    queryFn: async (): Promise<Blog[]> => {
      return sanityClient.fetch(`
        *[_type == "blog" && defined(slug.current)]
        | order(publishedAt desc) {
          title,
          "slug": slug.current,
          excerpt,
          coverImage,
          publishedAt
        }
      `);
    },
  });
}

/**
 * Fetch single blog by slug (detail page)
 */
export function useBlog(slug: string) {
  return useQuery({
    queryKey: ["blogs", slug],
    enabled: !!slug,
    staleTime: 1000 * 60 * 5,
    cacheTime: 1000 * 60 * 30,
    queryFn: async (): Promise<Blog | null> => {
      return sanityClient.fetch(
        `
        *[_type == "blog" && slug.current == $slug][0] {
          title,
          "slug": slug.current,
          excerpt,
          content,
          coverImage,
          publishedAt,

          // SEO
          seoTitle,
          seoDescription,

          // FAQs
          faqs[] {
            question,
            answer
          }
        }
        `,
        { slug }
      );
    },
  });
}
