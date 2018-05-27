const mysql = require('../mysql')

const commentTableSQL = `CREATE TABLE IF NOT EXISTS comments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    articleid INT,
    userid INT,
    username VARCHAR(1024),
    email VARCHAR(255),
    content LONGTEXT,
    create_date VARCHAR(1024),
    is_delete INT,
    timestamp FLOAT,
    FOREIGN KEY (articleid) REFERENCES articles(id),
    FOREIGN KEY (userid) REFERENCES users(id)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`

const Comment = mysql.querySQL(commentTableSQL)

module.exports = Comment