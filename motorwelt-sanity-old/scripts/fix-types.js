import {createClient} from '@sanity/client'

const client = createClient({
  projectId: 'juiaa7d6',
  dataset: 'production',
  apiVersion: '2023-01-01',
  token: process.env.SANITY_TOKEN,
  useCdn: false,
})

async function run() {
  const docs = await client.fetch(`*[_type == "post"]{_id}`)
  console.log("Found:", docs.length)

  for (const doc of docs) {
    await client.patch(doc._id).set({_type: "article"}).commit()
    console.log("Updated:", doc._id)
  }

  console.log("DONE")
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})