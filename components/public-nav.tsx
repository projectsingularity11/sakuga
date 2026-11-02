import { PublicNavContent } from "./public-nav-content";
import { viewerLanguage, viewerSignedIn } from "@/lib/viewer";
export async function PublicNav() {
  const [language, signedIn] = await Promise.all([
    viewerLanguage(),
    viewerSignedIn(),
  ]);
  return <PublicNavContent language={language} signedIn={signedIn} />;
}
