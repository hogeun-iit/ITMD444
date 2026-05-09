import { describe, expect, it } from "vitest";
import { extractYoutubeVideoId } from "../src/lib/youtube.js";

describe("youtube", () => {
  it("extracts watch URL", () => {
    expect(extractYoutubeVideoId("https://www.youtube.com/watch?v=dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
  });
});
