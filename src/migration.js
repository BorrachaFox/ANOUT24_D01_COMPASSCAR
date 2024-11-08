/* eslint-disable no-console */
/* eslint-disable global-require */
/* eslint-disable import/no-dynamic-require */
const fs = require('fs');
const path = require('path');

const { pool } = require('./config/db');

// Read all .js files in migrations folder;
const readMigrationsFile = () => {
  const migrationFiles = fs
    .readdirSync(path.join(__dirname, 'migrations'))
    .filter((file) => file.endsWith('.js'))
    .sort();

  return migrationFiles;
};

const migrationFiles = readMigrationsFile();

// Run database commands in migration folder
const runMigrations = async (showState = false) => {
  const migrationPromise = migrationFiles.map((file) => {
    const migration = require(`./migrations/${file}`);
    return migration
      .up()
      .then(() => {
        if (showState) {
          console.log(`\x1b[32m+ Migration ${file} executed \x1b[0m`);
        }
      })
      .catch((err) => {
        if (showState) {
          console.error(`Failed migration ${file}: ${err.message}`);
        }
        process.exit(1);
      });
  });

  await Promise.all(migrationPromise);
};

const main = async () => {
  await runMigrations(true);
  await pool.end();
};

module.exports = {
  runMigrations,
};

if (require.main === module) {
  main().catch((err) => {
    console.error('Error running migrations:', err);
    process.exit(1);
  });
}
