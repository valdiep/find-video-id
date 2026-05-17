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

type ChannelLookupResult =
  | { ok: true; channelId: string }
  | { ok: false; error: string }
  | null;

export default function HomePage() {
  const [input, setInput] = useState("");
  const [submitted, setSubmitted] = useState("");
  const [copiedVideo, setCopiedVideo] = useState(false);
  const [copiedChannel, setCopiedChannel] = useState(false);
  const [channelLoading, setChannelLoading] = useState(false);
  const [channelResult, setChannelResult] = useState<ChannelLookupResult>(null);

  const videoResult = useMemo(() => extractYouTubeVideoId(submitted), [submitted]);
  const thumbnails = videoResult.ok ? getThumbnailOptions(videoResult.id) : [];

  const examples = [
    "https://www.youtube.com/@MrBeast",
    "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "https://youtu.be/dQw4w9WgXcQ",
  ];

  const handleSubmit = async (value?: string) => {
    const finalInput = (value ?? input).trim();

    setSubmitted(finalInput);
    setCopiedVideo(false);
    setCopiedChannel(false);
    setChannelResult(null);

    if (!finalInput) return;

    setChannelLoading(true);

    try {
      const res = await fetch("/api/channel-id", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ input: finalInput }),
      });

      const data = await res.json();

      if (data.ok && data.channelId) {
        setChannelResult({ ok: true, channelId: data.channelId });
      } else {
        setChannelResult({
          ok: false,
          error: data.error || "Could not find channel ID.",
        });
      }
    } catch {
      setChannelResult({
        ok: false,
        error: "Channel ID lookup failed.",
      });
    } finally {
      setChannelLoading(false);
    }
  };

  const handleCopyVideo = async () => {
    if (!videoResult.ok) return;
    try {
      await navigator.clipboard.writeText(videoResult.id);
      setCopiedVideo(true);
      window.setTimeout(() => setCopiedVideo(false), 1500);
    } catch {}
  };

  const handleCopyChannel = async () => {
    if (!channelResult || !channelResult.ok) return;
    try {
      await navigator.clipboard.writeText(channelResult.channelId);
      setCopiedChannel(true);
      window.setTimeout(() => setCopiedChannel(false), 1500);
    } catch {}
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 md:px-10">
          <div>
            <div className="text-xl font-bold tracking-tight">Find Video ID</div>
            <div className="text-sm text-slate-500">
              YouTube Channel ID Finder, Video ID Finder & Thumbnail Downloader
            </div>
          </div>

          <div className="hidden gap-3 md:flex">
            <Link
              href="/youtube-channel-id"
              className="rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700"
            >
              Channel ID Tool
            </Link>
            <Link
              href="/youtube-video-id"
              className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Video ID Tool
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
            Find YouTube Channel IDs, Video IDs, and thumbnails in seconds
          </h1>

          <p className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-slate-600">
            Paste a YouTube channel link, @handle, or video URL to find the Channel ID.
            You can also extract the Video ID and get thumbnail links from the same input.
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
                    void handleSubmit();
                  }
                }}
                placeholder="https://www.youtube.com/@MrBeast"
                className="w-full rounded-2xl border border-slate-300 px-4 py-3.5 text-sm outline-none transition focus:border-slate-900"
              />

              <button
                onClick={() => void handleSubmit()}
                className="rounded-2xl bg-slate-900 px-5 py-3.5 text-sm font-medium text-white shadow-sm transition hover:opacity-95"
              >
                {channelLoading ? "Finding IDs..." : "Find IDs"}
              </button>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {examples.map((example, index) => (
                <button
                  key={example}
                  onClick={() => {
                    setInput(example);
                    void handleSubmit(example);
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
              className="inline-flex items-center justify-center rounded-2xl bg-red-600 px-6 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-red-700"
            >
              Channel ID Tool
            </Link>

            <Link
              href="/youtube-video-id"
              className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-6 py-3 text-base font-semibold text-slate-900 transition hover:bg-slate-50"
            >
              Video ID Tool
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
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <div className="max-w-3xl">
            <h2 className="text-2xl font-bold tracking-tight md:text-3xl">YouTube Tools</h2>
            <p className="mt-2 text-sm leading-7 text-slate-600">
              Use these free YouTube tools to find video IDs, channel IDs, and download
              thumbnails from YouTube links.
            </p>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <Link
                href="/youtube-video-id"
                className="text-base font-semibold text-slate-900 underline decoration-slate-300 underline-offset-4 transition hover:text-red-600 hover:decoration-red-300"
              >
                YouTube Video ID Finder
              </Link>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Extract the video ID from any YouTube video, Shorts, live, embed, or youtu.be URL.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <Link
                href="/youtube-channel-id"
                className="text-base font-semibold text-slate-900 underline decoration-slate-300 underline-offset-4 transition hover:text-red-600 hover:decoration-red-300"
              >
                YouTube Channel ID Finder
              </Link>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Find the unique YouTube channel ID from a channel link, @handle, or video URL.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <Link
                href="/youtube-thumbnail-downloader"
                className="text-base font-semibold text-slate-900 underline decoration-slate-300 underline-offset-4 transition hover:text-red-600 hover:decoration-red-300"
              >
                YouTube Thumbnail Downloader
              </Link>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Download YouTube video thumbnails in max resolution, HD, medium, and standard sizes.
              </p>
            </div>

            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-5">
              <div className="text-base font-semibold text-slate-500">
                YouTube Playlist ID Finder
              </div>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Coming soon: get the playlist ID from any YouTube playlist URL.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 pb-10 md:px-10">
        <div className="grid gap-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Channel ID
            </div>

            {!submitted ? (
              <div className="mt-3 text-sm text-slate-600">
                Paste a YouTube channel URL, @handle, or video URL above.
              </div>
            ) : channelLoading ? (
              <div className="mt-3 text-sm text-slate-600">Looking up channel ID...</div>
            ) : channelResult?.ok ? (
              <div className="mt-3 space-y-3">
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
                  Channel ID found
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <code className="break-all rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800">
                    {channelResult.channelId}
                  </code>

                  <button
                    onClick={handleCopyChannel}
                    className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                  >
                    {copiedChannel ? "Copied" : "Copy Channel ID"}
                  </button>
                </div>
              </div>
            ) : channelResult && !channelResult.ok ? (
              <div className="mt-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                {channelResult.error}
              </div>
            ) : null}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Video ID
            </div>

            {!submitted ? (
              <div className="mt-3 text-sm text-slate-600">
                If your input contains a video, the Video ID will appear here too.
              </div>
            ) : videoResult.ok ? (
              <div className="mt-3 space-y-3">
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
                  Video ID found
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <code className="break-all rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800">
                    {videoResult.id}
                  </code>

                  <button
                    onClick={handleCopyVideo}
                    className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                  >
                    {copiedVideo ? "Copied" : "Copy Video ID"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-3 text-sm text-slate-600">
                No video ID found from this input.
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 pb-10 md:px-10">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
                Thumbnail downloader
              </h2>
              <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-600">
                When your input contains a video, thumbnail downloads will appear below.
              </p>
            </div>

            <Link
              href="/youtube-thumbnail-downloader"
              className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Open dedicated thumbnail page
            </Link>
          </div>

          {!videoResult.ok ? (
            <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm text-slate-600">
              No thumbnail preview is available until the input includes a valid video.
            </div>
          ) : (
            <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
                <img
                  src={thumbnails[0].url}
                  alt={`Thumbnail preview for ${videoResult.id}`}
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="grid gap-3">
                {thumbnails.map((thumb) => {
                  const filename = `${videoResult.id}-${slugifyLabel(thumb.label)}.jpg`;

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
                        className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:opacity-95"
                      >
                        Download thumbnail
                      </a>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
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
