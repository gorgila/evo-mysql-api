const mysql = require('../mysql')

const likeTableSQL = `CREATE TABLE IF NOT EXISTS likes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    articleid INT,
    userid INT,
    create_date VARCHAR(1024),
    timestamp FLOAT,
    FOREIGN KEY (articleid) REFERENCES articles(id),
    FOREIGN KEY (userid) REFERENCES users(id)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`

const Like = mysql.querySQL(likeTableSQL)

module.exports = Like