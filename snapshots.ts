import { config } from "./config";
import { imageFilename } from "./helpers/imageFilename";
import { parseSrt } from "./helpers/parseSrt";
import { existsSync } from "fs";
import screenshot from "screenshot-desktop";
import puppeteer from "puppeteer";
import { convertTimestampToMilliseconds } from "./helpers/convertTimestamp";

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

  await page.goto(config.url);

  await new Promise((resolve) => setTimeout(resolve, 5000));

  await page.evaluate(async () => {
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
    }
  });

  const movie = config.folder;
  const filePath = `movies/${movie}/subtitle.srt`;
  const startTimeFilter = config.startTimeFilter;
  const endTimeFilter = config.endTimeFilter;

  const subtitles = await parseSrt(filePath, startTimeFilter, endTimeFilter);

  for (const subtitle of subtitles) {
    const filename =
      `movies/${movie}/images/` + imageFilename(subtitle.startTime) + ".jpg";

    if (existsSync(filename)) {
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
          player.seek(time);
          await new Promise((resolve) => setTimeout(resolve, 200));
        }
      },
      [convertTimestampToMilliseconds(subtitle.startTime)]
    );

    await screenshot({ filename });
  }
  await browser.close();
})();
