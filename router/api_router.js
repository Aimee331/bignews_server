//导入所需模块
const express = require('express')
const conn = require('../util/sql.js')
const jwt = require('jsonwebtoken')
//创建路由中间件
const router = express.Router()
//解析变量
router.use(express.urlencoded())
//注册接口/post/api/register
router.post('/register', (req, res) => {
    //获取参数
    const { username, password } = req.body
    // console.log(req.body);
    // console.log(username, password);
    //先去数据表里面查询是否用户名已经注册过
    const sqlSelectStr = `select * from users where username="${username}"`
    conn.query(sqlSelectStr, (err, result) => {
        // console.log(err);
        if (err) return res.json({ status: 1, message: '服务器错误' })
        if (result.length) return res.json({ status: 1, message: '用户名已存在,请重新输入' })
        const sqlStr = `insert into users (username,password) values("${username}","${password}")`
        conn.query(sqlStr, (err, result) => {
            if (err) return res.json({ status: 1, message: '服务器错误' })
            res.json({ status: 0, message: '恭喜您!注册成功' })
        })
    })
})
//登录接口/post/api/login
router.post('/login', (req, res) => {
    //获取参数
    const { username, password } = req.body
    console.log(req.body);
    const sqlStr = `select * from users where username="${username}" and password="${password}"`
    conn.query(sqlStr, (err, result) => {
        if (err) return res.json({ status: 1, message: '服务器错误' })
        if (result.length) return res.json({ status: 1, message: '登录失败,用户名或密码错误!' })
        let token = jwt.sign({ passsword: result[0].password }, 'bignews1', { expiresIn: 2 * 60 * 60 })
        token = 'Bearer ' + token
        res.json({ status: 0, message: '登录成功', token: token })
    })
})
//导出模块
module.exports = router