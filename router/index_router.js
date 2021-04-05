//导入所需模块
const express = require('express')
const { connect } = require('./api_router')
const router = express.Router()
const conn = require('../util/sql.js')
const { json } = require('express')

//解析变量
router.use(express.urlencoded())

//文章搜索/get/index/search
router.get('/search', (req, res) => {
    let { key, type, page, perpage } = req.query
    let sqlStr = `select * from articles where isDelete=0`
    if (key) sqlStr += ` and title like "%${key}%"`
    if (type) sqlStr += ` and categoryId=${type}`
    if (!page) page = 1
    if (!perpage) perpage = 6
    let pages = ''
    conn.query(sqlStr, (err, result) => {
        pages = Math.ceil(result.length / perpage)
    })
    let sqlConnStr = `select DISTINCT articles.id,categories.name,(SELECT COUNT(id) FROM comments where comments.articleId=articles.id and comments.state!='已拒绝') comments
from articles
left join comments on comments.articleId=articles.id
left join categories on categories.id=articles.categoryId`
    let arr = []
    conn.query(sqlConnStr, (err, result) => {
        if (err) return res.json({ msg: '服务器错误' })
        // console.log(result);
        result.forEach(item => {
            arr.push({ id: item.id, comments: item.comments, name: item.name })
        })
        sqlStr += ` limit ${(page - 1) * perpage},${perpage}`
        conn.query(sqlStr, (err, result) => {
            console.log(err);
            if (err) return res.json({ msg: '服务器错误' })
            result.forEach(item => {
                let obj = arr.find(option => option.id === item.id)
                let intro = item.content.substr(0, 20)
                item.comment = obj.comments
                item.category = obj.name
                item.intro = intro
                delete item.categoryId
                delete item.isDelete
                delete item.author
                delete item.state
                delete item.content
            })
            res.json({ pages: pages, page: page, data: result })
        })
    })

})

//文章类型/get/index/category
router.get('/category', (req, res) => {
    conn.query('select id,name from categories', (err, result) => {
        if (err) return res.json({ msg: '服务器错误' })
        res.json(result)
    })
})

//热点图/get/index/hotpic
router.get('/hotpic', (req, res) => {
    let r = Math.random()
    //随机返回五条文章数据的id和imgurl,但是不能写死,每次都要先获取articles里面的最新文章数据的条数
    conn.query('select * from articles', (err, result) => {
        // console.log(err);
        if (err) return res.json({ msg: '服务器错误' })
        r = Math.ceil(r * (result.length - 5))
        const sqlStr = `select id,cover from articles limit ${r},5`
        conn.query(sqlStr, (err, result) => {
            // console.log(err);
            if (err) return res.json({ msg: '服务器错误' })
            let newResult = JSON.stringify(result)
            //添加 Stirng对象的原型方法
            String.prototype.replaceAll = function (s1, s2) {
                return this.replace(new RegExp(s1, "gm"), s2);
            }
            //字符串具有恒定性,操作之后要重新赋值
            newResult = newResult.replaceAll('cover', 'imgurl')
            newResult = JSON.parse(newResult)
            res.json(newResult)
        })
    })


})

//文章热门排行/get/index/rank
router.get('/rank', (req, res) => {
    //和热点图的思路一样
    let r = Math.random()
    conn.query('select * from articles', (err, result) => {
        if (err) return res.json({ msg: '服务器错误' })
        r = Math.ceil(r * (result.length - 7))
        const sqlStr = `select id,title from articles limit ${r},7`
        conn.query(sqlStr, (err, result) => {
            if (err) return res.json({ msg: '服务器错误' })
            res.json(result)
        })
    })
})

//最新资讯/get/index/latest
//随机返回五条数据,然后需要用多表连接计算出每一条数据的comments
router.get('/latest', (req, res) => {
    let r = Math.random()
    conn.query('select * from articles', (err, result) => {
        if (err) return res.json({ msg: '服务器错误' })
        r = Math.ceil(r * (result.length - 5))
        let sqlConnStr = `select DISTINCT articles.id,categories.name,(SELECT COUNT(id) FROM comments where comments.articleId=articles.id and comments.state!='已拒绝') comments
from articles
left join comments on comments.articleId=articles.id
left join categories on categories.id=articles.categoryId`
        conn.query(sqlConnStr, (err, result) => {
            console.log(err);
            if (err) return res.json({ msg: '服务器错误' })
            // res.json(result)
            let arr = []
            result.forEach(item => {
                arr.push({ id: item.id, comments: item.comments, name: item.name })
            })
            let sqlStr = `select id,title,content,cover,date,\`read\`,categoryId from articles limit ${r},5`
            conn.query(sqlStr, (err, result) => {
                // console.log(err);
                if (err) return res.json({ msg: '服务器错误' })
                result.forEach(item => {
                    let obj = arr.find(option => option.id === item.id)
                    // let newObj = arr.find(option => option.id === item.id)
                    item.comments = obj.comments
                    item.type = obj.name
                    let intro = item.content.substr(0, 20)
                    item.intro = intro
                    delete item.content
                    delete item.categoryId
                })
                res.json({ result })
            })
        })
    })
})


//最新评论/get/index/latest_comment
router.get('/latest_comment', (req, res) => {
    //先获取评论数据表里面的评论条数,再随机返回六条
    let r = Math.random()
    conn.query('select * from comments', (err, result) => {
        if (err) return res.json({ msg: '服务器错误' })
        r = Math.ceil(r * (result.length - 6))
        let sqlStr = `select author,date,content from comments limit ${r},6`
        conn.query(sqlStr, (err, result) => {
            if (err) return res.json({ msg: '服务器错误' })
            result.forEach(item => {
                let intro = item.content.substr(0, 20)
                item.intro = intro
                delete item.content
            })
            res.json(result)
        })
    })

})

//焦点关注/get/index/attention
router.get('/attention', (req, res) => {
    let r = Math.random()
    conn.query('select * from articles', (err, result) => {
        if (err) return res.json({ msg: '服务器错误' })
        r = Math.ceil(r * (result.length - 7))
        const sqlStr = `select content from articles limit ${r},7`
        conn.query(sqlStr, (err, result) => {
            if (err) return res.json({ msg: '服务器错误' })
            result.forEach(item => {
                let intro = item.content.substr(0, 20)
                item.intro = intro
                delete item.content
            })
            res.json(result)
        })
    })
})

//文章详细内容/get/index/artitle
router.get('/artitle', (req, res) => {
    const { id } = req.query
    let sqlConnStr = `select distinct articles.id,categories.name,(select count(id) from comments where articles.id=comments.articleId and comments.state!='已拒绝') comments from articles
            left join comments on articles.id=comments.articleId
            left join categories on categories.id=articles.categoryId`
    conn.query(sqlConnStr, (err, result) => {
        if (err) return res.json({ msg: '服务器错误' })
        let arr = []
        result.forEach(item => {
            arr.push({ id: item.id, type: item.name, comments: item.comments })
        })
        // res.json(arr)
        conn.query('select id,title from articles', (err, result) => {
            if (err) return res.json({ msg: '服务器错误' })
            let indexArr = result
            let curr = indexArr.findIndex(item => item.id == id)
            // res.json(curr)
            let prev = []
            let next = []
            if (curr === 0) {
                let obj = indexArr[curr + 1]
                next = [obj]
            } else if (curr === indexArr.length - 1) {
                let obj = indexArr[curr - 1]
                prev = [obj]
            } else {
                let prevObj = indexArr[curr - 1]
                let nextObj = indexArr[curr + 1]
                prev = [prevObj]
                next = [nextObj]
            }
            conn.query(`select id,title,author,date,\`read\`,content from articles where id=${id}`, (err, result) => {
                if (err) return res.json({ msg: '服务器错误' })
                let obj = arr.find(item => item.id === result[0].id)
                result[0].comments = obj.comments
                result[0].type = obj.type
                delete result[0].id
                result[0].prev = prev
                result[0].next = next
                res.json(result)
            })
        })
    })
})

//发表评论/post/index/post_comment
router.post('/post_comment', (req, res) => {
    const { author, content, articleId } = req.body
    let dt = new Date()
    time = dt.toTimeString().substr(0, 8)
    date = dt.toJSON().substr(0, 10)
    const sqlStr = `insert into comments (author,content,date,time,state,articleId) values("${author}","${content}","${date}","${time}","已通过","${articleId}")`
    conn.query(sqlStr, (err, result) => {
        console.log(err);
        if (err) return res.json({ msg: '服务器错误,发表失败' })
        res.json({ msg: '发表成功' })
    })
})

//评论列表/get/index/get_comment
router.get('/get_comment', (req, res) => {
    const { articleId } = req.query
    const sqlStr = `select author,date,content from comments where articleId=${articleId}`
    conn.query(sqlStr, (err, result) => {
        if (err) return res.json({ msg: '服务器错误' })
        res.json(result)
    })
})
//导出模块
module.exports = router