const express = require('express')
const router = require('./routes')
const app = express()
const port = 3000

app.set('view engine', 'ejs')
app.use(express.urlencoded({ extended: true }))
app.use('/static/chartjs', express.static('node_modules/chart.js/dist'));
app.use('/static/scripts', express.static('views/scripts'));
app.use(router)

app.listen(port, () => {
  console.log(`TEST GAN ${port}`)
})