const fs = require("fs");
const path = require("path");

const inputPath = path.join(
  process.cwd(),
  "scripts",
  "output",
  "motorwelt_articles_review.json"
);

const outputPath = path.join(
  process.cwd(),
  "scripts",
  "output",
  "motorwelt_articles_selected.json"
);

function main() {
  const raw = JSON.parse(fs.readFileSync(inputPath, "utf8"));

  const selected = raw.filter((item) => {
    const action = (item.action || "").toLowerCase().trim();
    const status = (item.status || "").toLowerCase().trim();

    return (
      action === "publicar" ||
      status === "listo" ||
      status === "publicar"
    );
  });

  fs.writeFileSync(outputPath, JSON.stringify(selected, null, 2), "utf8");

  console.log("DONE");
  console.log(`Selected articles: ${selected.length}`);
  console.log(`Saved to ${outputPath}`);
}

main();