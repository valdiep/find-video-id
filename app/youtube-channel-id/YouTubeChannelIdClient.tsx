"use client";

import Link from "next/link";
import { useState } from "react";

type ChannelLookupResult =
  | { ok: true; channelId: string }
  | { ok: false; error: string }
  | null;

export default function YouTubeChannelIdClient() {
  const [input, setInput] = useState("");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState("");
  const [result, setResult] = useState<ChannelLookupResult>(null);

  const examples = [
    "https://www.youtube.com/@MrBeast",
    "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "https://www.youtube.com/channel/UCX6OQ3DkcsbYNE6H8uQQuVA",
  ];

  const handleSubmit = async (value?: string) => {
    const finalInput = (value ?? input).trim();

    setInput(finalInput);
    setSubmitted(finalInput);
    setCopied(false);
    setResult(null);

    if (!finalInput) return;

    setLoading(true);

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
        setResult({ ok: true, channelId: data.channelId });
      } else {
        setResult({
          ok: false,
          error: data.error || "Could not find channel ID.",
        });
      }
    } catch {
      setResult({
        ok: false,
        error: "Channel ID lookup failed.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!result || !result.ok) return;
    try {
      await navigator.clipboard.writeText(result.channelId);
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
              YouTube Channel ID Finder
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
            Find YouTube Channel IDs in seconds
          </h1>

          <p className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-slate-600">
            Paste a YouTube channel URL, @handle, or video URL to extract the
            Channel ID instantly.
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
                {loading ? "Finding Channel ID..." : "Find Channel ID"}
              </button>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {examples.map((example, index) => (
                <button
                  key={example}
                  onClick={() => {
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
        <div className="grid gap-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Channel ID
            </div>

            {!submitted ? (
              <div className="mt-3 text-sm text-slate-600">
                Paste a YouTube channel URL, @handle, or video URL above to
                extract the Channel ID.
              </div>
            ) : loading ? (
              <div className="mt-3 text-sm text-slate-600">
                Looking up channel ID...
              </div>
            ) : result?.ok ? (
              <div className="mt-3 space-y-3">
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
                  Channel ID found
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <code className="break-all rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800">
                    {result.channelId}
                  </code>

                  <button
                    onClick={handleCopy}
                    className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                  >
                    {copied ? "Copied" : "Copy Channel ID"}
                  </button>
                </div>
              </div>
            ) : result && !result.ok ? (
              <div className="mt-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                {result.error}
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 pb-10 md:px-10">
        <div className="grid gap-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">
              YouTube Channel ID Finder – Get a Channel ID from Any YouTube URL
            </h2>
            <div className="mt-4 grid gap-4 text-sm leading-7 text-slate-600">
              <p>
                This free YouTube Channel ID finder helps you quickly extract a
                channel ID from a YouTube channel URL, @handle, or video URL.
                Paste any supported YouTube link above to get the correct
                channel ID instantly.
              </p>
              <p>
                If you also need other YouTube tools, try the{" "}
                <Link
                  href="/youtube-video-id"
                  className="font-medium text-slate-900 underline underline-offset-4"
                >
                  YouTube Video ID Tool
                </Link>{" "}
                or the{" "}
                <Link
                  href="/youtube-thumbnail-downloader"
                  className="font-medium text-slate-900 underline underline-offset-4"
                >
                  YouTube Thumbnail Tool
                </Link>
                .
              </p>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">
              How to Find a YouTube Channel ID
            </h2>
            <div className="mt-4 grid gap-4 text-sm leading-7 text-slate-600">
              <p>1. Paste a YouTube channel URL, @handle, or video URL.</p>
              <p>2. Click Find Channel ID.</p>
              <p>3. Copy the extracted YouTube channel ID.</p>
              <p>
                A YouTube channel ID is commonly used for APIs, analytics
                tools, integrations, and channel tracking.
              </p>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">
              YouTube Channel ID Finder FAQs
            </h2>

            <div className="mt-6 grid gap-4">
              <div className="rounded-2xl border border-slate-200 p-4">
                <h3 className="text-base font-semibold text-slate-900">
                  What is a YouTube channel ID?
                </h3>
                <p className="mt-2 text-sm leading-7 text-slate-600">
                  A YouTube channel ID is a unique identifier assigned to every
                  YouTube channel. Unlike a channel name or @handle, it does not
                  change.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 p-4">
                <h3 className="text-base font-semibold text-slate-900">
                  Can I find a channel ID from a video URL?
                </h3>
                <p className="mt-2 text-sm leading-7 text-slate-600">
                  Yes. Paste a YouTube video link into the tool and it will
                  extract the channel ID associated with that video.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 p-4">
                <h3 className="text-base font-semibold text-slate-900">
                  Does this work with YouTube @handles?
                </h3>
                <p className="mt-2 text-sm leading-7 text-slate-600">
                  Yes. You can paste a YouTube @handle and the tool will return
                  the correct channel ID.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 p-4">
                <h3 className="text-base font-semibold text-slate-900">
                  What does a YouTube channel ID look like?
                </h3>
                <p className="mt-2 text-sm leading-7 text-slate-600">
                  A YouTube channel ID usually starts with “UC” followed by a
                  string of letters and numbers.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 p-4">
                <h3 className="text-base font-semibold text-slate-900">
                  What is a YouTube channel ID used for?
                </h3>
                <p className="mt-2 text-sm leading-7 text-slate-600">
                  YouTube channel IDs are used for API requests, analytics
                  platforms, integrations, automation workflows, and channel
                  tracking.
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