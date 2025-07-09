import { defineConfig } from '@adonisjs/lucid'

const databaseConfig = defineConfig({
  connection: 'sqlite',
  connections: {
    sqlite: {
      client: 'sqlite',
      connection: {
        filename: 'tmp/db.sqlite3',
      },
      migrations: {
        naturalSort: true,
      },
      debug: false,
    },
  },
})

export default databaseConfig
