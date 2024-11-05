const { pool } = require('../config/db');

exports.up = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS cars (
      id int NOT NULL AUTO_INCREMENT,
      brand varchar(255) NOT NULL,
      model varchar(255) NOT NULL,
      plate varchar(8) UNIQUE NOT NULL,
      year int NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

      CONSTRAINT PK_cars PRIMARY KEY (id)
    ) ENGINE innoDB;
  `);
};

exports.down = async () => {
  await pool.query(`
    DROP TABLE IF EXISTS cars
  `);
};
