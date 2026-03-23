import { NextResponse } from "next/server";

function extractChannelIdFromHtml(html: string) {
  const match = html.match(/"channelId":"(UC[0-9A-Za-z_-]{22})"/);
  return match ? match[1] : null;
}

export async function POST(req: Request) {
  try {
    const { input } = await req.json();

    if (!input) {
      return NextResponse.json({ ok: false, error: "No input provided" });
    }

    const url = input.startsWith("http") ? input : `https://${input}`;

    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36",
      },
    });

    const html = await res.text();

    const channelId = extractChannelIdFromHtml(html);

    if (!channelId) {
      return NextResponse.json({
        ok: false,
        error: "Could not find channel ID from this URL",
      });
    }

    return NextResponse.json({
      ok: true,
      channelId,
    });
  } catch (err) {
    return NextResponse.json({
      ok: false,
      error: "Something went wrong",
    });
  }
}