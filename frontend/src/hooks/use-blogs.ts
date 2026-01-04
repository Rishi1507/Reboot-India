import { useQuery } from "@tanstack/react-query";
import { blogs } from "@/data/blogs";
import { Blog } from "@shared/schema";

export function useBlogs() {
  return useQuery({
    queryKey: ['/api/blogs'],
    queryFn: async (): Promise<Blog[]> => {
      await new Promise(resolve => setTimeout(resolve, 500));
      return blogs;
    },
  });
}

export function useBlog(slug: string) {
  return useQuery({
    queryKey: ['/api/blogs', slug],
    queryFn: async (): Promise<Blog | null> => {
      await new Promise(resolve => setTimeout(resolve, 500));
      const blog = blogs.find(b => b.slug === slug);
      if (!blog) return null;
      return blog;
    },
  });
}
