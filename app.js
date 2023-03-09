const express = require('express')
const registerRouter = require('./routes/register')
const app = express()
const port = 3000

app.set('view engine', 'ejs')
app.use(express.urlencoded({extended:true}))
app.use(registerRouter)

app.listen(port, () => {
  console.log(`TEST GAN ${port}`)
})