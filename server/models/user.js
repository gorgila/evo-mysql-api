const mysql = require('../mysql')

const userTableSQL = `CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(1024),
    email VARCHAR(255),
    password VARCHAR(1024),
    create_date VARCHAR(1024),
    update_date VARCHAR(1024),
    is_delete INT,
    timestamp FLOAT
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`

const User = mysql.querySQL(userTableSQL)

module.exports = User