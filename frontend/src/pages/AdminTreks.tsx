import { useQuery, useMutation } from "@tanstack/react-query";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";
const REQUIRE_ADMIN_KEY =
  String(import.meta.env.VITE_ADMIN_KEY_REQUIRED || "").toLowerCase() === "true";

type AdminTrek = {
  id: string;
  title: string;
  slug: string;
  isActive: boolean;
  createdAt: string;
};

export default function AdminTreks() {
  const { toast } = useToast();
  const [adminKey, setAdminKey] = useState("");
  const [savedKey, setSavedKey] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("admin_key");
    if (stored) {
      setAdminKey(stored);
      setSavedKey(stored);
    }
  }, []);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-treks"],
    queryFn: async () => {
      const res = await fetch(`${API}/api/admin/treks`, {
        headers: savedKey ? { "x-admin-key": savedKey } : undefined,
      });
      if (!res.ok) throw new Error("Failed to load treks");
      return res.json();
    },
    enabled: !!savedKey || !REQUIRE_ADMIN_KEY,
  });

  const toggleMutation = useMutation({
    mutationFn: async ({
      id,
      isActive,
    }: {
      id: string;
      isActive: boolean;
    }) => {
      const res = await fetch(`${API}/api/admin/treks/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(savedKey ? { "x-admin-key": savedKey } : {}),
        },
        body: JSON.stringify({ isActive }),
      });
      if (!res.ok) throw new Error("Failed to update trek");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-treks"] });
      queryClient.invalidateQueries({ queryKey: ["treks"] });
      toast({
        title: "Trek updated",
        description: "Visibility has been updated.",
      });
    },
    onError: (err: any) => {
      toast({
        title: "Update failed",
        description: err?.message || "Could not update trek",
      });
    },
  });

  return (
    <div className="min-h-screen bg-offwhite">
      <Navigation />
      <div className="container mx-auto px-4 md:px-6 py-24">
        <h1 className="text-3xl md:text-4xl font-serif font-bold">
          Admin Treks
        </h1>
        <p className="text-gray-600 mt-2">
          Toggle treks on or off for the public site.
        </p>

        {!savedKey && REQUIRE_ADMIN_KEY ? (
          <div className="mt-6 border rounded-lg bg-white p-4">
            <div className="text-sm text-gray-600 mb-2">
              Enter admin key to manage treks.
            </div>
            <div className="flex gap-2">
              <input
                type="password"
                value={adminKey}
                onChange={(e) => setAdminKey(e.target.value)}
                className="flex-1 border rounded px-3 py-2"
                placeholder="Admin key"
              />
              <button
                onClick={() => {
                  localStorage.setItem("admin_key", adminKey);
                  setSavedKey(adminKey);
                }}
                className="px-4 py-2 rounded bg-maroon text-white"
              >
                Save
              </button>
            </div>
          </div>
        ) : isLoading ? (
          <div className="mt-8">Loading...</div>
        ) : (
          <div className="mt-8 space-y-3">
            {(data || []).map((trek: AdminTrek) => (
              <div
                key={trek.id}
                className="flex items-center justify-between border rounded-lg p-4 bg-white"
              >
                <div>
                  <div className="font-semibold">{trek.title}</div>
                  <div className="text-sm text-gray-500">
                    {trek.slug}
                  </div>
                </div>
                <button
                  onClick={() =>
                    toggleMutation.mutate({
                      id: trek.id,
                      isActive: !trek.isActive,
                    })
                  }
                  className={`px-4 py-2 rounded font-medium ${
                    trek.isActive
                      ? "bg-forest text-white"
                      : "bg-gray-200 text-gray-700"
                  }`}
                >
                  {trek.isActive ? "Active" : "Inactive"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
