//导入所需模块
const express = require('express')
const path = require('path')
const router = express.Router()
const conn = require('../util/sql')
const multer = require('multer')
const { read } = require('fs')
////单独设置文件名
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads');
    },
    filename: function (req, file, cb) {
        console.log('file', file)
        // const filenameArr = file.originalname.split('.');
        let fileName = Date.now() + path.extname(file.originalname)
        cb(null, fileName) //  + "." +filenameArr[filenameArr.length-1]);
    }
})

let upload = multer({ storage })
//解析数据
router.use(express.urlencoded())
//文章搜索/get/admin/article/query
router.get('/query', (req, res) => {
    let arr = []
    conn.query('select * from categories', (err, result) => {
        result.forEach(item => arr.push({ id: item.id, name: item.name }))
    })
    let { key, type, state, page, perpage } = req.query
    let sqlStr = `select * from articles where isDelete=0`
    if (type) sqlStr += ` and categoryId=${type}`
    if (key) sqlStr += ` and title like "%${key}%"`
    if (state) sqlStr += ` and state="${state}"`
    if (!page) page = 1
    if (!perpage) perpage = 6
    let totalCount = ''
    let totalPage = ''
    conn.query(sqlStr, (err, result) => {
        totalCount = result.length
        totalPage = Math.ceil(result.length / perpage)
        sqlStr += ` limit ${perpage * (page - 1)},${perpage}`
        conn.query(sqlStr, (err, result) => {
            if (err) return res.json({ status: 1, message: '服务器错误' })
            result.forEach(option => {
                let obj = arr.find(item => item.id === option.categoryId)
                option.category = obj.name
                delete option.isDelete
                delete option.categoryId
            })
            res.json({ status: 0, message: '获取成功', totalCount: totalCount, totalPage: totalPage, data: result })
        })
    })
})
//发布文章/post/admin/article/publish
router.post('/publish', upload.single('cover'), (req, res) => {
    console.log(req.file);
    let { title, categoryId, date, content, state } = req.body
    const { username } = req.user
    if (!state) state = '草稿'
    let src = 'http://127.0.0.1:9000/' + req.file.path
    // const sqlStr = "insert into articles(title,cover,categoryId,date,content,state,isDelete,author) values(?,?,?,?,?,?,?,?)"
    // conn.query(sqlStr, [title, src, categoryId, date, content, state, 0, username], (err, result) => {
    //     console.log(err);
    //     console.log(result);
    //     if (err) return res.json({ msg: '发布失败' })
    //     res.json({ msg: '发布成功' })
    // })
    const sqlStr = `insert into articles (title,cover,categoryId,date,content,state,isDelete,author) values("${title}","${src}","${categoryId}","${date}","${content}","${state}",0,"${username}")`
    conn.query(sqlStr, (err, result) => {
        if (err) return res.json({ status: 1, msg: '发布失败' })
        res.json({ status: 0, msg: '发布成功' })
    })
})

//根据id获取文章信息/get/admin/article/search
router.get('/search', (req, res) => {
    const { id } = req.query
    const sqlStr = `select id,title,cover,date,content,state,author,categoryId from articles where id=${id}`
    conn.query(sqlStr, (err, result) => {
        // console.log(err);
        if (err) return res.json({ status: 1, message: '服务器错误' })
        res.json({ status: 0, message: '获取成功', data: result[0] })
    })
})

//文章编辑/post/admin/article/edit
router.post('/edit', upload.single('cover'), (req, res) => {
    const { id, title, categoryId, date, content, state } = req.body
    let sqlStr = `update articles set title="${title}",categoryId=${categoryId},date="${date}",content="${content}",state="${state}"`
    if (req.file) {
        let src = 'http://127.0.0.1:9000/' + req.file.path
        sqlStr += `,cover="${src}" where id=${id}`
    } else {
        sqlStr += ` where id=${id}`
    }
    conn.query(sqlStr, (err, result) => {
        // console.log(err);
        if (err) return res.json({ status: 1, message: '服务器错误,修改失败' })
        res.json({ status: 0, message: '修改成功' })
    })
})

//删除文章/post/admin/article/delete
router.post('/delete', (req, res) => {
    const { id } = req.body
    const sqlStr = `update articles set isDelete=1 where id=${id}`
    conn.query(sqlStr, (err, result) => {
        if (err) return res.json({ status: 1, msg: '服务器错误' })
        res.json({ status: 0, msg: '删除成功' })
    })
})

//导出模块
module.exports = router