const express = require('express')
const path = require('path')

const app = express()
const port = 8080

// Set template engine
app.set('views', path.join(__dirname, 'public'))
app.set('view engine', 'ejs')

// Serve assets
app.use('/jquery', express.static(path.join(__dirname, 'node_modules/jquery/dist')))
app.use('/bootstrap', express.static(path.join(__dirname, 'node_modules/bootstrap/dist')))
app.use('/bootstrap-icons', express.static(path.join(__dirname, 'node_modules/bootstrap-icons/font')))

// Configure express
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, 'public')))
app.use(express.static(path.join(__dirname, 'snapshots')))

// Handle errors
app.use((error, req, res, next) => {
    res.status(error.status || 500)
    res.json({ error: error })
})

// Routes for requests
const router = require('./routes/router')
app.use('/', router)

// Start server
app.listen(port, () => console.log(`Server is up and listen on port ${port}`))