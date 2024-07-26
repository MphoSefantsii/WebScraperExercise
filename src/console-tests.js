// Extracting game name
const nameSelector = "h1.sc-dxjrPO.cXyUDD.MuiTypography-root.MuiTypography-h3"
const nameElement = document.querySelector(nameSelector)
console.log("Game Name:", nameElement ? nameElement.textContent.trim() : "N/A")

// Extracting genre
const genresSelector =
  "div.sc-eIPYkq.ioJrei.MuiGrid2-root.MuiGrid2-direction-xs-row.sc-hBgdUx.jLxKaX.sc-jchFli.hbRUXw a"
const genreElements = document.querySelectorAll(genresSelector)
const genres = Array.from(genreElements)
  .map((el) => el.textContent.trim())
  .join(", ")
console.log("Genres:", genres || "N/A")

// Extracting platforms
const platformsSelector = "div.sc-eIPYkq.dABZrK.MuiGrid2-root.MuiGrid2-direction-xs-row.MuiGrid2-grid-xs-6 p"
const platformElements = document.querySelectorAll(platformsSelector)
const platformsText = Array.from(platformElements)
  .map((el) => el.textContent.trim())
  .filter((text) => !text.match(/^\d{4}-\d{1,2}-\d{1,2}$/)) // Exclude date formats
  .join(", ")
const platforms = platformsText.replace(/^Releases,?\s*/, "") // Remove 'Releases' and any leading comma
console.log("Platforms:", platforms || "N/A")

// Extracting release date
const releaseDateSelector =
  "div.sc-eIPYkq.WKfQO.MuiGrid2-root.MuiGrid2-direction-xs-row.MuiGrid2-grid-sm-4.MuiGrid2-grid-md-3 span.sc-dxjrPO.kMTTuA"
const releaseDateElement = document.querySelector(releaseDateSelector)
const releaseDate = releaseDateElement ? releaseDateElement.textContent.trim() : "N/A"

console.log("Release Date:", releaseDate || "N/A")

// Extracting publisher
const publisherSelector =
  "div.sc-eIPYkq.ioJrei.MuiGrid2-root.MuiGrid2-direction-xs-row.sc-hBgdUx.jLxKaX.sc-jchFli.hbRUXw p"
const publisher = getElementText(publisherSelector)
console.log("Publisher:", publisher || "N/A")

// Extracting image URL
const imageSelector = "div.mui-image-wrapper img"
const imageElement = document.querySelector(imageSelector)
const image = imageElement ? imageElement.src : "N/A"
console.log("Image URL:", image || "N/A")
