import { readFile } from "fs/promises";
import puppeteer from "puppeteer";
import { config } from "./config";
import { convertTimestampToSeconds } from "./helpers/convertTimestamp";
import { imageFilename } from "./helpers/imageFilename";
import { parseSrt } from "./helpers/parseSrt";

const movie = config.folder;
const filePath = `movies/${movie}/${movie}.srt`;
const pdfPath = `movies/${movie}/${movie}.pdf`;
const startTimeFilter = config.startTimeFilter;
const endTimeFilter = config.endTimeFilter;

const subtitles = await parseSrt(filePath, startTimeFilter, endTimeFilter);

const title = config.title;

const coverImgBase64 = (await readFile(`movies/${movie}/cover.jpg`)).toString(
  "base64"
);

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
        
        .cover {
            position: relative;
            width: 100%;
            height: 100vh;
            overflow: hidden;
        }
        .cover img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
        .cover h1 {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            color: white;
            font-size: 3em;
            text-align: center;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
        }
            
        .blank-page {
            height: 100vh;
            background-color: white;
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

        .content {
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
      <div class="cover"><img src="data:image/jpg;base64,${coverImgBase64}" /></div>
      <div class="blank-page" aria-hidden="true"></div>
      <div class="content">
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
async function generatePDF() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setContent(content, { waitUntil: "load" });
  await page.pdf({
    path: pdfPath,
    format: "A4",
    displayHeaderFooter: true,
    headerTemplate: "<div/>",
    footerTemplate:
      '<div style="text-align: right;width: 297mm;font-size: 8px;"><span style="margin-right: 1cm"><span class="pageNumber"></span></span></div>',
  });
  await browser.close();
}

generatePDF();
