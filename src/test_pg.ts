import pg from 'pg'
const { Client } = pg

const client = new Client({ user: 'root', password: 'root', database: 'testpg', })
await client.connect()

await createReplicationSlotIfNotExists('foo_slot')

await client.end()

async function createReplicationSlotIfNotExists (slotName: string) {
  const slots = await client.query('SELECT * FROM pg_replication_slots WHERE slot_name = $1', [slotName])

  if (!slots.rows.length) {
    const newSlot = await client.query("SELECT * FROM pg_create_logical_replication_slot($1, 'pgoutput')", [slotName])
    console.log('Created replication slot', newSlot.rows[0])
  } else {
    console.log('Slot already exists', slots.rows[0])
  }
}


import { LogicalReplicationService, PgoutputPlugin } from 'pg-logical-replication';

const clientReplica = new LogicalReplicationService({
  user: 'root',
  password: 'root',
  database: 'testpg',
}, { acknowledge: { auto: false, timeoutSeconds: 30 } })

clientReplica.on('data', async (lsn, log) => {
  if (log.tag === 'insert') {
    console.log(`${lsn}) Received insert: ${log.relation.schema}.${log.relation.name} ${log.new.id}`)
  } else if (log.relation) {
    console.log(`${lsn}) Received log: ${log.relation.schema}.${log.relation.name} ${log.tag}`)
  }

  await clientReplica.acknowledge(lsn)
})

const eventDecoder = new PgoutputPlugin({
  // Get a complete list of available options at:
  // https://www.postgresql.org/docs/16/protocol-logical-replication.html

  //@ts-expect-error - ddd
  protoVersion: 4,
  // protoVersion: 2,
  binary: true,
  publicationNames: [
    // 'foo_odd',
    // 'foo_update_only'
    'foo_slot'
  ]
})

console.log('Listening for changes...')
process.on('SIGINT', async () => {
  console.log('Stopping client...')
  await clientReplica.stop()
})

await clientReplica.subscribe(eventDecoder, 'foo_slot')