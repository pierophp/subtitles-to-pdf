import { imageFilename } from "./helpers/imageFilename";
import { parseSrt } from "./helpers/parseSrt";
import sharp from "sharp";
import puppeteer from "puppeteer";
import path from "path";
import { readFile } from "fs/promises";

const movie = "sonic1";
const filePath = `movies/${movie}/subtitle.srt`;
const pdfPath = `movies/${movie}/movie.pdf`;
const startTimeFilter = "00:00:00,000";
const endTimeFilter = "00:10:00,000";

const subtitles = await parseSrt(filePath, startTimeFilter, endTimeFilter);

const width = 1600;
const height = 660;

const top = 540;
const left = 0;
// for (const subtitle of subtitles) {
//   const filename =
//     `movies/${movie}/images/` + imageFilename(subtitle.startTime) + ".jpg";

//   const thumbnail =
//     `movies/${movie}/thumbnails/` + imageFilename(subtitle.startTime) + ".jpg";

//   await sharp(filename)
//     .extract({ width, height, left, top })
//     .resize({ width: 400 })
//     .toFile(thumbnail);
// }
const title = "Sonic 1";
let content = `
 <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>PDF with Image</title>
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
          grid-template-columns: 1fr 1fr; /* 2 equal columns */
          gap: 5px 20px;
          margin: 20px;
        }
          
        .comic-panel {
            background-color: white;
            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
            border-radius: 10px;
            overflow: hidden;
            margin-bottom: 20px;
        }

        .comic-panel img {
            width: 100%;
            height: auto;
            display: block;
        }

        .comic-panel figcaption {
            padding: 10px;
            text-align: center;
            font-weight: bold;
            background-color: #ffeb3b;
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

  content += `<img src="data:image/jpg;base64,${imgBase64}" />`;
  content += `<figcaption>${subtitle.text}</figcaption>`;
  content += `</figure>`;
}

content += `
</div>
</body>
</html>
`;
async function generatePDF() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setContent(content, { waitUntil: "load" });
  await page.pdf({ path: pdfPath, format: "A4" });
  await browser.close();
}

generatePDF();
