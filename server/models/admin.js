const mysql = require('../mysql')

const adminTableSQL = `CREATE TABLE IF NOT EXISTS admins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(1024),
    email VARCHAR(255),
    password VARCHAR(1024),
    create_date VARCHAR(1024),
    update_date VARCHAR(1024),
    is_delete INT,
    timestamp FLOAT
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`

const Admin = mysql.querySQL(adminTableSQL)

module.exports = Admin