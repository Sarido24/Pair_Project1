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
        const error = "Mohon login dulu!"
        res.redirect(`/login?error=${error}`)
    }else{
        next()
    }
})
routerRegister.get('/', Controller.showLandingPage);
routerRegister.get('/home', Controller.home)
routerRegister.get('/userProfile', Controller.userProfile)
routerRegister.get('/addToProfile', Controller.addToProfile)
routerRegister.get('/logout', Controller.logout)
routerRegister.get('/posts', Controller.renderPostManagementPage);
routerRegister.get('/posts/add', Controller.renderAddPost);
routerRegister.post('/posts/add', Controller.handleAddPost);
routerRegister.post('/addToProfile/:id', Controller.postAddToProfile)
routerRegister.get('/posts/edit/:id', Controller.renderEditPost);
routerRegister.post('/posts/edit/:id', Controller.handleEditPost);
routerRegister.get('/posts/detail/:id', Controller.postDetail);
routerRegister.get('/posts/delete/:id', Controller.deletePost);
routerRegister.post('/posts/comment/:id', Controller.addComment);



 
 ////routes yang bawah untuk admin aja//////

routerRegister.use(function(req, res, next){
    // console.log(req.session);
    if(req.session.username && req.session.role !== "admin"){
        const error = "Anda tidak memiliki akses!!"
        res.redirect(`/login?error=${error}`)
    }else{
        next()
    }
})



routerRegister.get('/update', Controller.update)


module.exports = routerRegister