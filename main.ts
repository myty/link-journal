import { walk } from "@std/fs/walk";
import * as path from "@std/path";
import llm from "./browser-llm.ts";
import { processMarkdownFile } from "./process-markdown-file.ts";
import { processMarkdownContent } from "./process-markdown-content.ts";

if (import.meta.main) {
    const [scanningDir] = Deno.args;
    await scanDirectoryForMarkdownFiles(scanningDir);
}

async function scanDirectoryForMarkdownFiles(directory: string) {
    console.log(`Scanning directory: ${directory}`);

    await llm.startSession();

    for await (const entry of walk(directory, { exts: ["md"] })) {
        // Only process files in the root directory
        if (!isFileInRootDirectory(entry.path, directory)) {
            console.log("Skipping:", entry.path);
            continue;
        }

        console.log("Processing:", entry.path);

        const { header, content } = await processMarkdownFile(entry.path);
        const { url, hackerNewsUrl, title } = await processMarkdownContent(
            content,
        );
        const { summary, tags = [] } = url ? await llm.summarizePage(url) : {};

        console.log("Processed:", {
            path: entry.path,
            title: header?.title ?? title,
            url,
            hackerNewsUrl,
            summary,
            tags,
        });
    }

    await llm.closeSession();
}

function isFileInRootDirectory(
    filePath: string,
    rootDirectory: string,
): boolean {
    const entryDirPath = path.dirname(filePath);
    const normalizedDirectory = path.normalize(
        rootDirectory.at(-1) === "/"
            ? rootDirectory.slice(0, -1)
            : rootDirectory,
    );

    return entryDirPath === normalizedDirectory;
}
