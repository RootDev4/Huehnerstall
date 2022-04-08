const express = require('express')
const path = require('path')
const Webcam = require('./src/webcam')

const app = express()
const port = 8080

// Set template engine
app.set('views', path.join(__dirname, 'public'))
app.set('view engine', 'ejs')

// Configure express
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, 'public')))

// Handle errors
app.use((error, req, res, next) => {
    res.status(error.status || 500)
    res.json({ error: error })
})

// Routes for requests
const router = require('./src/router')(app)
app.use('/', router)

// Start server
app.listen(port, () => console.log(`Server is up and listen on port ${port}`))