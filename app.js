const express = require('express')
const dotenv = require('dotenv')
const path = require('path')
const expressLayouts = require('express-ejs-layouts');
const db = require('./config/db')
const exphbs = require('express-handlebars')
const bodyParser = require('body-parser')
const passport = require('passport')

dotenv.config({path: './config/config.env'})

db()

const app = express()

app.use ((req, res, next) => {
    res.locals.url = req.originalUrl
    res.locals.host = req.get('host')
    res.locals.protocol = req.protocol
    next()
})


app.use(express.urlencoded({ extended: true }))

app.use(bodyParser.json()) 

app.use(express.static(path.join(__dirname, 'public')))


app.use(passport.initialize())
app.use(passport.session())
require('./config/passport')(passport)

// EJS
app.use(expressLayouts);
app.set('view engine', 'ejs')

app.use('/', require('./routes/index'))

app.use('/users', require('./routes/users'))

app.use('/api', require('./routes/api/allData'))

const PORT = process.env.PORT || 5000

app.listen(PORT, ()=>{
    console.log(`Server connect to port ${PORT}`)
})