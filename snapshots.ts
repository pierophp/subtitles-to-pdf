import { config } from "./config";
import { imageFilename } from "./helpers/imageFilename";
import { parseSrt } from "./helpers/parseSrt";
import { existsSync } from "fs";
import screenshot from "screenshot-desktop";
import puppeteer from "puppeteer";
import { convertTimestampToMilliseconds } from "./helpers/convertTimestamp";
import { getStreamingPlatform } from "./helpers/getStreamingPlatform";

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

  const streamingPlatform = getStreamingPlatform(config.url);

  await page.evaluate(
    async (request: any) => {
      const [platform] = request;
      console.log("platform2", platform);
      if (platform == "netflix") {
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
      } else if (platform == "prime-video") {
        document.querySelector(".fbl-play-btn").click();
        await new Promise((resolve) => setTimeout(resolve, 1000));
        Array.from(document.querySelectorAll(".f1oe4mb3")).map((e) =>
          e.remove()
        );
        document.querySelectorAll("video")[1].play();
        document.querySelectorAll("video")[1].pause();
      }
    },
    [streamingPlatform]
  );

  const movie = config.folder;
  const filePath = `movies/${movie}/${movie}.srt`;
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
      async (request) => {
        const [platform, time] = request;

        if (platform === "netflix") {
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
        } else if (platform === "prime-video") {
          document.querySelectorAll("video")[1].currentTime = time / 1000;
          try {
            await document.querySelectorAll("video")[1].play();
          } catch (e) {}

          await new Promise((resolve) => setTimeout(resolve, 500));
          try {
            await document.querySelectorAll("video")[1].pause();
          } catch (e) {}
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
      },
      [streamingPlatform, convertTimestampToMilliseconds(subtitle.startTime)]
    );

    await screenshot({ filename });
  }
  await browser.close();
})();
