import { Brand } from "@/components/brand";
export default function Page() {
  return (
    <main id="main" className="legal">
      <Brand />
      <h1>Mature stories. Clear boundaries.</h1>
      <p>
        Sakuga excludes hentai and explicitly pornographic works. Nudity,
        violence, ecchi, gore or other mature themes alone do not automatically
        exclude a nonpornographic title. Explicit provider classifications are
        excluded; ambiguous adult flags are quarantined for review. Only
        published titles can be read through public catalog policies, including
        their mappings and ratings. Images are not downloaded for excluded or
        quarantined titles. Classification is imperfect: use the report form on
        a title page to request review. The operator can make an audited
        override. Hide mature artwork in Settings for an additional personal
        preference.
      </p>
      <p className="notice">
        Pre-launch policy · Owner review and business details required before a
        public launch.
      </p>
    </main>
  );
}
