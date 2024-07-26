const fetch = require("node-fetch")
const { JSDOM } = require("jsdom")
const fs = require("fs")
const path = require("path")
const urlModule = require("url")

const outputDir = path.join(__dirname, "..", "output")
const linksDir = path.join(outputDir, "links")
const imagesDir = path.join(outputDir, "images")

if (!fs.existsSync(linksDir)) {
  fs.mkdirSync(linksDir, { recursive: true })
}

if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true })
}

function getURL() {
  const url = process.argv[2]
  if (!url) {
    console.error("Provide a valid URL as the argument")
    process.exit(1)
  }
  return url
}

function getFilename(url, type) {
  const parsedUrl = urlModule.parse(url)
  return parsedUrl.hostname + `-${type}.txt`
}

function writeToFile(filename, data) {
  fs.writeFileSync(filename, data, "utf8")
}

function makeAbsolute(base, relative) {
  return new URL(relative, base).href
}

function deduplicateAndSort(arr) {
  return Array.from(new Set(arr)).sort()
}

async function scrapeWebsite(url) {
  try {
    console.log(`Fetching URL from: ${url}`)
    const response = await fetch(url)

    if (response.status !== 200) {
      console.error(`Error: HTTP ${response.status}`)
      process.exit(1)
    }

    const text = await response.text()
    const dom = new JSDOM(text)
    const document = dom.window.document

    const baseUrl = new URL(url).origin

    let links = []
    let images = []

    document.querySelectorAll("a").forEach((anchor) => {
      const href = anchor.href
      if (href) {
        links.push(makeAbsolute(url, href))
      }
    })

    document.querySelectorAll("img").forEach((img) => {
      const src = img.src
      if (src) {
        images.push(makeAbsolute(url, src))
      }
    })

    links = deduplicateAndSort(links)
    images = deduplicateAndSort(images)

    const linksFilename = path.join(linksDir, getFilename(url, "links"))
    writeToFile(linksFilename, links.join("\n"))
    console.log(`Links written to ${linksFilename}`)

    const imagesFilename = path.join(imagesDir, getFilename(url, "images"))
    writeToFile(imagesFilename, images.join("\n"))
    console.log(`Images written to ${imagesFilename}`)
  } catch (error) {
    console.error("Error fetching the URL:", error)
    process.exit(1)
  }
}

const url = getURL()
scrapeWebsite(url)
