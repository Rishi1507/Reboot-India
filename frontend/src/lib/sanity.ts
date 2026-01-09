import { createClient } from "@sanity/client";

export const sanityClient = createClient({
  projectId: "q0df9xfw", // ✅ your project ID
  dataset: "reboot_india_data",
  apiVersion: "2024-01-01",
  useCdn: true,
});
