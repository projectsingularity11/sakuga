"use client";
import { BorderBeam } from "./border-beam";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useReducedMotion } from "./use-reduced-motion";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Pause,
  Play,
  Plus,
} from "lucide-react";
import type { FeatureSlide } from "@/lib/home-feature";
import { ArtPicture } from "./art-picture";
export function FeaturedCarousel({ titles }: { titles: FeatureSlide[] }) {
  const [index, setIndex] = useState(0),
    [paused, setPaused] = useState(false),
    [hovered, setHovered] = useState(false),
    [focused, setFocused] = useState(false),
    [hidden, setHidden] = useState(false),
    [manual, setManual] = useState(false);
  const reduce = useReducedMotion();
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
  useEffect(() => {
    const connection = (
      navigator as Navigator & { connection?: { saveData?: boolean } }
    ).connection;
    const next = titles[(index + 1) % titles.length];
    if (hidden || connection?.saveData || !next?.art) return;
    const image = matchMedia("(max-width:600px)").matches
      ? next.art.cover
      : next.art.banner;
    if (!image) return;
    const link = document.createElement("link");
    link.rel = "prefetch";
    link.as = "image";
    link.type = "image/avif";
    link.href = image.avif;
    const timer = setTimeout(() => document.head.appendChild(link), 1600);
    return () => {
      clearTimeout(timer);
      link.remove();
    };
  }, [index, hidden, titles]);
  const a = titles[index];
  function choose(next: number) {
    setManual(true);
    setPaused(true);
    setIndex((next + titles.length) % titles.length);
  }
  if (!a)
    return (
      <section className="discovery-feature feature-empty">
        <h2>Explore anime</h2>
        <Link className="button" href="/discover">
          Open catalog <ArrowUpRight size={18} />
        </Link>
      </section>
    );
  const title = a.title;
  return (
    <section
      className="discovery-feature"
      data-auto={auto}
      aria-roledescription="carousel"
      aria-label="Featured anime"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocusCapture={() => setFocused(true)}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setFocused(false);
      }}
    >
      <BorderBeam />
      <div
        className="feature-scene"
        key={a.id}
        role="group"
        aria-roledescription="slide"
        aria-label={`${index + 1} of ${titles.length}: ${title}`}
      >
        {a.art?.banner ? (
          <ArtPicture
            art={a.art.banner}
            mobile={a.art.cover}
            className="featured-backdrop"
            eager={index === 0}
          />
        ) : (
          <Image
            className="featured-backdrop"
            src={a.banner || a.cover || "/art/sakuga-city.png"}
            alt=""
            fill
            priority={index === 0}
            sizes="100vw"
          />
        )}
        <div className="featured-content">
          <h2 title={title}>{title}</h2>
          <p className="featured-meta">
            <span>{a.format}</span>
            <span>{a.year}</span>
            <span>{a.parts} </span>
          </p>
          <p className="featured-synopsis">{a.synopsis}</p>
          <div className="hero-actions">
            <Link className="button" href={a.href}>
              Explore anime <ArrowUpRight size={17} />
            </Link>
            <Link className="button outline" href={a.libraryHref}>
              <Plus size={16} /> My list
            </Link>
            <a
              className="hero-preview"
              aria-label={a.hasTrailer ? "Watch trailer" : "Find trailer"}
              href={a.trailer}
              target="_blank"
              rel="noreferrer"
            >
              <Play size={15} />
              <span className="preview-label">
                {a.hasTrailer ? "Trailer" : "Find trailer"}
              </span>
            </a>
          </div>
        </div>
      </div>
      {titles.length > 1 && (
        <div className="feature-controls">
          <div className="feature-pages" aria-label="Choose featured anime">
            {titles.map((anime, i) => (
              <button
                key={anime.id}
                type="button"
                aria-label={`Show ${anime.title}`}
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
