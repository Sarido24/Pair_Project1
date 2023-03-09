const {User, Profile, Post} = require('../models/index')
const verify = require('../helpers/verifyLogin')
class Controller{

    static home(req, res){
        res.render('home')
    }
    static register(req, res){
        const {errorRegister} = req.query
        res.render('register', {errorRegister})
    }
    static postRegister(req, res){
        const {username, password, email} = req.body
        
        User.create({username, password, email})
        .then((user)=>{
            user.createProfile({
                firstName: username,
                lastname: "",
                age: null,
                phone: ""
            })
            .then(()=>{
                res.redirect('/login')

            })
        })
        .catch((err)=>{
            if(err.name === "SequelizeValidationError" || err.name === "SequelizeUniqueConstraintError" ){

                const errorRegister = err.errors.map((el)=> {
                    return el.message
                })

                res.redirect(`/register?errorRegister=${errorRegister}`)
            }else{
                res.send(err)
            }
            
        })
    }
    static login(req, res){
        const {error} = req.query        
        res.render('login', {error})
    }
    static postLogin(req, res){
        const {username, password} = req.body
        User.findOne({
            where : {username}
        })
        .then((dataUser)=>{
            if(dataUser){
                let status = verify(dataUser, password)
                if(status === true){//case berhasil login
                    req.session.username = dataUser.username
                    req.session.role = dataUser.role
                    req.session.userId = dataUser.id
                    return res.redirect('/home')
                }else{
                    const error = "Password yang anda masukkan salah!" 
                    return res.redirect(`/login?error=${error}`)
                }   
            }else{
                const error = "Username tidak ditemukan!"
                return res.redirect(`/login?error=${error}`)
            }

        })
        .catch((err)=>{
            res.send(err)
        })
    }

    static logout(req, res){
        req.session.destroy((err)=>{
            if(err){
                res.send(err)
            }else{
                res.redirect('/login')
            }
        })
    }

    static userProfile(req, res){
        const id = req.session.userId
        Profile.findOne({
            include: User,
            where: {UserId : id}
        })
        .then((data)=>{
            res.render('myProfile',{data})
        })
        .catch((err)=>{
            res.send(err)
        })
    }

    static addToProfile(req, res){
        const id = req.session.userId
        Profile.findOne({
            where: {UserId : id}
        })
        .then((data)=>{
            if(data){
                res.render('addToProfile', {data})
            }else{
                Profile.create({
                    firstName: "",
                    lastname: "",
                    age: null,
                    phone: "",
                    UserId:id
                })
                res.redirect('/addProfile')
            }

        })
        .catch((err)=>{
            res.send(err)
        })
    }

    static postAddToProfile(req, res){
        const { id } = req.params
        const {firstName, lastName, age, phone} = req.body
        Profile.update({
            firstName, 
            lastName, 
            age, 
            phone
        }, 
        {
            where: {id}
        }

        )
        .then(()=>{
            res.redirect('/home')
        })
        .catch((err)=>{
            res.send(err)
        })
        

    }

    static update(req, res){
        res.render('update')
    }






}

module.exports = Controller