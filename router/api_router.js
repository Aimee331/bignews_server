//导入所需模块
const express = require('express')

//创建路由中间件
const router = express.Router()
//解析变量
router.use(express.urlencoded())
//注册接口/post/api/reguser
router.post('/reguser', (req, res) => {
    //获取参数
    const { username, password } = req.body
    //先去数据表里面查询是否用户名已经注册过
    const sqlSelectStr = `select * from users where username="${username}" and password="${password}"`
})