export interface Markdown {
    header: Record<string, string>;
    content: string;
}

export async function processMarkdownFile(filePath: string): Promise<Markdown> {
    const file = await Deno.readTextFile(filePath);
    const lines = file.split("\n");

    const header: Record<string, string> = {};
    const contentLines: string[] = [];

    let i = 0;
    let inHeader = false;
    const identifier = "---";

    for (; i < lines.length; i++) {
        const line = lines[i];

        if (line.trim() === identifier) {
            inHeader = !inHeader;
            continue;
        }

        if (inHeader) {
            const [key, value] = line.split(":");
            header[key.trim()] = value?.trim() ?? "";
            continue;
        }

        contentLines.push(line);
    }

    const content = contentLines.join("\n");

    return { header, content };
}
