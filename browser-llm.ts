import { type Browser, chromium, type Page } from "playwright";
import ollama from "ollama";
import { persistedCache } from "./persisted-cache.ts";

interface SummaryCacheEntry {
    summary: string;
    tags: string[];
}

const summaryCache = persistedCache<SummaryCacheEntry>(
    "./caches/summary-cache.json",
);

export default (function () {
    let browserSession: Browser | null = null;
    let page: Page | null = null;

    async function startBrowserSession() {
        browserSession = await chromium.launch({
            headless: true,
        });

        const context = await browserSession.newContext();
        page = await context.newPage();
        page.setDefaultTimeout(30000);

        await page.setViewportSize({ width: 800, height: 600 });
    }

    async function getPageSummary(
        url: string,
    ): Promise<string> {
        if (!browserSession || !page) {
            throw new Error("Browser session not initialized");
        }

        if (!page) {
            throw new Error("Page not initialized");
        }

        await page.goto(url);
        await page.waitForLoadState("domcontentloaded");

        const pageText = await page.innerText("body");

        const response = await ollama.chat({
            model: "gemma2",
            messages: [{
                role: "user",
                content:
                    "You are an expert at summarizing webpages. Summarize the following webpage text into a paragraph: \n```" +
                    pageText + "\n```",
            }],
        });

        return response.message.content;
    }

    return {
        async summarizePage(
            url: string | URL,
        ): Promise<SummaryCacheEntry> {
            url = typeof url === "string" ? url : url.toString();

            const cachedValue = summaryCache.get(url);
            const cachedPage = cachedValue
                ? cachedValue
                : { summary: "", tags: [] };

            if (!cachedPage.summary) {
                cachedPage.summary = await getPageSummary(url);
            }

            if (cachedPage.tags.length < 1) {
                const response = await ollama.chat({
                    model: "gemma2",
                    messages: [{
                        role: "user",
                        content:
                            "You are an expert at tagging webpage content. Create tags separated by ',' for the following summary: \n" +
                            cachedPage.summary,
                    }],
                });

                cachedPage.tags = response.message.content.split(", ");
            }

            await summaryCache.set(url, cachedPage);

            return cachedPage;
        },
        async startSession() {
            return await startBrowserSession();
        },
        async closeSession() {
            if (browserSession) {
                await browserSession.close();
                browserSession = null;
                page = null;
            }
        },
    };
})();
