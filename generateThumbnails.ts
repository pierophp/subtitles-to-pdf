import sharp from "sharp";
import { config } from "./config";
import { imageFilename } from "./helpers/imageFilename";
import { parseSrt } from "./helpers/parseSrt";

const movie = config.folder;
const filePath = `movies/${movie}/subtitle.srt`;
const startTimeFilter = config.startTimeFilter;
const endTimeFilter = config.endTimeFilter;

const subtitles = await parseSrt(filePath, startTimeFilter, endTimeFilter);

const width = 1600;
const height = 660;

const top = 540;
const left = 0;
for (const subtitle of subtitles) {
  const filename =
    `movies/${movie}/images/` + imageFilename(subtitle.startTime) + ".jpg";

  const thumbnail =
    `movies/${movie}/thumbnails/` + imageFilename(subtitle.startTime) + ".jpg";

  await sharp(filename)
    .extract({ width, height, left, top })
    .resize({ width: 400 })
    .toFile(thumbnail);
}
