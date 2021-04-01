//导入所需模块
const express = require('express')
const conn = require('../util/sql.js')
const path = require('path')
const multer = require('multer')

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
//创建路由中间件
const router = express.Router()
//解析变量
router.use(express.urlencoded())

//获取用户的基本信息get/my/userinfo
router.get('/userinfo', (req, res) => {
    const { username } = req.query
    const sqlStr = `select id,username,nickname,email,userPic from users where username="${username}"`
    conn.query(sqlStr, (err, result) => {
        // console.log(err);
        if (err) return res.json({ status: 1, message: '服务器错误' })
        res.json({ status: 0, message: '获取用户基本信息成功!', data: result[0] })
    })
})
//上传用户头像/post/my/uploadPic
router.post('/uploadPic', upload.single('file_data'), (req, res) => {
    console.log(req.file);
    res.json({ status: 0, message: '上传头像成功!' })
})

//更新用户基本信息/post/my/userinfo
router.post('/userinfo', (req, res) => {
    const { id, nickname, email, userPic } = req.body
    const sqlStr = `update users set nickname="${nickname}",email="${email}",userPic="${userPic}" where id=${id}`
    conn.query(sqlStr, (err, result) => {
        if (err) return res.json({ status: 1, message: '服务器错误' })
        res.json({ status: 0, message: '更新成功' })
    })
})

//重置密码/post/my/updatepwd
router.post('/updatepwd', (req, res) => {
    const { id, oldPwd, newPwd } = req.body
    //首先要验证旧密码是否正确
    const sqlVerifyStr = `select password from users where id=${id}`
    conn.query(sqlVerifyStr, (err, result) => {
        if (err) return res.json({ status: 1, message: '服务器错误' })
        console.log(result);
        if (result[0].password !== oldPwd) return res.json({ status: 0, message: '旧密码错误,请重新输入!' })
        //旧密码正确之后再操作数据库
        const sqlStr = `update users set password="${newPwd}" where id=${id}`
        conn.query(sqlStr, (err, result) => {
            if (err) return res.json({ status: 1, message: '服务器错误' })
            res.json({ status: 0, message: '恭喜您,密码修改成功' })
        })
    })
})

//获取文章分类列表/get/my/article/cates
router.get('/article/cates', (req, res) => {
    const sqlStr = `select * from categories`
    conn.query(sqlStr, (err, result) => {
        if (err) return res.json({ status: 1, message: '服务器错误' })
        res.json({ status: 0, message: '获取文章分类列表成功', data: result })
    })
})

//新增文章分类/post/my/article/addcates
router.post('/article/addcates', (req, res) => {
    const { name, slug } = req.body
    const sqlStr = `insert into categories (name,slug) values("${name}","${slug}")`
    conn.query(sqlStr, (err, result) => {
        if (err) return res.json({ status: 1, message: '服务器错误' })
        res.json({ status: 0, message: '新增文章分类列表成功' })
    })
})

//根据id删除文章分类/get/my/article/deletecate
router.get('/article/deletecate', (req, res) => {
    const { id } = req.query
    const sqlStr = `delete from categories where id=${id}`
    conn.query(sqlStr, (err, result) => {
        // console.log(err);
        if (err) return res.json({ status: 1, message: '服务器错误' })
        res.json({ status: 0, message: '删除成功' })
    })
})

//根据id获取文章分类数据/get/my/article/getCatesById
router.get('/article/getCatesById', (req, res) => {
    const { id } = req.query
    const sqlStr = `select * from categories where id=${id}`
    conn.query(sqlStr, (err, result) => {
        if (err) return res.json({ status: 1, message: '服务器错误' })
        res.json({ status: 0, message: '获取文章分类数据成功', data: result[0] })
    })
})
//根据id更新文章分类数据/post/my/article/updatecate
router.post('/article/updatecate', (req, res) => {
    const { id, name, slug } = req.body
    const sqlStr = `update categories set name="${name}",slug="${slug}" where id=${id}`
    conn.query(sqlStr, (err, result) => {
        if (err) return res.json({ status: 1, message: '服务器错误' })
        res.json({ status: 0, message: '更新文章分类数据成功' })
    })
})
//导出模块
module.exports = router 