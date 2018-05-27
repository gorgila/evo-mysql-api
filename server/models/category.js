const mysql = require('../mysql')

const categoryTableSQL = `CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cate_name VARCHAR(1024),
    cate_order VARCHAR(1024),
    cate_num INT NOT NULL DEFAULT 0,
    create_date VARCHAR(1024),
    update_date VARCHAR(1024),
    is_delete INT,
    timestamp FLOAT
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`

const Category = mysql.querySQL(categoryTableSQL).then(() => {
    require('./article')
})

module.exports = Category