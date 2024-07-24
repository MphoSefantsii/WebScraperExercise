const fetch = require("node-fetch")
const { JSDOM } = require("jsdom")

function getURL() {
  const url = process.argv[2]
  if (!url) {
    console.error("Provide a valid URL as the argument")
    process.exit(1)
  }
  return url
}

async function scrapeWebsite(url) {
  try {
    console.log(`Fetching URL from: ${url}`) // show the url being fetched
    const response = await fetch(url) // fetch all the HTML from provided url
    const text = await response.text() // get the response HTML text
    const dom = new JSDOM(text) // parse said text into a JSDOM object
    const document = dom.window.document // extract the document object from JSDOM

    const links = []

    // selects all anchor "<a>" elements in the document
    document.querySelectorAll("a").forEach((anchor) => {
      const href = anchor.href
      if (href) {
        links.push(href)
      }
    })

    const images = []

    // selects all anchor "<img>" elements in the document
    document.querySelectorAll("img").forEach((img) => {
      const src = img.src
      if (src) {
        images.push(src)
      }
    })

    return { links, images }
  } catch (error) {
    console.error("Error fetching the URL:", error)
    process.exit(1)
  }
}

const url = getURL()

scrapeWebsite(url).then((result) => {
  console.log("Links:", result.links)
  console.log("Images:", result.images)
})
