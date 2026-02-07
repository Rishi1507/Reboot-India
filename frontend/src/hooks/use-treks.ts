import { useQuery } from "@tanstack/react-query";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

export function useTreks() {
  return useQuery({
    queryKey: ["treks"],
    queryFn: async () => {
      const res = await fetch(`${API}/api/treks`);
      if (!res.ok) throw new Error("Failed to fetch treks");
      return res.json();
    },
  });
}

export function useTrek(slug: string) {
  return useQuery({
    queryKey: ["trek", slug],
    enabled: !!slug,
    queryFn: async () => {
      const res = await fetch(`${API}/api/treks/${slug}`);
      if (!res.ok) throw new Error("Trek not found");
      return res.json();
    },
  });
}
