const router = require('express').Router()
const { spawn } = require('child_process')
const fs = require('fs')
const crypto = require('crypto')

/**
 * 
 * @param {*} str 
 * @returns 
 */
const sanitize = str => str.toString().trim().replace("'", "\'")

/**
 * Request GPIO via python
 * @param {String} path Path of python script
 * @param {Array} args Optional arguments
 * @returns {String} Result
 */
const readGPIO = (path, args = []) => {
    return new Promise((resolve, reject) => {
        if (!fs.existsSync(`./python/${path}.py`)) reject(`Module ${path}.py not found`)

        const python = spawn('python', [`./python/${path}.py`, ...args])
        python.stdout.on('data', data => resolve({ ok: true, data: data.toString() }))
        python.stderr.on('data', data => resolve({ ok: false, error: data.toString() }))
    })
}

/**
 * Route for requesting GPIO module via python
 */
router.post('/read-gpio', async (req, res) => {
    try {
        const gpioDoorSensor = await readGPIO('door-sensor', [process.env.GPIO_STATUS_DOOR])
        const gpioFlapSensor = await readGPIO('flap-sensor', [process.env.GPIO_STATUS_FLAP])
        const gpioClimateSensor = await readGPIO('climate-sensor', [process.env.GPIO_CLIMATE_SENSOR])

        // Add flap schedule plan
        gpioFlapSensor.schedule = {
            weekday: {
                open: process.env.SCHEDULE_WEEKDAY_OPEN,
                close: process.env.SCHEDULE_WEEKDAY_CLOSE
            },
            weekend: {
                open: process.env.SCHEDULE_WEEKEND_OPEN,
                close: process.env.SCHEDULE_WEEKEND_CLOSE
            }
        }

        res.json({ ok: true, gpioDoorSensor, gpioFlapSensor, gpioClimateSensor })
    } catch (error) {
        res.json({ ok: false, error: sanitize(error) })
    }
})

/**
 * 
 */
router.post('/control', async (req, res) => {
    try {
        const password = req.body.password || null
        if (!password) return res.json({ ok: false, error: 'Passwort ist ungültig.' })

        // Hash password
        const hash = crypto.createHash('sha256').update(password.trim()).digest('hex')
        if (hash !== process.env.PASSWORD) return res.json({ ok: false, error: 'Passwort ist ungültig.' })

        // Get flap status
        const gpioFlapSensor = await readGPIO('flap-sensor', [process.env.GPIO_STATUS_FLAP])
        const flapStatus = JSON.parse(gpioFlapSensor.data) || null
        if (!['open', 'closed'].includes(flapStatus.status)) return res.json({ ok: false, error: 'GPIO-Anfrage fehlgeschlagen.' })

        // Open/close flap
        const gpioFlapController = await readGPIO('flap-controller', [(flapStatus.status === 'open') ? process.env.GPIO_CLOSE_FLAP : process.env.GPIO_OPEN_FLAP])
        if (gpioFlapController.ok === false) return res.json({ ok: false, error: gpioFlapController.error })

        res.json({ ok: true, data: `Die Hühnerklappe wird nun ${(flapStatus.status === 'open') ? 'geschlossen' : 'geöffnet'}.` })
    } catch (error) {
        res.json({ ok: false, error: sanitize(error) })
    }
})

/**
 * Main route
 */
router.get('/', (req, res) => res.render('index'))

//
module.exports = router