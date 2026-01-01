import { useQuery } from "@tanstack/react-query";
import { treks } from "@/data/treks";
import { Trek } from "@shared/schema";

// Simulating API calls with static data
// In a real app, these would use fetch(api.treks.list.path)

export function useTreks() {
  return useQuery({
    queryKey: ['/api/treks'],
    queryFn: async (): Promise<Trek[]> => {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500));
      return treks;
    },
  });
}

export function useTrek(slug: string) {
  return useQuery({
    queryKey: ['/api/treks', slug],
    queryFn: async (): Promise<Trek | null> => {
      await new Promise(resolve => setTimeout(resolve, 500));
      const trek = treks.find(t => t.slug === slug);
      if (!trek) return null;
      return trek;
    },
  });
}
