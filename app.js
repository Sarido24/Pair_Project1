const express = require('express')
const registerRouter = require('./routes/register')
const postsRouter = require('./routes/posts')
const app = express()
const session = require('express-session')
const port = 3000

app.set('view engine', 'ejs')
app.use(express.urlencoded({extended:true}))
app.use('/static/chartjs', express.static('node_modules/chart.js/dist'));

app.use(session({
    secret: 'Pengen tau Banget',
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: false,
        sameSite: true
    }
  }))
app.use(registerRouter)
app.use('/posts', postsRouter)

app.listen(port, () => {
  console.log(`TEST GAN ${port}`)
})