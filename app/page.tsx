import Link from "next/link";
import {
  ArrowUpRight,
  ArrowRight,
  Bookmark,
  PanelsTopLeft,
  Palette,
  Library,
  Check,
} from "lucide-react";
import { Brand } from "@/components/brand";
export default function Home() {
  return (
    <>
      <header className="public-nav">
        <Brand />
        <nav aria-label="Main">
          <a href="#your-space">Your space</a>
          <a href="#made-for-you">The details</a>
          <Link href="/pricing">Support Sakuga</Link>
        </nav>
        <div>
          <Link className="text-link" href="/login">
            Log in
          </Link>
          <Link className="button small" href="/signup">
            Make yourself at home <ArrowUpRight size={15} />
          </Link>
        </div>
      </header>
      <main id="main">
        <section className="hero">
          <div className="hero-copy">
            <h1>
              Your anime life.
              <br />
              <em>Beautifully</em>
              <br />
              organized.
            </h1>
            <p>
              For the stories that stay with you.
              <br />A thoughtful home to discover your next favorite, collect
              the ones you love, and watch at your own pace.
            </p>
            <Link href="/signup" className="button">
              Start your collection <ArrowUpRight size={18} />
            </Link>
            <span className="quiet-note">Free to make your own. Always.</span>
          </div>
          <div
            className="shelf-art"
            aria-label="Illustration of a personal anime library, with no fabricated anime or ratings"
          >
            <div className="shelf-top">
              <span>
                <Library size={16} /> A space for your stories
              </span>
              <span>私の居場所</span>
            </div>
            <div className="artwork">
              <div className="sun" />
              <div className="mountain back" />
              <div className="mountain front" />
              <div className="art-title">
                Some stories
                <br />
                feel like home.
              </div>
              <span className="art-caption">SAKUGA • A PERSONAL SANCTUARY</span>
            </div>
            <div className="shelf-bottom">
              <div>
                <Bookmark size={18} />
                <span>
                  Your next chapter
                  <br />
                  <small>Find it. Save it. Make it yours.</small>
                </span>
              </div>
              <ArrowUpRight size={22} />
            </div>
            <div className="shelf-tab">
              A little less searching.
              <br />
              <em>A little more watching.</em>
            </div>
          </div>
        </section>
        <div className="values-line">
          <span>ONE LIBRARY. YOUR WAY.</span>
          <span>No invented ratings</span>
          <span>Private by default</span>
          <span>Your data, yours to take</span>
        </div>
        <section id="your-space" className="feature-section">
          <div>
            <h2>
              A collection,
              <br />
              <em>not a spreadsheet.</em>
            </h2>
            <p>
              Keep every watchlist, late-night discovery, and comfort rewatch
              together. One title. One history. As many collections as you like.
            </p>
            <Link className="text-link" href="/signup">
              Build your little corner <ArrowRight size={17} />
            </Link>
          </div>
          <div className="library-preview">
            <div className="preview-heading">
              <span>My library</span>
              <Library size={20} />
            </div>
            <div className="preview-tabs">
              <span className="active">All stories</span>
              <span>Watching</span>
              <span>Someday</span>
            </div>
            <div className="empty-shelf">
              <Bookmark size={34} />
              <h3>Your first favorite belongs here.</h3>
              <p>
                Find a story. Give it a place.
                <br />
                Let your collection grow with you.
              </p>
              <Link href="/signup" className="button small">
                Create your library <ArrowUpRight size={15} />
              </Link>
            </div>
            <span className="preview-caption">
              A new library starts empty. The stories are up to you.
            </span>
          </div>
        </section>
        <section id="made-for-you" className="details-section">
          <h2>
            The little things.
            <br />
            <em>Thought all the way through.</em>
          </h2>
          <div className="detail-columns">
            <article>
              <PanelsTopLeft />
              <h3>One library. Many perspectives.</h3>
              <p>
                A shelf, a compact list, or a status board. Organize by genre,
                create a collection, or let a smart rule do the sorting.
              </p>
            </article>
            <article>
              <Check />
              <h3>Ratings with their sources.</h3>
              <p>
                See where a score comes from, its original scale, and when it
                was refreshed. Missing data stays missing.
              </p>
            </article>
            <article>
              <Palette />
              <h3>Set the atmosphere.</h3>
              <p>
                Quiet ink. Warm porcelain. A little matcha. Choose your palette,
                then make the space feel like you.
              </p>
            </article>
          </div>
        </section>
        <section className="support-strip">
          <div>
            <h2>
              A small thank-you.
              <br />A quieter forever.
            </h2>
            <p>
              $5 once. No subscription. Ads aren’t currently shown. Support
              Sakuga now and keep Sakuga-served ads out of your account for the
              lifetime of the service.
            </p>
          </div>
          <Link href="/pricing" className="button outline">
            Meet Sakuga Supporter <ArrowUpRight size={18} />
          </Link>
        </section>
      </main>
      <footer>
        <Brand />
        <span>Keep the stories close.</span>
        <nav>
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
          <Link href="/content-policy">Content policy</Link>
        </nav>
      </footer>
    </>
  );
}
