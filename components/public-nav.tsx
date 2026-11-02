import { PublicNavContent } from "./public-nav-content";
import { viewerLanguage } from "@/lib/viewer";
export async function PublicNav() {
  return <PublicNavContent language={await viewerLanguage()} />;
}
