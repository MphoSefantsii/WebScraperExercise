const fetch = require("node-fetch")
const { JSDOM } = require("jsdom")
const fs = require("fs")
const path = require("path")
const urlModule = require("url")

function getURL() {
  const url = process.argv[2]
  if (!url) {
    console.error("Provide a valid URL as the argument")
    process.exit(1)
  }
  return url
}

function getFilename(url) {
  const parsedUrl = urlModule.parse(url)
  return parsedUrl.hostname + ".txt"
}

function writeToFile(filename, data) {
  fs.writeFileSync(filename, data, "utf8")
}

async function scrapeWebsite(url) {
  try {
    console.log(`Fetching URL from: ${url}`)
    const response = await fetch(url)
    const text = await response.text()
    const dom = new JSDOM(text)
    const document = dom.window.document

    let fileContent = ""
    fileContent += "\n-Links-\n"

    document.querySelectorAll("a").forEach((anchor) => {
      const href = anchor.href
      if (href) {
        fileContent += `${href}\n` //links.push(href)
      }
    })

    fileContent += "\n-Images-\n"

    // Extract and add image sources to content "//selects all anchor "<img>" elements in the document"
    document.querySelectorAll("img").forEach((img) => {
      const src = img.src
      if (src) {
        fileContent += `${src}\n` // images.push(src)
      }
    })

    //  return { links, images }

    // Determine output filename and write content to file
    const filename = path.join(__dirname, "output", getFilename(url))
    writeToFile(filename, fileContent)
    console.log(`Content written to ${filename}`)
  } catch (error) {
    console.error("Error fetching the URL:", error)
    process.exit(1)
  }
}

const url = getURL()
scrapeWebsite(url)
