import { createClient } from '@sanity/client'

export const sanity = createClient({
  projectId: 'juiaa7d6',
  dataset: 'production',
  apiVersion: '2023-01-01',
  useCdn: true,
})