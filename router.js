const router = require('express').Router()
const { spawn } = require('child_process')
const fs = require('fs')

/**
 * Request GPIO via python
 * @param {String} path Path of python script
 * @param {Array} args Optional arguments
 * @returns {String} Result
 */
const readGPIO = (path, args = []) => {
    return new Promise((resolve, reject) => {
        if (!fs.existsSync(`./python/${path}.py`)) reject({ ok: false, error: `Module ${path}.py not found` })

        const python = spawn('python', [`./python/${path}.py`, ...args])
        python.stdout.on('data', data => {
            console.log(JSON.parse(data))
            resolve({ ok: true, data: data.toString() })
        })
        python.stderr.on('data', data => reject({ ok: false, error: data.toString() }))
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

        res.json({
            ok: true,
            gpioDoorSensor: JSON.parse(gpioDoorSensor),
            gpioFlapSensor: JSON.parse(gpioFlapSensor),
            gpioClimateSensor: JSON.parse(gpioClimateSensor)
        })
    } catch (error) {
        res.json({ ok: false, error: error })
    }
})

/**
 * Main route
 */
router.get('/', (req, res) => {
    res.render('index')
})

module.exports = router