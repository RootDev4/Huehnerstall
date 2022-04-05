const express = require('express')
const path = require('path')
const Webcam = require('./webcam')

const app = express()
const port = 8080
const debug = true
let cam = null

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

// SPA route
app.get('/', async (req, res) => {
    let file = null // Streaming file

    try {
        cam = new Webcam(app)
        file = await cam.init().catch(error => { throw error })
    } catch (error) {
        cam = null
        if (debug) console.log('Webcam initialization failed with error:', error)
    }

    const streamingAddress = (file) ? `http://127.0.0.1:${port}/${file}` : null
    res.render('index', { streamingAddress: streamingAddress })
})

// Take a snapshot
app.post('/snap', async (req, res) => {
    try {
        if (cam) {
            res.json({ snapshot: await cam.snap().catch(error => { throw error }) })
        } else {
            const error = 'Webcam not initialized'
            if (debug) console.log(error)

            throw new Error(error)
        }
    } catch (error) {
        res.json({ error: error.message })
    }
})

// Start server
app.listen(port, () => console.log(`Server is up and listen on port ${port}`))