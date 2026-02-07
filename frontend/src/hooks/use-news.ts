import { useQuery } from "@tanstack/react-query";
import { sanityClient } from "@/lib/sanity";

export type NewsItem = {
  title: string;
  slug: string;
  excerpt?: string;
  coverImage?: any;
  publishedAt?: string;
};

export function useNews() {
  return useQuery({
    queryKey: ["news"],
    staleTime: 1000 * 60 * 5,
    cacheTime: 1000 * 60 * 30,
    queryFn: async (): Promise<NewsItem[]> => {
      return sanityClient.fetch(`
        *[_type == "news" && defined(slug.current)]
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
