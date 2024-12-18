import pg from 'pg'
const { Client } = pg
import postgres from 'postgres'

const sql = postgres({
  debug: true,
  user: 'postgres',
  password: 'foopsw',
  publications: [
    'foo_even',
    'foo_update_only'
  ]
})

const client = new Client({ user: 'postgres', password: 'foopsw' })
await client.connect()

await createPublicationIfNotExists('foo_even', 'TABLE foo WHERE (id % 2 = 0);')
await createPublicationIfNotExists('foo_update_only', "TABLE foo WITH (publish = 'update');")

await client.end()

async function createPublicationIfNotExists (pubName: string, condition: string) {
  const pub = await client.query('SELECT * FROM pg_publication WHERE pubname = $1', [pubName])

  if (!pub.rows.length) {
    await client.query(`CREATE PUBLICATION ${pubName} FOR ${condition}`)
    console.log(`Created publication ${pubName}`)
  } else {
    await client.query(`ALTER PUBLICATION ${pubName} SET ${condition}`)
    console.log(`Updated publication ${pubName}`)
  }
}

