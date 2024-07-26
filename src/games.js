const puppeteer = require("puppeteer")
const fs = require("fs")
const path = require("path")

const url = "https://www.igdb.com/games/coming_soon"
const outputDir = path.join(__dirname, "..", "output", "gamesdb-coming-soon")
const outputFile = path.join(outputDir, "upcoming_games.txt")

const excludedLinks = ["/games/coming_soon", "/games/recently_released"]

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true })
}

const useBrave = false
const browserExecutablePath = useBrave
  ? "C:/Program Files/BraveSoftware/Brave-Browser/Application/brave.exe"
  : undefined

async function scrapeGameDetails(page) {
  return await page.evaluate(async () => {
    // Helper function to extract text using CSS selector
    const getElementText = (selector) => {
      const element = document.querySelector(selector)
      console.log(`Checking selector: ${selector}`)
      console.log("Element:", element)
      return element ? element.textContent.trim() : "N/A"
    }

    // Wait for specific elements to ensure they are loaded
    const waitForElement = (selector, timeout = 5000) => {
      return new Promise((resolve, reject) => {
        const start = Date.now()
        const checkElement = () => {
          if (document.querySelector(selector)) {
            resolve()
          } else if (Date.now() - start > timeout) {
            reject(new Error(`Element not found: ${selector}`))
          } else {
            setTimeout(checkElement, 100) // Check every 100ms
          }
        }
        checkElement()
      })
    }
    await new Promise((resolve) => setTimeout(resolve, 5000)) // Wait for 5 seconds before extracting details

    const nameSelector = "h1.sc-dxjrPO.cXyUDD.MuiTypography-root.MuiTypography-h3"
    const name = await (async () => {
      await waitForElement(nameSelector)
      return getElementText(nameSelector)
    })()

    const genresSelector = "p.sc-dxjrPO.cbyKNd.MuiTypography-root.MuiTypography-body1"
    const genres = await (async () => {
      await waitForElement(genresSelector)
      return getElementText(genresSelector)
    })()

    const platformsSelector = "div.sc-eIPYkq.dABZrK.MuiGrid2-root.MuiGrid2-direction-xs-row.MuiGrid2-grid-xs-6 p"
    const platformsText = await (async () => {
      await waitForElement(platformsSelector)
      return Array.from(document.querySelectorAll(platformsSelector))
        .map((el) => el.textContent.trim())
        .filter((text) => !text.match(/^\d{4}-\d{1,2}-\d{1,2}$/)) // Exclude date formats
        .join(", ")
    })()
    const platforms = platformsText.replace("Releases, ", "") // Remove 'Releases' if present

    const releaseDateSelector =
      "div.sc-eIPYkq.WKfQO.MuiGrid2-root.MuiGrid2-direction-xs-row.MuiGrid2-grid-sm-4.MuiGrid2-grid-md-3.sc-hBgdUx.jLxKaX span.sc-dxjrPO.kMTTuA.MuiTypography-root.MuiTypography-h6"
    const releaseDate = await (async () => {
      await waitForElement(releaseDateSelector)
      return getElementText(releaseDateSelector)
    })()

    const publisherSelector =
      "div.sc-eIPYkq.ioJrei.MuiGrid2-root.MuiGrid2-direction-xs-row.sc-hBgdUx.jLxKaX.sc-jchFli.hbRUXw p"
    const publisher = await (async () => {
      await waitForElement(publisherSelector)
      return getElementText(publisherSelector)
    })()

    // Extract image URL
    const imageSelector = "div.mui-image-wrapper img"
    const imageElement = document.querySelector(imageSelector)
    const image = imageElement ? imageElement.src : "N/A"

    return {
      name,
      genres,
      platforms,
      releaseDate,
      publisher,
      image
    }
  })
}

async function scrapeGames() {
  try {
    console.log(`Fetching URL from: ${url}`)

    const browser = await puppeteer.launch({
      executablePath: browserExecutablePath,
      headless: false,
      args: useBrave ? ["--no-sandbox", "--disable-setuid-sandbox"] : []
    })

    const page = await browser.newPage()
    await page.goto(url, { waitUntil: "networkidle2" })

    // Get the list of game links (limit slice to (0, x) for testing purposes)
    const gameLinks = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('a[href^="/games/"]'))
        .map((link) => link.getAttribute("href"))
        .filter((href) => href.startsWith("/games/"))
      return links
    })

    // Filter out excluded links
    const filteredGameLinks = gameLinks.filter((link) => !excludedLinks.includes(link)).slice(0, 1)

    if (filteredGameLinks.length === 0) {
      console.log("No valid game links found on the page.")
      await browser.close()
      return
    }

    console.log(`Found ${filteredGameLinks.length} games. Scraping details...`)

    const gameDetails = []

    for (const gameLink of filteredGameLinks) {
      console.log(`Fetching game details from: ${gameLink}`)
      await page.goto(`https://www.igdb.com${gameLink}`, { waitUntil: "networkidle2" })

      const details = await scrapeGameDetails(page)
      gameDetails.push(details)
    }

    fs.writeFileSync(outputFile, JSON.stringify(gameDetails, null, 2))
    console.log(`Data saved to ${outputFile}`)

    await browser.close()
  } catch (error) {
    console.error(`An error occurred: ${error.message}`)
  }
}

scrapeGames()
