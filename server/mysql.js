const mysql = require('mysql')
const Promise = require('bluebird')

// Promise.promisifyAll(mysql)
Promise.promisifyAll(require('mysql/lib/Connection').prototype)
Promise.promisifyAll(require("mysql/lib/Pool").prototype)

// var connection = mysql.createConnection({
//     host: 'localhost',
//     user: 'mengna',
//     password: '123456',
//     database: 'evo_blog'
// })
// connection.connect(err => {
//     if (err) throw err
//     console.log('Connected!')
// })

const pool = mysql.createPool({
    connectionLimit: 10,
    host: 'localhost',
    user: 'root',
    password: '123456',
    database: 'evo_blog',
    multipleStatements: true,
    debug: false
})

const getConnection = () => {
    return pool.getConnectionAsync().disposer(connection => connection.release())
}

const querySQL = (sqlStr, params) => {
    return Promise.using(getConnection(), connection => {
        if (params && typeof params !== 'undefined') {
            return connection.queryAsync(sqlStr, params)
        } else {
            return connection.queryAsync(sqlStr)
        }
    })
}

// const createDBSQL = `CREATE DATABASE IF NOT EXISTS evo_blog;`
// const useDBSQL = `USE evo_blog;`

// querySQL(createDBSQL).then(() => {
//     console.log('Database created!!!')
//     querySQL(useDBSQL).then(() => {
//         console.log('Database connected!!!')
//     })
// })

module.exports = {
    querySQL: querySQL
}