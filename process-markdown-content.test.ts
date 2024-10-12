import { describe, it } from "@std/testing/bdd";
import { expect } from "@std/expect";
import { extractTitle } from "./process-markdown-content.ts";

describe("Playwright test", () => {
    describe("extractTitle", () => {
        it("should extract the title from the markdown file", () => {
            const title = extractTitle("# Title");
            expect(title).toBe("Title");
        });

        it("should extract the title from titles separated by pipe (|)", () => {
            const title = extractTitle(
                "Show HN: An open-source, local-first Webflow for your own app | https://news.ycombinator.com/item?id=41390449",
            );
            expect(title).toBe(
                "Show HN: An open-source, local-first Webflow for your own app",
            );
        });

        it("should extract the title from titles with preceding blank lines", () => {
            const title = extractTitle(
                "\n\nShow HN: An open-source, local-first Webflow for your own app | https://news.ycombinator.com/item?id=41390449",
            );
            expect(title).toBe(
                "Show HN: An open-source, local-first Webflow for your own app",
            );
        });
    });
});
