import { readFile } from "fs/promises";

type ParsedSrt = {
  startTime: string;
  text: string;
};

export async function parseSrt(
  filePath: string,
  startTimeFilter: string,
  endTimeFilter: string
): Promise<ParsedSrt[]> {
  const data = await readFile(filePath, "utf-8");
  const subtitleBlocks = data.split("\n\n");

  const parsedSrt: ParsedSrt[] = [];
  for (const block of subtitleBlocks) {
    const lines = block.split("\n");
    if (lines.length < 3) {
      continue;
    }

    const timeRange = lines[1];
    const [startTime, endTime] = timeRange.split(" --> ");

    if (startTime < startTimeFilter || endTime > endTimeFilter) {
      continue;
    }

    let subtitleText = lines.slice(2).join(" ");

    subtitleText = subtitleText.replace(/\[.*?\]/g, "");
    subtitleText = subtitleText.replace(/\(.*?\)/g, "");
    subtitleText = subtitleText.replaceAll("*", "");
    subtitleText = subtitleText.replaceAll("-", " ");
    subtitleText = subtitleText.trim();

    if (!subtitleText) {
      continue;
    }

    const ignoreText = ["-", "- -", "*"];
    if (ignoreText.includes(subtitleText)) {
      continue;
    }

    parsedSrt.push({ startTime, text: subtitleText });
  }

  return parsedSrt;
}
