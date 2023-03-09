const express = require('express')
const Controller = require('../controllers/controller')
const routerRegister = express.Router()

routerRegister.get('/register', Controller.register)
routerRegister.post('/register', Controller.postRegister)
routerRegister.get('/login', Controller.login)
routerRegister.post('/login', Controller.postLogin)

////routes untuk User aja///////
routerRegister.use(function(req, res, next){
    // console.log(req.session);
    if(!req.session.username){
        const error = "Login dulu Cokkk!!"
        res.redirect(`/login?error=${error}`)
    }else{
        next()
    }
})
routerRegister.get('/home', Controller.home)
routerRegister.get('/userProfile', Controller.userProfile)
routerRegister.get('/addToProfile', Controller.addToProfile)
routerRegister.post('/addToProfile/:id', Controller.postAddToProfile)

routerRegister.get('/logout', Controller.logout)





 
 ////routes yang bawah untuk admin aja//////

routerRegister.use(function(req, res, next){
    // console.log(req.session);
    if(req.session.username && req.session.role !== "admin"){
        const error = "Anda tidak memiliki akses!!"
        res.redirect(`/register?error=${error}`)
    }else{
        next()
    }
})



routerRegister.get('/update', Controller.update)


module.exports = routerRegister