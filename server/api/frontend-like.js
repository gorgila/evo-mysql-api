const moment = require('moment')
const mysql = require('../mysql')
const articleTableName = 'articles'
const likeTableName = 'likes'

exports.like = (req, res) => {
    let articleid = parseInt(req.query.id),
        userid = parseInt(req.cookies.userid)

    if (userid) {
        const likeListSQL = `SELECT * FROM ${likeTableName} WHERE articleid=${articleid} and userid=${userid};`
        const createLikeSQL = `INSERT INTO ${likeTableName} (articleid, userid, create_date, timestamp) VALUES (
        '${articleid}', 
        '${userid}', 
        '${moment().format('YYYY-MM-DD HH:mm:ss')}', 
        '${moment().format('X')}');`
        const updateArticleSQL = 'UPDATE ' + articleTableName + ' SET `like`=`like`+1 WHERE id=' + articleid + ';'

        mysql.querySQL(likeListSQL).then(rows => {
            if (rows.length) {
                res.json({
                    code: -200,
                    message: 'You already liked this one :)'
                })
            } else {
                mysql.querySQL(createLikeSQL).then(() => {
                    return mysql.querySQL(updateArticleSQL).then(() => {
                        return res.json({
                            code: 200,
                            message: 'Like successfully!!!',
                            data: 'success'
                        })
                    })
                }).catch(err => {
                    res.json({
                        code: -200,
                        message: err.sqlMessage
                    })
                })
            }
        })
    }


}

exports.unlike = (req, res) => {
    let articleid = parseInt(req.query.id),
        userid = parseInt(req.cookies.userid)

    if (userid) {
        const removeLikeSQL = `DELETE FROM ${likeTableName} WHERE articleid=${articleid} and userid=${userid};`
        const updateArticleSQL = 'UPDATE ' + articleTableName + ' SET `like`=`like`-1 WHERE id=' + articleid + ';'

        mysql.querySQL(removeLikeSQL).then(() => {
            return mysql.querySQL(updateArticleSQL).then(() => {
                return res.json({
                    code: 200,
                    message: 'Unlike successfully!!!',
                    data: 'success'
                })
            })
        }).catch(err => {
            res.json({
                code: -200,
                message: err.sqlMessage
            })
        })
    }
}