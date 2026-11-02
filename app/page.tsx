import Link from "next/link";
import Image from "next/image";
import {
  ArrowUpRight,
  ArrowRight,
  Search,
  Bookmark,
  Layers,
  Sparkles,
  MoveUpRight,
} from "lucide-react";
import { Brand, SketchMark } from "@/components/brand";
import { PublicNav } from "@/components/public-nav";
import spotlight from "@/data/spotlight.json";
const names: Record<string, string> = {
  "Sousou no Frieren": "Frieren: Beyond Journey’s End",
  "Kimetsu no Yaiba": "Demon Slayer",
  "Kimi no Na wa.": "Your Name.",
};
export default function Home() {
  return (
    <div className="cinema-home">
      <PublicNav />
      <main id="main">
        <section className="cinema-hero">
          <Image
            className="hero-scene"
            src="/art/sakuga-city.png"
            alt="An original anime city at dusk, seen from a rooftop"
            fill
            priority
            sizes="100vw"
          />
          <div className="hero-shade" />
          <div className="hero-frame" aria-hidden="true">
            <span>作画</span>
            <span>KEEP THE FEELING.</span>
          </div>
          <div className="cinema-copy">
            <h1>
              Some stories
              <br />
              stay with <em>you.</em>
            </h1>
            <p>
              Find the next one. Keep every favorite.
              <br />
              Your anime life, all in one place.
            </p>
            <div className="hero-actions">
              <Link href="/discover" className="button">
                Find your next story
                <ArrowUpRight size={19} />
              </Link>
              <Link href="/signup" className="hero-secondary">
                Start your collection
                <ArrowRight size={17} />
              </Link>
            </div>
          </div>
          <div className="hero-bottom">
            <span>
              <i /> A home for the anime-obsessed.
            </span>
            <span>Discover. Collect. Repeat.</span>
            <a href="#stories" aria-label="Explore the stories below">
              <ArrowRight size={20} />
            </a>
          </div>
        </section>
        <div className="discovery-dock">
          <span className="dock-label">
            <Sparkles size={19} />
            Follow your curiosity
          </span>
          <form action="/discover" className="home-search">
            <Search size={19} />
            <input
              name="q"
              aria-label="Search anime"
              placeholder="A title, a feeling, a new obsession…"
              maxLength={100}
            />
            <button aria-label="Search catalog">
              <ArrowUpRight size={20} />
            </button>
          </form>
          <Link href="/discover?short=true">
            One weekend to spare?
            <ArrowUpRight size={15} />
          </Link>
        </div>
        <section id="stories" className="home-shelf">
          <div className="shelf-heading">
            <div>
              <h2>Worth falling into.</h2>
              <p>
                A few stories to get you started. Your next favorite is out
                there.
              </p>
            </div>
            <Link href="/discover">
              Explore the catalog
              <ArrowUpRight size={17} />
            </Link>
          </div>
          <div className="spotlight-grid">
            {spotlight.slice(0, 6).map((a, i) => (
              <Link
                className="spotlight-card"
                href={`/anime/${a.id}`}
                key={a.id}
              >
                <div className="spotlight-cover">
                  <Image
                    src={a.cover}
                    alt={`${names[a.title] || a.title} cover artwork`}
                    fill
                    sizes="(max-width:700px) 43vw, (max-width:1000px) 28vw, 15vw"
                  />
                  <span className="cover-format">
                    {a.format === "MOVIE" ? "FILM" : `${a.episodes} EPISODES`}
                  </span>
                  <span className="cover-open">
                    <MoveUpRight size={20} />
                  </span>
                </div>
                <div className="spotlight-meta">
                  <span>
                    {a.year} / {a.format}
                  </span>
                  <Bookmark size={14} />
                </div>
                <h3>{names[a.title] || a.title}</h3>
                <span className="shelf-index">
                  {String(i + 1).padStart(2, "0")}
                </span>
              </Link>
            ))}
          </div>
          <p className="art-attribution">
            Cover artwork via MyAnimeList · Metadata from
            anime-offline-database, ODbL.{" "}
            <Link href="/content-policy">
              Sources & content policy
              <ArrowUpRight size={12} />
            </Link>
          </p>
        </section>
        <section className="collection-feature" id="your-space">
          <div className="collection-composition">
            <div className="collection-caption">
              <SketchMark />
              <span>A collection that feels like you.</span>
            </div>
            <div className="collection-posters">
              {[spotlight[6], spotlight[7], spotlight[1]].map((a) => (
                <Link href={`/anime/${a.id}`} key={a.id}>
                  <Image
                    src={a.cover}
                    alt={names[a.title] || a.title}
                    fill
                    sizes="(max-width:700px) 30vw, 16vw"
                  />
                </Link>
              ))}
            </div>
            <div className="composition-note">
              <Bookmark size={16} />
              <span>The ones you always come back to.</span>
            </div>
          </div>
          <div className="collection-copy">
            <h2>
              Your taste.
              <br />
              Your little
              <br />
              <em>universe.</em>
            </h2>
            <p>
              The midnight discoveries. The comfort rewatches. The series your
              friend won’t stop talking about. Give them all a place.
            </p>
            <Link href="/signup" className="button">
              Start your collection
              <ArrowUpRight size={18} />
            </Link>
            <div className="feature-facts">
              <span>
                <Bookmark size={17} />
                Keep your place
              </span>
              <span>
                <Layers size={17} />
                Build your own collections
              </span>
            </div>
          </div>
        </section>
        <section className="mood-section">
          <div className="shelf-heading">
            <div>
              <h2>What’s your mood?</h2>
              <p>There’s a whole world on the other side of a genre.</p>
            </div>
          </div>
          <div className="mood-grid">
            {[
              {
                genre: "Action",
                word: "Feel the rush.",
                sub: "Big stakes. Bigger moments.",
                image: spotlight[2],
              },
              {
                genre: "Fantasy",
                word: "Go somewhere else.",
                sub: "Worlds worth getting lost in.",
                image: spotlight[0],
              },
              {
                genre: "Drama",
                word: "Feel everything.",
                sub: "For the beautifully human stories.",
                image: spotlight[6],
              },
            ].map((m) => (
              <Link
                href={`/discover?genre=${m.genre}`}
                className="mood-card"
                key={m.genre}
              >
                <Image
                  src={m.image.cover}
                  alt=""
                  fill
                  sizes="(max-width:700px) 90vw, 30vw"
                />
                <div />
                <span className="mood-name">
                  {m.genre}
                  <ArrowUpRight size={19} />
                </span>
                <h3>{m.word}</h3>
                <p>{m.sub}</p>
              </Link>
            ))}
          </div>
        </section>
        <section className="home-invitation">
          <SketchMark />
          <h2>
            Good stories.
            <br />
            <em>Better kept.</em>
          </h2>
          <Link href="/signup" className="button">
            Make yourself at home
            <ArrowUpRight size={18} />
          </Link>
          <p>Free to start. Made for your kind of obsession.</p>
        </section>
      </main>
      <footer>
        <Brand />
        <span>Keep the stories close.</span>
        <nav aria-label="Footer">
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
          <Link href="/content-policy">Content policy</Link>
        </nav>
      </footer>
    </div>
  );
}
