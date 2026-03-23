import { NextResponse } from "next/server";

const ALLOWED_HOSTS = new Set(["img.youtube.com", "i.ytimg.com"]);

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const imageUrl = searchParams.get("url");
    const filenameParam = searchParams.get("filename") || "youtube-thumbnail.jpg";

    if (!imageUrl) {
      return NextResponse.json(
        { ok: false, error: "Missing image URL." },
        { status: 400 }
      );
    }

    let parsedUrl: URL;
    try {
      parsedUrl = new URL(imageUrl);
    } catch {
      return NextResponse.json(
        { ok: false, error: "Invalid image URL." },
        { status: 400 }
      );
    }

    if (!ALLOWED_HOSTS.has(parsedUrl.hostname)) {
      return NextResponse.json(
        { ok: false, error: "Image host not allowed." },
        { status: 400 }
      );
    }

    const upstream = await fetch(parsedUrl.toString(), {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122 Safari/537.36",
      },
      cache: "no-store",
    });

    if (!upstream.ok) {
      return NextResponse.json(
        { ok: false, error: "Could not fetch thumbnail." },
        { status: 502 }
      );
    }

    const contentType = upstream.headers.get("content-type") || "image/jpeg";
    const arrayBuffer = await upstream.arrayBuffer();

    const safeFilename = filenameParam.replace(/[^a-zA-Z0-9._-]/g, "_");

    return new NextResponse(arrayBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${safeFilename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Something went wrong." },
      { status: 500 }
    );
  }
}