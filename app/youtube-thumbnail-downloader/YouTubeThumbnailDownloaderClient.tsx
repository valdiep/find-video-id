"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

function isValidVideoId(value: string) {
  return /^[A-Za-z0-9_-]{11}$/.test(value);
}

function cleanCandidate(value: string | null | undefined) {
  if (!value) return null;
  const cleaned = value.split("?")[0].split("&")[0].split("/")[0];
  return isValidVideoId(cleaned) ? cleaned : null;
}

function extractYouTubeVideoId(input: string) {
  if (!input.trim()) {
    return { ok: false as const, error: "Paste a YouTube video URL to get started." };
  }

  const raw = input.trim();

  if (isValidVideoId(raw)) {
    return { ok: true as const, id: raw, source: "Direct video ID" };
  }

  let url: URL;
  try {
    url = new URL(raw.startsWith("http") ? raw : `https://${raw}`);
  } catch {
    return {
      ok: false as const,
      error: "That does not look like a valid YouTube URL or 11-character video ID.",
    };
  }

  const host = url.hostname.replace(/^www\./, "").toLowerCase();
  const path = url.pathname;

  if (!["youtube.com", "m.youtube.com", "music.youtube.com", "youtu.be"].includes(host)) {
    return {
      ok: false as const,
      error: "Please paste a valid YouTube watch link, Shorts link, youtu.be link, embed link, or direct video ID.",
    };
  }

  if (host === "youtu.be") {
    const id = cleanCandidate(path.replace(/^\//, ""));
    if (id) return { ok: true as const, id, source: "Short share URL" };
  }

  const watchId = cleanCandidate(url.searchParams.get("v"));
  if (watchId) {
    return { ok: true as const, id: watchId, source: "Watch URL" };
  }

  const parts = path.split("/").filter(Boolean);

  if (parts[0] === "shorts") {
    const id = cleanCandidate(parts[1]);
    if (id) return { ok: true as const, id, source: "Shorts URL" };
  }

  if (parts[0] === "embed") {
    const id = cleanCandidate(parts[1]);
    if (id) return { ok: true as const, id, source: "Embed URL" };
  }

  if (parts[0] === "live") {
    const id = cleanCandidate(parts[1]);
    if (id) return { ok: true as const, id, source: "Live URL" };
  }

  return {
    ok: false as const,
    error: "No YouTube video ID was found in that link.",
  };
}

function getThumbnailOptions(videoId: string) {
  return [
    {
      label: "Max resolution",
      size: "1280×720",
      url: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
    },
    {
      label: "Standard definition",
      size: "640×480",
      url: `https://img.youtube.com/vi/${videoId}/sddefault.jpg`,
    },
    {
      label: "High quality",
      size: "480×360",
      url: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
    },
    {
      label: "Medium quality",
      size: "320×180",
      url: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
    },
  ];
}

function slugifyLabel(label: string) {
  return label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function getDownloadUrl(imageUrl: string, filename: string) {
  return `/api/download-thumbnail?url=${encodeURIComponent(imageUrl)}&filename=${encodeURIComponent(
    filename
  )}`;
}

const buttonBaseClass =
  "cursor-pointer transition duration-150 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-slate-300";

export default function YouTubeThumbnailDownloaderClient() {
  const [input, setInput] = useState("");
  const [submitted, setSubmitted] = useState("");

  const result = useMemo(() => extractYouTubeVideoId(submitted), [submitted]);
  const thumbnails = result.ok ? getThumbnailOptions(result.id) : [];

  const examples = [
    "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "https://youtu.be/dQw4w9WgXcQ",
    "https://www.youtube.com/shorts/dQw4w9WgXcQ",
  ];

  const handleSubmit = (value?: string) => {
    const finalInput = (value ?? input).trim();
    setSubmitted(finalInput);
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 md:px-10">
          <div>
            <div className="text-xl font-bold tracking-tight">Find Video ID</div>
            <div className="text-sm text-slate-500">YouTube Thumbnail Downloader</div>
          </div>

          <div className="hidden gap-3 md:flex">
            <Link
              href="/"
              className={`rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 ${buttonBaseClass}`}
            >
              Home
            </Link>
            <Link
              href="/youtube-channel-id"
              className={`rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 ${buttonBaseClass}`}
            >
              Channel ID Tool
            </Link>
            <Link
              href="/youtube-video-id"
              className={`rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 ${buttonBaseClass}`}
            >
              Video ID Tool
            </Link>
          </div>
        </div>
      </header>

      <section className="border-b border-slate-200 bg-gradient-to-b from-red-50 via-white to-slate-50">
        <div className="mx-auto max-w-5xl px-6 py-16 text-center md:px-10 md:py-24">
          <div className="inline-flex items-center rounded-full border border-red-200 bg-white px-3 py-1 text-xs font-medium text-red-700 shadow-sm">
            Free YouTube tools
          </div>

          <h1 className="mt-5 text-4xl font-bold tracking-tight md:text-6xl">
            Download YouTube thumbnails in seconds
          </h1>

          <p className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-slate-600">
            Paste a YouTube video URL to generate downloadable thumbnail images in multiple sizes
            instantly.
          </p>

          <div className="mx-auto mt-10 max-w-3xl rounded-[28px] border border-slate-200 bg-white p-6 text-left shadow-sm">
            <label className="mb-3 block text-sm font-medium text-slate-700">
              Paste a YouTube URL
            </label>

            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSubmit();
                  }
                }}
                placeholder="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                className="w-full rounded-2xl border border-slate-300 px-4 py-3.5 text-sm outline-none transition focus:border-slate-900"
              />

              <button
                onClick={() => handleSubmit()}
                className={`cursor-pointer rounded-2xl bg-slate-900 px-5 py-3.5 text-sm font-medium text-white shadow-sm hover:opacity-95 ${buttonBaseClass}`}
              >
                Get thumbnails
              </button>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {examples.map((example, index) => (
                <button
                  key={example}
                  onClick={() => {
                    setInput(example);
                    handleSubmit(example);
                  }}
                  className={`rounded-full border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-600 hover:border-slate-900 hover:text-slate-900 ${buttonBaseClass}`}
                >
                  Example {index + 1}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row sm:flex-wrap">
            <Link
              href="/youtube-channel-id"
              className={`inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-6 py-3 text-base font-semibold text-slate-900 hover:bg-slate-50 ${buttonBaseClass}`}
            >
              Channel ID Tool
            </Link>

            <Link
              href="/youtube-video-id"
              className={`inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-6 py-3 text-base font-semibold text-slate-900 hover:bg-slate-50 ${buttonBaseClass}`}
            >
              Video ID Tool
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-10 md:px-10">
        {!submitted ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Thumbnails
            </div>
            <div className="mt-3 text-sm text-slate-600">
              Paste a YouTube video URL above to generate thumbnail downloads.
            </div>
          </div>
        ) : result.ok ? (
          <div className="grid gap-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Thumbnail preview
              </div>

              <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
                <img
                  src={thumbnails[0].url}
                  alt={`Thumbnail preview for ${result.id}`}
                  className="h-full w-full object-cover"
                />
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Download options
              </div>

              <div className="mt-4 grid gap-3">
                {thumbnails.map((thumb) => {
                  const filename = `${result.id}-${slugifyLabel(thumb.label)}.jpg`;

                  return (
                    <div
                      key={thumb.url}
                      className="flex flex-col gap-3 rounded-2xl border border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div>
                        <div className="text-sm font-semibold text-slate-900">{thumb.label}</div>
                        <div className="mt-1 text-xs text-slate-500">{thumb.size}</div>
                        <div className="mt-1 break-all text-xs text-slate-500">{thumb.url}</div>
                      </div>

                      <a
                        href={getDownloadUrl(thumb.url, filename)}
                        className={`inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:opacity-95 ${buttonBaseClass}`}
                      >
                        Download thumbnail
                      </a>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900 shadow-sm">
            {result.error}
          </div>
        )}
      </section>

      <section className="mx-auto max-w-5xl px-6 pb-10 md:px-10">
        <div className="grid gap-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">
              YouTube Thumbnail Downloader – Free & Fast
            </h2>
            <div className="mt-4 grid gap-4 text-sm leading-7 text-slate-600">
              <p>
                This free YouTube thumbnail downloader lets you instantly extract and download
                thumbnails from any YouTube video in HD quality. Simply paste a video URL or video
                ID and get access to all available thumbnail sizes, including max resolution.
              </p>
              <p>
                Whether you need a YouTube thumbnail for inspiration, design, or analysis, this
                tool gives you fast access without any login or signup required.
              </p>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">
              How to Download YouTube Thumbnails
            </h2>
            <div className="mt-4 grid gap-4 text-sm leading-7 text-slate-600">
              <p>1. Paste a YouTube video URL or ID.</p>
              <p>2. Click Get thumbnails.</p>
              <p>3. Download your preferred thumbnail resolution.</p>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">
              YouTube Thumbnail Downloader FAQs
            </h2>

            <div className="mt-6 grid gap-4">
              <div className="rounded-2xl border border-slate-200 p-4">
                <h3 className="text-base font-semibold text-slate-900">
                  Can I download any YouTube thumbnail?
                </h3>
                <p className="mt-2 text-sm leading-7 text-slate-600">
                  Yes, you can download thumbnails from any public YouTube video by entering the
                  video URL or ID.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 p-4">
                <h3 className="text-base font-semibold text-slate-900">
                  What thumbnail quality can I download?
                </h3>
                <p className="mt-2 text-sm leading-7 text-slate-600">
                  This tool provides all available thumbnail sizes, including max resolution (HD),
                  high quality, and standard quality.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 p-4">
                <h3 className="text-base font-semibold text-slate-900">
                  Do I need to sign up to use this tool?
                </h3>
                <p className="mt-2 text-sm leading-7 text-slate-600">
                  No, this YouTube thumbnail downloader is completely free and requires no login or
                  signup.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 p-4">
                <h3 className="text-base font-semibold text-slate-900">
                  Can I use YouTube thumbnails for commercial use?
                </h3>
                <p className="mt-2 text-sm leading-7 text-slate-600">
                  Thumbnails may be subject to copyright. Always ensure you have permission before
                  using them commercially.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 p-4">
                <h3 className="text-base font-semibold text-slate-900">
                  Does this work on mobile and desktop?
                </h3>
                <p className="mt-2 text-sm leading-7 text-slate-600">
                  Yes, the tool works on all devices including mobile, tablet, and desktop
                  browsers.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 pb-10 md:px-10">
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-6 text-center shadow-sm md:p-8">
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Advertisement
          </div>
          <div className="mt-4 rounded-2xl bg-slate-100 px-4 py-14 text-sm text-slate-500">
            Ad space
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-6 text-sm text-slate-500 md:flex-row md:items-center md:justify-between md:px-10">
          <div>© 2026 Find Video ID</div>

          <div className="flex flex-wrap items-center gap-4">
            <Link href="/privacy-policy" className="transition hover:text-slate-700">
              Privacy Policy
            </Link>
            <Link href="/terms" className="transition hover:text-slate-700">
              Terms
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}