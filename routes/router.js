const router = require('express').Router()
const { spawn } = require('child_process')
const fs = require('fs')

// GPIO controller route
router.use('/gpio', require('./gpio'))

const startLiveStream = () => {
    return new Promise((resolve, reject) => {
        const python = spawn('python', ['./python/stream.py', []])

        python.stdout.on('data', data => resolve(data.toString()))
        python.stderr.on('data', data => reject(data.toString()))
    })
}

// Main route
router.get('/', (req, res) => {
    res.render('index')
})

// Live stream
router.get('/stream', async (req, res) => {
    try {
        const stream = await startLiveStream()
        console.log(stream)
        res.json({ ok: true })
    } catch (error) {
        res.json({ error: error })
    }
})

// Read config file
router.get('/get-config', async (req, res) => {
    try {
        const data = fs.readFileSync('config.json')
        res.json(JSON.parse(data))
    } catch (error) {
        console.log('Error while reading config file', error)
        res.json({ error: error })
    }
})

module.exports = router