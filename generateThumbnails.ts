import sharp from "sharp";
import { config } from "./config";
import { imageFilename } from "./helpers/imageFilename";
import { parseSrt } from "./helpers/parseSrt";
import { getStreamingPlatform } from "./helpers/getStreamingPlatform";

const movie = config.folder;
const filePath = `movies/${movie}/${movie}.srt`;
const startTimeFilter = config.startTimeFilter;
const endTimeFilter = config.endTimeFilter;

const subtitles = await parseSrt(filePath, startTimeFilter, endTimeFilter);

const streamingPlatform = getStreamingPlatform(config.url);

let width = 1600;
let height = 660;
let top = 540;
let left = 0;

if (streamingPlatform === "prime-video") {
  width = 1600;
  height = 664;
  top = 545;
  left = 0;
}

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
