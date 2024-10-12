import { persistedCache } from "./persisted-cache.ts";

interface HackerNewsEnity {
    by: string;
    descendants: number;
    id: number;
    kids: number[];
    score: number;
    time: number;
    title: string;
    type: string;
    url: string;
}

const cache = persistedCache("./caches/hacker-news-cache.json");

export const get = async function (id: string): Promise<HackerNewsEnity> {
    const url = `https://hacker-news.firebaseio.com/v0/item/${id}.json`;
    if (cache.get(url)) {
        return JSON.parse(cache.get(url));
    }

    const response = await fetch(url);
    const content: HackerNewsEnity = await response.json();

    await cache.set(url, JSON.stringify(content));

    return content;
};
