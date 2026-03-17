const fs = require("fs");
const path = require("path");

const inputPath = path.join(
  process.cwd(),
  "scripts",
  "output",
  "motorwelt_articles_selected.json"
);

const outputPath = path.join(
  process.cwd(),
  "scripts",
  "output",
  "motorwelt_redirects.txt"
);

function main() {
  const raw = JSON.parse(fs.readFileSync(inputPath, "utf8"));

  const lines = raw.map((item) => {
    return `${item.oldPath} ${item.newPath} 301`;
  });

  fs.writeFileSync(outputPath, lines.join("\n"), "utf8");

  console.log("DONE");
  console.log(`Redirects generated: ${lines.length}`);
  console.log(`Saved to ${outputPath}`);
}

main();