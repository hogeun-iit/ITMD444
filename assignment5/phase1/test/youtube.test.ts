import { describe, expect, it } from "vitest";
import { extractYoutubeVideoId } from "../src/lib/youtube";

describe("extractYoutubeVideoId", () => {
  it("parses youtube.com/watch", () => {
    expect(
      extractYoutubeVideoId("https://www.youtube.com/watch?v=dQw4w9WgXcQ"),
    ).toBe("dQw4w9WgXcQ");
  });

  it("accepts bare 11-char id", () => {
    expect(extractYoutubeVideoId("dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
  });
});
