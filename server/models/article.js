const mysql = require('../mysql')

const articleTableSQL = 'CREATE TABLE IF NOT EXISTS articles (' +
    'id INT AUTO_INCREMENT PRIMARY KEY,' +
    'title VARCHAR(1024),' +
    'content LONGTEXT,' +
    'html LONGTEXT,' +
    'categoryid INT,' +
    'category_name VARCHAR(1024),' +
    'visit INT,' +
    '`like` INT,' +
    'comment_count INT,' +
    'create_date VARCHAR(1024),' +
    'update_date VARCHAR(1024),' +
    'is_delete INT,' +
    'timestamp FLOAT,' +
    'FOREIGN KEY (categoryid) REFERENCES categories(id)' +
    ') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;'

const Article = mysql.querySQL(articleTableSQL).then(() => {
    require('./comment')
    require('./like')
})

module.exports = Article