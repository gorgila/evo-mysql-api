const moment = require('moment')
const mysql = require('../mysql')
const articleTableName = 'articles'
const commentTableName = 'comments'

exports.insert = (req, res) => {
    let articleid = req.body.id,
        content = req.body.content,
        create_date = moment().format('YYYY-MM-DD HH:mm:ss'),
        timestamp = moment().format('X'),
        userid = req.cookies.userid,
        username = req.cookies.username

    username = decodeURI(username)

    if (!articleid) {
        res.json({
            code: -200,
            message: 'Data contains error!!!'
        })
        return
    } else if (!content) {
        res.json({
            code: -200,
            message: 'Please enter comment content!!!'
        })
        return
    }

    const createCommentSQL = `INSERT INTO ${commentTableName} (articleid, userid, username, email, content, create_date, is_delete, timestamp ) VALUES (
        '${articleid}', 
        '${userid}', 
        '${username}', 
        '',
        '${content}', 
        '${create_date}', 
        0,
        '${timestamp}');`

    const updateArticleSQL = `UPDATE ${articleTableName} SET comment_count=comment_count+1 WHERE id=${articleid};`

    mysql.querySQL(createCommentSQL).then(result => {
        return mysql.querySQL(updateArticleSQL).then(() => {
            const selectSQL = `SELECT * FROM ${commentTableName} where id=${result.insertId};`
            return mysql.querySQL(selectSQL).then(rows => {
                res.json({
                    code: 200,
                    data: rows[0],
                    message: 'Comment successfully!!!'
                })
            })
        })
    }).catch(err => {
        res.json({
            code: -200,
            message: err.sqlMessage
        })
    })
}

exports.getList = (req, res) => {
    let articleid = req.query.id,
        all = req.query.all,
        limit = req.query.limit,
        page = req.query.page

    if (!articleid) {
        res.json({
            code: -200,
            message: 'Data contains error!!!'
        })
    } else {
        page = parseInt(page, 10)
        limit = parseInt(limit, 10)

        if (!page) page = 1
        if (!limit) limit = 10

        const skip = (page - 1) * limit

        const searchCountSQL = `SELECT * FROM ${commentTableName} WHERE articleid=${articleid} ` + (!all ? `and is_delete=0 ` : ``) + `ORDER BY id DESC LIMIT ${limit} OFFSET ${skip}; SELECT COUNT(id) AS count FROM ${commentTableName};`

        mysql.querySQL(searchCountSQL).then(result => {
            let total = result[1][0].count
            let totalpage = Math.ceil(total / limit)
            let json = {
                code: 200,
                data: {
                    list: result[0],
                    total,
                    hasNext: totalpage > page ? 1 : 0
                }
            }
            res.json(json)
        }).catch(err => {
            res.json({
                code: -200,
                message: err.sqlMessage
            })
        })
    }
}

exports.deletes = (req, res) => {
    let id = req.query.id

    const commentDelSQL = `UPDATE ${commentTableName} SET is_delete=1 WHERE id=${id};`
    const artiUpdateSQL = `UPDATE ${articleTableName} articles INNER JOIN ${commentTableName} comms ON articles.id=comms.articleid SET articles.comment_count=articles.comment_count-1 where comms.id=${id};`

    mysql.querySQL(commentDelSQL).then(() => {
        return mysql.querySQL(artiUpdateSQL).then(() => {
            res.json({
                code: 200,
                message: 'Delete successfully!!!',
                data: 'success'
            })
        })
    }).catch(err => {
        res.json({
            code: -200,
            message: err.toString()
        })
    })
}

exports.recover = (req, res) => {
    let id = req.query.id

    const commentRecSQL = `UPDATE ${commentTableName} SET is_delete=0 WHERE id=${id};`
    const artiUpdateSQL = `UPDATE ${articleTableName} articles INNER JOIN ${commentTableName} comms ON articles.id=comms.articleid SET articles.comment_count=articles.comment_count+1 where comms.id=${id};`

    mysql.querySQL(commentRecSQL).then(() => {
        return mysql.querySQL(artiUpdateSQL).then(() => {
            res.json({
                code: 200,
                message: 'Recover successfully!!!',
                data: 'success'
            })
        })
    }).catch(err => {
        res.json({
            code: -200,
            message: err.toString()
        })
    })
}