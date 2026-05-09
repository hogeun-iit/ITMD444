/** YouTube URL → ID 및 YouTube Data API v3 메타데이터 */

export function extractYoutubeVideoId(input: string): string | null {
  const raw = input.trim();
  if (!raw) return null;
  try {
    const url = raw.startsWith("http") ? new URL(raw) : new URL(`https://${raw}`);
    if (url.hostname === "youtu.be") {
      const id = url.pathname.replace(/^\//, "").split("/")[0];
      return id && /^[\w-]{11}$/.test(id) ? id : null;
    }
    if (url.hostname.includes("youtube.com")) {
      const v = url.searchParams.get("v");
      if (v && /^[\w-]{11}$/.test(v)) return v;
      const parts = url.pathname.split("/").filter(Boolean);
      const embed = parts.indexOf("embed");
      if (embed >= 0 && parts[embed + 1] && /^[\w-]{11}$/.test(parts[embed + 1])) return parts[embed + 1];
      const shortIdx = parts.indexOf("shorts");
      if (shortIdx >= 0 && parts[shortIdx + 1] && /^[\w-]{11}$/.test(parts[shortIdx + 1])) return parts[shortIdx + 1];
    }
  } catch {
    /* ignore */
  }
  if (/^[\w-]{11}$/.test(raw)) return raw;
  return null;
}

export type YoutubeSnippet = {
  title: string;
  description: string;
  channelTitle: string;
  thumbnailUrl: string | null;
  durationSec: number | null;
  publishedAt: Date | null;
};

export function mockYoutubeMetadata(videoId: string): YoutubeSnippet {
  return {
    title: `YouTube video (${videoId})`,
    description: "",
    channelTitle: "Unknown channel",
    thumbnailUrl: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
    durationSec: null,
    publishedAt: null,
  };
}

function parseIso8601Duration(iso: string): number | null {
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!m) return null;
  const h = parseInt(m[1] ?? "0", 10);
  const min = parseInt(m[2] ?? "0", 10);
  const s = parseInt(m[3] ?? "0", 10);
  return h * 3600 + min * 60 + s;
}

export async function resolveYoutubeMetadata(videoId: string): Promise<YoutubeSnippet> {
  const key = process.env.YOUTUBE_API_KEY;
  if (!key) return mockYoutubeMetadata(videoId);

  const url =
    `https://www.googleapis.com/youtube/v3/videos` +
    `?part=snippet,contentDetails&id=${encodeURIComponent(videoId)}&key=${encodeURIComponent(key)}`;

  const res = await fetch(url);
  if (!res.ok) return mockYoutubeMetadata(videoId);

  const data = (await res.json()) as {
    items?: Array<{
      snippet?: {
        title?: string;
        description?: string;
        channelTitle?: string;
        publishedAt?: string;
        thumbnails?: { high?: { url?: string }; medium?: { url?: string } };
      };
      contentDetails?: { duration?: string };
    }>;
  };

  const item = data.items?.[0];
  if (!item?.snippet) return mockYoutubeMetadata(videoId);

  const sn = item.snippet;
  const thumb = sn.thumbnails?.high?.url ?? sn.thumbnails?.medium?.url ?? null;
  const durationSec = item.contentDetails?.duration ? parseIso8601Duration(item.contentDetails.duration) : null;

  return {
    title: sn.title ?? mockYoutubeMetadata(videoId).title,
    description: sn.description ?? "",
    channelTitle: sn.channelTitle ?? "Unknown channel",
    thumbnailUrl: thumb,
    durationSec,
    publishedAt: sn.publishedAt ? new Date(sn.publishedAt) : null,
  };
}
