import { EPub, EpubOptions } from "@lesjoursfr/html-to-epub";
import { readFile } from "fs/promises";
import { config } from "./config";
import { imageFilename } from "./helpers/imageFilename";
import { parseSrt } from "./helpers/parseSrt";

import { convertTimestampToSeconds } from "./helpers/convertTimestamp";

const movie = config.folder;
const filePath = `movies/${movie}/subtitle.srt`;
const epubPath = `movies/${movie}/movie.epub`;
const startTimeFilter = config.startTimeFilter;
const endTimeFilter = config.endTimeFilter;

const subtitles = await parseSrt(filePath, startTimeFilter, endTimeFilter);

const title = config.title;

let content = `
 <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
      <style>
        body {
          font-family: 'Comic Sans MS', cursive, sans-serif;
          text-align: center;
          margin: 0;
          padding: 0;
        }

         h1 {
            text-align: center;
            color: #333;
            font-size: 2.5em;
            margin-bottom: 30px;
        }

        img {
          max-width: 100%;
          height: auto;
        }
        .container {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 5px 20px;
          margin: 20px;
        }

        .comic-panel {
            background-color: white;
            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
            border-radius: 10px;
            overflow: hidden;
            background-color:rgb(113, 169, 221);
            -webkit-print-color-adjust: exact;
        }

        .comic-panel img {
            width: 100%;
            height: auto;
            display: block;
        }

        .comic-panel figcaption {
            padding: 5px;
            text-align: center;
            font-weight: bold;            
        }
      </style>
    </head>
    <body>
      <h1>${title}</h1>          
      <div class="container">
`;

for (const subtitle of subtitles) {
  content += `<figure class="comic-panel">`;

  const imgBase64 = (
    await readFile(
      `movies/${movie}/thumbnails/` + imageFilename(subtitle.startTime) + ".jpg"
    )
  ).toString("base64");
  content += `<a href="${config.url}?t=${convertTimestampToSeconds(
    subtitle.startTime
  )}" target="_blank">`;
  content += `<img src="data:image/jpg;base64,${imgBase64}" />`;
  content += "</a>";
  content += `<figcaption>${subtitle.text}</figcaption>`;
  content += `</figure>`;
}

content += `
</div>
</body>
</html>
`;

const options: EpubOptions = {
  title: config.title,
  description: config.title,
  content: [
    {
      title: config.title,
      data: content,
    },
  ],
};

const epub = new EPub(options, epubPath);
await epub.render();
