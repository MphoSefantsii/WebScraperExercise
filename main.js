const fetch = require("node-fetch")
const { JSDOM } = require("jsdom")
const fs = require("fs")
const path = require("path")
const urlModule = require("url")

// Ensure the output directory exists
const outputDir = path.join(__dirname, "output")
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir)
}

function getURL() {
  const url = process.argv[2]
  if (!url) {
    console.error("Please provide a valid URL as the argument.")
    process.exit(1)
  }
  return url
}

function getFilename(url) {
  const parsedUrl = urlModule.parse(url)
  return `${parsedUrl.hostname}.txt`
}

function writeToFile(filename, data) {
  fs.writeFileSync(filename, data, "utf8")
}

function uniqueAndSorted(arr) {
  return Array.from(new Set(arr)).sort()
}

async function scrapeWebsite(url) {
  try {
    console.log(`Fetching URL from: ${url}`)
    const response = await fetch(url)
    const text = await response.text()
    const dom = new JSDOM(text, { virtualConsole: new (require("jsdom").VirtualConsole)() })

    const document = dom.window.document

    let links = []
    let images = []

    // Extract and add links to content
    document.querySelectorAll("a").forEach((anchor) => {
      const href = anchor.href
      if (href) {
        links.push(href)
      }
    })

    // Extract and add image sources to content
    document.querySelectorAll("img").forEach((img) => {
      const src = img.src
      if (src) {
        images.push(src)
      }
    })

    // Sort and de-duplicate links and images
    links = uniqueAndSorted(links)
    images = uniqueAndSorted(images)

    let fileContent = "\n-Links-\n"
    links.forEach((link) => {
      fileContent += `${link}\n`
    })

    fileContent += "\n-Images-\n"
    images.forEach((image) => {
      fileContent += `${image}\n`
    })

    // Determine output filename and write content to file
    const filename = path.join(outputDir, getFilename(url))
    writeToFile(filename, fileContent)
    console.log(`Content written to ${filename}`)
  } catch (error) {
    console.error("Error fetching the URL:", error.message)
    process.exit(1)
  }
}

async function scrapeGamesDatabase() {
  const url = "https://www.igdb.com/games/coming_soon"
  try {
    console.log(`Fetching games database from: ${url}`)
    const response = await fetch(url)
    const text = await response.text()
    const dom = new JSDOM(text, { virtualConsole: new (require("jsdom").VirtualConsole)() })

    const document = dom.window.document

    let fileContent = "\n-Games Database-\n"

    document.querySelectorAll(".game-card").forEach((card) => {
      const gameName = card.querySelector(".game-title")?.textContent || "N/A"
      const genre = card.querySelector(".game-genre")?.textContent || "N/A"
      const platforms = card.querySelector(".game-platforms")?.textContent || "N/A"
      const releaseDate = card.querySelector(".release-date")?.textContent || "N/A"
      const publisher = card.querySelector(".publisher")?.textContent || "N/A"
      const profileImage = card.querySelector(".game-image")?.src || "N/A"
      const trailerLink = card.querySelector(".game-trailer")?.href || "N/A"

      fileContent += `Name: ${gameName}, Genre: ${genre}, Platforms: ${platforms}, Release Date: ${releaseDate}, Publisher: ${publisher}, Profile Image: ${profileImage}, Trailer: ${trailerLink}\n`
    })

    const filename = path.join(outputDir, "games_database.txt")
    writeToFile(filename, fileContent)
    console.log(`Games database written to ${filename}`)
  } catch (error) {
    console.error("Error fetching the games database:", error.message)
    process.exit(1)
  }
}

async function scrapeEmailList() {
  const url = "https://www.ibba.org/find-a-business-broker"
  try {
    console.log(`Fetching email list from: ${url}`)
    const response = await fetch(url)
    const text = await response.text()
    const dom = new JSDOM(text, { virtualConsole: new (require("jsdom").VirtualConsole)() })

    const document = dom.window.document

    let fileContent = "\n-Email List-\n"

    document.querySelectorAll(".findbroker-list-item").forEach((item) => {
      const firmName = item.querySelector(".findbroker-firm-name")?.textContent || "N/A"
      const contactName = item.querySelector(".findbroker-contact-name")?.textContent || "N/A"
      const email = item.querySelector(".findbroker-email a")?.textContent || "N/A"

      fileContent += `Firm: ${firmName}, Contact: ${contactName}, Email: ${email}\n`
    })

    const filename = path.join(outputDir, "email_list.txt")
    writeToFile(filename, fileContent)
    console.log(`Email list written to ${filename}`)
  } catch (error) {
    console.error("Error fetching the email list:", error.message)
    process.exit(1)
  }
}

const url = getURL()
scrapeWebsite(url)
scrapeGamesDatabase()
scrapeEmailList()
