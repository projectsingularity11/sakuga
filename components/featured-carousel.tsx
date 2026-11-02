"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, useSyncExternalStore } from "react";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Pause,
  Play,
  Plus,
} from "lucide-react";
import type { Anime } from "@/lib/domain";
import { trustedImage } from "@/lib/domain";
import { resolveTitle, formatLabel } from "@/lib/metadata";
import { englishSynopsis, releaseDescription, mediaLinks } from "@/lib/media";
import { animeHref } from "@/lib/series";
import { CoverImage } from "./cover-image";
const subscribe = (cb: () => void) => {
  const mq = matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};
const reduced = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
export function FeaturedCarousel({
  titles,
  language,
}: {
  titles: Anime[];
  language: string;
}) {
  const [index, setIndex] = useState(0),
    [paused, setPaused] = useState(false),
    [hovered, setHovered] = useState(false),
    [focused, setFocused] = useState(false),
    [hidden, setHidden] = useState(false),
    [manual, setManual] = useState(false);
  const reduce = useSyncExternalStore(subscribe, reduced, () => true);
  const auto =
    titles.length > 1 && !paused && !hovered && !focused && !hidden && !reduce;
  useEffect(() => {
    const change = () => setHidden(document.hidden);
    document.addEventListener("visibilitychange", change);
    return () => document.removeEventListener("visibilitychange", change);
  }, []);
  useEffect(() => {
    if (!auto) return;
    const timer = setTimeout(() => {
      setManual(false);
      setIndex((i) => (i + 1) % titles.length);
    }, 7500);
    return () => clearTimeout(timer);
  }, [auto, index, titles.length]);
  const a = titles[index];
  function choose(next: number) {
    setManual(true);
    setPaused(true);
    setIndex((next + titles.length) % titles.length);
  }
  if (!a)
    return (
      <section className="discovery-feature feature-empty">
        <h1>Explore anime</h1>
        <Link className="button" href="/discover">
          Open catalog <ArrowUpRight size={18} />
        </Link>
      </section>
    );
  const title = resolveTitle(a, language),
    media = mediaLinks(a);
  return (
    <section
      className="discovery-feature"
      aria-roledescription="carousel"
      aria-label="Featured anime"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocusCapture={() => setFocused(true)}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setFocused(false);
      }}
    >
      <div
        className="feature-scene"
        key={a.id}
        role="group"
        aria-roledescription="slide"
        aria-label={`${index + 1} of ${titles.length}: ${title}`}
      >
        <Image
          className="featured-backdrop"
          src={
            trustedImage(a.banner_url) ||
            trustedImage(a.cover_url) ||
            "/art/sakuga-city.png"
          }
          alt=""
          fill
          priority={index === 0}
          sizes="100vw"
          unoptimized={/^https:\/\/cdn\./.test(
            a.banner_url || a.cover_url || "",
          )}
        />
        <div className="feature-light" aria-hidden="true" />
        <div className="featured-content">
          <h1 title={title}>{title}</h1>
          <p className="featured-meta">
            <span>{formatLabel(a.format)}</span>
            <span>{a.year || "Year unknown"}</span>
            <span>
              {(a.series_count || 1) > 1
                ? `${a.series_count} seasons / parts`
                : a.episodes
                  ? `${a.episodes} episodes`
                  : "Episodes unannounced"}
            </span>
          </p>
          <p className="featured-synopsis">
            {englishSynopsis(a) || releaseDescription(a)}
          </p>
          <div className="hero-actions">
            <Link className="button" href={animeHref(a)}>
              Explore anime <ArrowUpRight size={17} />
            </Link>
            <Link className="button outline" href={animeHref(a, true)}>
              <Plus size={16} /> My list
            </Link>
            <a
              className="hero-preview"
              href={media.trailer || media.trailerSearch}
              target="_blank"
              rel="noreferrer"
            >
              <Play size={15} />
              <span className="preview-label">
                {media.trailer ? "Trailer" : "Find trailer"}
              </span>
            </a>
          </div>
        </div>
        <div className="hero-gallery">
          <div className="glass-orbit" aria-hidden="true" />
          <Link
            className="gallery-main"
            href={animeHref(a)}
            aria-label={`View ${title}`}
          >
            <CoverImage
              key={a.id}
              src={trustedImage(a.cover_url)}
              title={title}
              priority={index === 0}
            />
            <span className="poster-open">
              <ArrowUpRight size={23} />
              <span>View anime</span>
            </span>
          </Link>
        </div>
      </div>
      {titles.length > 1 && (
        <div className="feature-controls">
          <div className="feature-pages" aria-label="Choose featured anime">
            {titles.map((anime, i) => (
              <button
                key={anime.id}
                type="button"
                aria-label={`Show ${resolveTitle(anime, language)}`}
                aria-current={i === index ? "true" : undefined}
                onClick={() => choose(i)}
              >
                <span />
              </button>
            ))}
          </div>
          <div className="feature-transport">
            <span className="feature-position">
              {String(index + 1).padStart(2, "0")}{" "}
              <span>/ {String(titles.length).padStart(2, "0")}</span>
            </span>
            <button
              className="icon-control"
              type="button"
              aria-label="Previous featured anime"
              onClick={() => choose(index - 1)}
            >
              <ArrowLeft size={17} />
            </button>
            <button
              className="icon-control"
              type="button"
              aria-label={
                paused || reduce
                  ? "Play featured anime"
                  : "Pause featured anime"
              }
              disabled={reduce}
              onClick={() => setPaused(!paused)}
            >
              {paused || reduce ? <Play size={15} /> : <Pause size={15} />}
            </button>
            <button
              className="icon-control"
              type="button"
              aria-label="Next featured anime"
              onClick={() => choose(index + 1)}
            >
              <ArrowRight size={17} />
            </button>
          </div>
        </div>
      )}
      <p className="sr-only" aria-live="polite">
        {manual ? `Featured anime: ${title}` : ""}
      </p>
    </section>
  );
}
