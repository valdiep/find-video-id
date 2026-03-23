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
    return { ok: false as const, error: "Paste a YouTube URL to get started." };
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
      error: "Please paste a valid YouTube link.",
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

export default function YouTubeVideoIdClient() {
  const [input, setInput] = useState("");
  const [submitted, setSubmitted] = useState("");
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => extractYouTubeVideoId(submitted), [submitted]);

  const examples = [
    "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "https://youtu.be/dQw4w9WgXcQ",
    "https://www.youtube.com/shorts/dQw4w9WgXcQ",
  ];

  const handleSubmit = (value?: string) => {
    const finalInput = (value ?? input).trim();
    setSubmitted(finalInput);
    setCopied(false);
  };

  const handleCopy = async () => {
    if (!result.ok) return;
    try {
      await navigator.clipboard.writeText(result.id);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 md:px-10">
          <div>
            <div className="text-xl font-bold tracking-tight">Find Video ID</div>
            <div className="text-sm text-slate-500">
              YouTube Video ID Finder
            </div>
          </div>

          <div className="hidden gap-3 md:flex">
            <Link
              href="/"
              className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Home
            </Link>
            <Link
              href="/youtube-channel-id"
              className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Channel ID Tool
            </Link>
            <Link
              href="/youtube-thumbnail-downloader"
              className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Thumbnail Tool
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
            Find YouTube Video IDs in seconds
          </h1>

          <p className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-slate-600">
            Paste a YouTube video URL to extract the Video ID instantly.
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
                className="rounded-2xl bg-slate-900 px-5 py-3.5 text-sm font-medium text-white shadow-sm transition hover:opacity-95"
              >
                Find Video ID
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
                  className="rounded-full border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-600 transition hover:border-slate-900 hover:text-slate-900"
                >
                  Example {index + 1}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row sm:flex-wrap">
            <Link
              href="/youtube-channel-id"
              className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-6 py-3 text-base font-semibold text-slate-900 transition hover:bg-slate-50"
            >
              Channel ID Tool
            </Link>

            <Link
              href="/youtube-thumbnail-downloader"
              className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-6 py-3 text-base font-semibold text-slate-900 transition hover:bg-slate-50"
            >
              Thumbnail Tool
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-10 md:px-10">
        <div className="grid gap-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Video ID
            </div>

            {!submitted ? (
              <div className="mt-3 text-sm text-slate-600">
                Paste a YouTube video URL above to extract the Video ID.
              </div>
            ) : result.ok ? (
              <div className="mt-3 space-y-3">
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
                  Video ID found
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <code className="break-all rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800">
                    {result.id}
                  </code>

                  <button
                    onClick={handleCopy}
                    className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                  >
                    {copied ? "Copied" : "Copy Video ID"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                {result.error}
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 pb-10 md:px-10">
        <div className="grid gap-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">
              YouTube Video ID Finder – Extract a Video ID from Any YouTube Link
            </h2>
            <div className="mt-4 grid gap-4 text-sm leading-7 text-slate-600">
              <p>
                This free YouTube video ID finder helps you quickly extract the 11-character video
                ID from any YouTube URL. Paste a standard watch link, Shorts URL, youtu.be share
                link, embed URL, or live link to get the video ID instantly.
              </p>
              <p>
                If you also need other YouTube tools, try the{" "}
                <Link
                  href="/youtube-channel-id"
                  className="font-medium text-slate-900 underline underline-offset-4"
                >
                  YouTube Channel ID Finder
                </Link>{" "}
                or the{" "}
                <Link
                  href="/youtube-thumbnail-downloader"
                  className="font-medium text-slate-900 underline underline-offset-4"
                >
                  YouTube Thumbnail Downloader
                </Link>
                .
              </p>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">
              How to Find a YouTube Video ID
            </h2>
            <div className="mt-4 grid gap-4 text-sm leading-7 text-slate-600">
              <p>1. Paste a YouTube URL into the tool.</p>
              <p>2. Click Find Video ID.</p>
              <p>3. Copy the extracted YouTube video ID.</p>
              <p>
                A YouTube video ID is commonly used for embeds, APIs, thumbnail URLs, analytics,
                and video tracking.
              </p>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">
              YouTube Video ID Finder FAQs
            </h2>

            <div className="mt-6 grid gap-4">
              <div className="rounded-2xl border border-slate-200 p-4">
                <h3 className="text-base font-semibold text-slate-900">
                  What is a YouTube video ID?
                </h3>
                <p className="mt-2 text-sm leading-7 text-slate-600">
                  A YouTube video ID is the unique 11-character code used to identify a specific
                  YouTube video.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 p-4">
                <h3 className="text-base font-semibold text-slate-900">
                  How many characters is a YouTube video ID?
                </h3>
                <p className="mt-2 text-sm leading-7 text-slate-600">
                  A YouTube video ID is normally 11 characters long and can contain letters,
                  numbers, underscores, and hyphens.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 p-4">
                <h3 className="text-base font-semibold text-slate-900">
                  Can I get a video ID from a Shorts link?
                </h3>
                <p className="mt-2 text-sm leading-7 text-slate-600">
                  Yes. This tool supports YouTube Shorts URLs and extracts the video ID from them
                  automatically.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 p-4">
                <h3 className="text-base font-semibold text-slate-900">
                  Can I extract a video ID from a youtu.be link?
                </h3>
                <p className="mt-2 text-sm leading-7 text-slate-600">
                  Yes. You can paste a youtu.be short link and the tool will return the correct
                  YouTube video ID.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 p-4">
                <h3 className="text-base font-semibold text-slate-900">
                  What can I use a YouTube video ID for?
                </h3>
                <p className="mt-2 text-sm leading-7 text-slate-600">
                  You can use a YouTube video ID for embeds, API requests, thumbnail generation,
                  automation workflows, and video tracking.
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