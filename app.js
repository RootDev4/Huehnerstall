const express = require('express')
const path = require('path')
const app = express()

// Config file
const dotenv = require('dotenv')
dotenv.config()

// Set template engine
app.set('views', path.join(__dirname, 'public'))
app.set('view engine', 'ejs')

// Serve assets
app.use('/jquery', express.static(path.join(__dirname, 'node_modules/jquery/dist')))
app.use('/bootstrap', express.static(path.join(__dirname, 'node_modules/bootstrap/dist')))
app.use('/bootstrap-icons', express.static(path.join(__dirname, 'node_modules/bootstrap-icons/font')))
app.use('/sweetalert2', express.static(path.join(__dirname, 'node_modules/sweetalert2/dist')))

// Configure express
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, 'public')))

// Handle errors
app.use((error, req, res, next) => res.status(error.status || 500).json({ error: error }))

// Init webcam
const livestream = require('rpi_camera_livestream')
livestream.register(app, process.env.PORT)
livestream.setPathname('/webcam')
livestream.start()

// Routes for requests
const router = require('./router')(livestream)
app.use('/', router)

// Start HTTP server
app.listen(process.env.PORT, () => console.log(`Server is up and listen on port ${process.env.PORT}`))