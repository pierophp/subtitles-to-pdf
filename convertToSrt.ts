const fs = require("fs");
const xml2js = require("xml2js");

// Convert TTML time format to SRT time format
const convertTimeFormat = (time) => {
  // Convert the time from ticks to milliseconds
  const ticks = parseInt(time.replace("t", ""), 10); // Remove 't' and parse the number
  const milliseconds = Math.round(ticks / 10000); // Convert ticks to milliseconds

  // Calculate hours, minutes, seconds, and remaining milliseconds
  const hours = Math.floor(milliseconds / 3600000);
  const minutes = Math.floor((milliseconds % 3600000) / 60000);
  const seconds = Math.floor((milliseconds % 60000) / 1000);
  const ms = milliseconds % 1000;

  // Return the time in the format HH:MM:SS,MMM
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)},${pad(ms, 3)}`;
};

// Helper function to pad single digits with leading zeros
const pad = (num, digits = 2) => num.toString().padStart(digits, "0");

// Function to clean up subtitle text
const cleanText = (text) => {
  // Remove the leading "- " before brackets
  return text
    .replace(/^- /, "")
    .replace(/<br\s*\/?>/g, " ")
    .trim();
};

const convertToSrt = (inputFile, outputFile) => {
  // Read the TTML file
  fs.readFile(inputFile, "utf8", (err, data) => {
    if (err) {
      console.error(`Error reading file: ${err}`);
      return;
    }

    // Replace <br/> with a whitespace
    data = data.replace(/<br\s*\/?>/g, " ");

    // Parse XML
    const parser = new xml2js.Parser();
    parser.parseString(data, (err, result) => {
      if (err) {
        console.error(`Error parsing XML: ${err}`);
        return;
      }

      const subtitles = [];
      let index = 1;

      // Navigate to subtitle entries
      const body = result["tt"]["body"][0];
      const div = body["div"][0];
      const paragraphs = div["p"];

      paragraphs.forEach((p) => {
        const begin = p.$.begin;
        const end = p.$.end;
        let text = p._;

        if (begin && end && text) {
          // Clean up the text
          text = cleanText(text);

          subtitles.push({
            index,
            start: convertTimeFormat(begin),
            end: convertTimeFormat(end),
            text: text,
          });
          index++;
        }
      });

      // Write to SRT file
      const srtContent = subtitles
        .map(
          (subtitle) =>
            `${subtitle.index}\n${subtitle.start} --> ${subtitle.end}\n${subtitle.text}\n`
        )
        .join("\n");

      fs.writeFile(outputFile, srtContent, (err) => {
        if (err) {
          console.error(`Error writing file: ${err}`);
        } else {
          console.log(`Converted subtitles saved to ${outputFile}`);
        }
      });
    });
  });
};

// Example usage
const inputFile = "movies/sonic1/subtitle.xml";
const outputFile = "movies/sonic1/subtitle.srt";

convertToSrt(inputFile, outputFile);
