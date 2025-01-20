const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({
        executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        headless: false,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        userDataDir: 'C:\\Users\\piero\\dev\\subtitles-to-pdf\\puppeteer\\user-data-dir',
    })
    const page = await browser.newPage()

    await page.goto('https://www.netflix.com/watch/80217006')

    await new Promise(resolve => setTimeout(resolve, 10000))

    const video = await page.evaluate(async () => {
        if (!window.netflix?.appContext?.state?.playerApp) {
            return
        }

        const videoPlayer
            = window.netflix.appContext.state.playerApp.getAPI().videoPlayer

        const playerSessionId = videoPlayer.getAllPlayerSessionIds()[0]
        const player = videoPlayer.getVideoPlayerBySessionId(playerSessionId)

        if (player) {
            player.play()
            await new Promise(resolve => setTimeout(resolve, 5000))
            console.log('player', { player })
            player.pause()
            await new Promise(resolve => setTimeout(resolve, 5000))
            player.play()
            await new Promise(resolve => setTimeout(resolve, 5000))
            player.pause()
        }
    })

    // await browser.close()
})()
