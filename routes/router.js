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
        res.json({ error: error.message })
    }
})

// Write to config file
router.post('/set-config', async (req, res) => {
    try {
        const data = fs.readFileSync('config.json')
        let configData = JSON.parse(data)
        const newData = req.body

        // Set data
        for (let value in newData) {
            if (configData[value]) configData[value] = newData[value]
        }

        // Save data
        fs.writeFile('config.json', JSON.stringify(configData), error => {
            if (error) throw error
            res.json(configData)
        })
    } catch (error) {
        console.log('Error while writing config file', error)
        res.json({ error: error.message })
    }
})

module.exports = router