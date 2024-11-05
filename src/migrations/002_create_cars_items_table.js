const { pool } = require('../config/db');

exports.up = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS cars_items (
      id INT NOT NULL AUTO_INCREMENT,
      name varchar(255) NOT NULL,
      car_id int NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

      CONSTRAINT PK_cars_items PRIMARY KEY (id),
      CONSTRAINT FK_car_item  FOREIGN KEY (car_id)
        REFERENCES cars(id)
    );    
  `);
};

exports.down = async () => {
  await pool.query(`
    DROP TABLE IF EXISTS cars_items
  `);
};
