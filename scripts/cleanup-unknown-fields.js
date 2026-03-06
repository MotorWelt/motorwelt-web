const { sanityWriteClient } = require("../lib/sanityClient.script");

async function run() {
  const query = `
    *[_type == "article" && (defined(createdAt) || defined(mainImageAsset))]{
      _id
    }
  `;

  const docs = await sanityWriteClient.fetch(query);

  console.log(`Found ${docs.length} docs to clean`);

  for (const doc of docs) {
    await sanityWriteClient
      .patch(doc._id)
      .unset(["createdAt", "mainImageAsset"])
      .commit();

    console.log(`✔ cleaned ${doc._id}`);
  }

  console.log("DONE");
}

run().catch(console.error);
