const router = require('express').Router()
const fs = require('fs')

// GPIO controller route
router.use('/gpio', require('./gpio'))

// Main route
router.get('/', (req, res) => {
    res.render('index')
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