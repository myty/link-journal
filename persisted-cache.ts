import { dirname } from "@std/path";

export const persistedCache = function <T = string>(cacheFilePath: string) {
    // create directory if it doesn't exist
    const cacheDir = dirname(cacheFilePath);
    try {
        Deno.lstatSync(cacheDir);
    } catch (err) {
        if (err instanceof Deno.errors.NotFound) {
            Deno.mkdirSync(cacheDir, { recursive: true });
        }
    }

    try {
        Deno.lstatSync(cacheFilePath);
    } catch (err) {
        if (err instanceof Deno.errors.NotFound) {
            Deno.writeTextFileSync(cacheFilePath, "{}");
        }
    }

    const serializedCache = Deno.readTextFileSync(cacheFilePath);
    const cache: Record<string, T> = JSON.parse(serializedCache);

    return {
        /**
         * Get the value of a key in the cache
         */
        get(key: string): T {
            return cache[key];
        },

        /**
         * Set the value of a key in the cache
         */
        async set(key: string, value: T) {
            cache[key] = value;
            await Deno.writeTextFile(cacheFilePath, JSON.stringify(cache));
        },
    };
};
