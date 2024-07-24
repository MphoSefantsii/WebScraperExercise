import fetch from "node-fetch";
const { JSDOM } = require("jsdom");

function getURL() {
	const url = process.argv[2];

	if (!url) {
		console.error("Provide a valid url as the arg");
		process.exit(1);
	}
	return url;
}
