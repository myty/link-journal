import { get as getHackerNews } from "./hacker-news-api.ts";

interface ProcessedContent {
    tags: string[];
    summary: string;
    content?: string;
    url: string;
    hackerNewsUrl: string;
    title: string;
}

export async function processMarkdownContent(
    content: string,
): Promise<Partial<ProcessedContent>> {
    const processedContent = { title: extractTitle(content) };
    const [firstUrl] = extractUrls(content);

    if (!firstUrl) {
        return processedContent;
    }

    const { hackerNewsUrl, url, title } =
        (firstUrl.hostname === "news.ycombinator.com")
            ? (await fetchHackerNewsRecord(firstUrl))
            : ({
                url: firstUrl,
            });

    return {
        title: title ? title : processedContent.title,
        url: url?.toString(),
        hackerNewsUrl: hackerNewsUrl?.toString(),
    };
}

function extractUrls(content: string): URL[] {
    const urls = content.match(/(https?:\/\/[^\s]+)/g) ?? [];
    return urls.map((url) => url ? new URL(url) : undefined).filter((url) =>
        url != null
    );
}

async function fetchHackerNewsRecord(
    url: URL,
): Promise<{ title: string; url?: URL; hackerNewsUrl?: URL }> {
    const hackerNewsId = url.searchParams.get("id");
    if (hackerNewsId == null) {
        throw new Error("No hacker news ID found in URL");
    }

    const data = await getHackerNews(hackerNewsId);

    return {
        title: data.title,
        url: data.url ? new URL(data.url) : undefined,
        hackerNewsUrl: url,
    };
}

export function extractTitle(content: string): string {
    const titleMarkdownMatch = content.match(/# (.+)/);
    const titleText = content.match(/(.+?)\s*\|/);
    return titleMarkdownMatch?.[1] ?? titleText?.[1] ?? "";
}
