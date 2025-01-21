import { imageFilename } from "./helpers/imageFilename";
import { parseSrt } from "./helpers/parseSrt";
import { existsSync } from "fs";

const screenshot = require("screenshot-desktop");
const puppeteer = require("puppeteer");

function convertTimestampToMilliseconds(timestamp) {
  const [hours, minutes, secondsMilliseconds] = timestamp.split(":");
  const [seconds, milliseconds] = secondsMilliseconds.split(",");

  const hoursInMs = parseInt(hours) * 3600000; // 1 hour = 3600000 milliseconds
  const minutesInMs = parseInt(minutes) * 60000; // 1 minute = 60000 milliseconds
  const secondsInMs = parseInt(seconds) * 1000; // 1 second = 1000 milliseconds
  const millisecondsInMs = parseInt(milliseconds);

  return hoursInMs + minutesInMs + secondsInMs + millisecondsInMs;
}

(async () => {
  const browser = await puppeteer.launch({
    executablePath:
      "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    headless: false,
    args: [
      "--disable-blink-features=AutomationControlled",
      "--disable-gpu",
      "--no-sandbox",
      "--disable-setuid-sandbox",
    ],
    userDataDir:
      "C:\\Users\\piero\\dev\\subtitles-to-pdf\\puppeteer\\user-data-dir",
  });
  const page = await browser.newPage();

  await page.goto("https://www.netflix.com/watch/80217006");

  await new Promise((resolve) => setTimeout(resolve, 5000));

  const filePath = "movies/sonic1/subtitle.srt";
  const startTimeFilter = "00:00:00,000";
  const endTimeFilter = "00:10:00,000";
  const movie = "sonic1";

  const subtitles = await parseSrt(filePath, startTimeFilter, endTimeFilter);

  for (const subtitle of subtitles) {
    const filename =
      `movies/${movie}/images/` + imageFilename(subtitle.startTime) + ".jpg";

    if (existsSync(filename)) {
      console.log("File already exists", filename);
      continue;
    }

    await page.evaluate(
      async (time) => {
        if (!window.netflix?.appContext?.state?.playerApp) {
          return;
        }

        const videoPlayer =
          window.netflix.appContext.state.playerApp.getAPI().videoPlayer;

        const playerSessionId = videoPlayer.getAllPlayerSessionIds()[0];
        const player = videoPlayer.getVideoPlayerBySessionId(playerSessionId);

        if (player) {
          player.play();
          player.pause();
          await new Promise((resolve) => setTimeout(resolve, 500));
          player.seek(time);
          player.pause();
          await new Promise((resolve) => setTimeout(resolve, 500));
        }
      },
      [convertTimestampToMilliseconds(subtitle.startTime)]
    );

    await screenshot({ filename });
  }
  await browser.close();
})();
