const router = require('express').Router()
const { spawn } = require('child_process')
const fs = require('fs')
const crypto = require('crypto')

/**
 * 
 * @param {*} str 
 * @returns 
 */
const sanitize = str => str.toString().trim().replace("'", "\'").replace('"', '\"')

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
        python.stdout.on('data', data => resolve(JSON.parse(data.toString())))
        python.stderr.on('data', data => resolve(JSON.parse(data.toString())))
    })
}

module.exports = livestream => {

    /**
     * Main route
     */
    router.get('/', async (req, res) => {
        const rpiData = {}
        rpiData.door = await readGPIO('door-sensor', [process.env['GPIO_DOOR_SENSOR']]) || 'n/a'
        rpiData.flap = await readGPIO('flap-sensor', [process.env['GPIO_FLAP_SENSOR']]) || 'n/a'
        rpiData.climate = await readGPIO('climate-sensor', [process.env['GPIO_CLIMATE_SENSOR']]) || 'n/a'
        rpiData.temp = (fs.readFileSync('/sys/class/thermal/thermal_zone0/temp') / 1000).toFixed(1) || 'n/a'

        res.render('index', { rpiData })
    })

    /**
     * Route for taking a snapshot
     */
    router.get('/snapshot', async (req, res) => {
        try {
            const snapshot = await livestream.getSnapshot()

            if (!snapshot) throw new Error('Webcam liefert kein Bild.')

            const filetype = livestream.config.encoding.toLowerCase()
            const filename = `${crypto.createHash('sha256').update(snapshot.toString()).digest('hex')}.${filetype}`

            fs.writeFile(`./snapshots/${filename}`, snapshot.split(';base64,')[1], 'base64', error => {
                if (error) throw new Error(error)

                res.json({ ok: true, filename, snapshot })
            })
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
            const gpioFlapSensor = await readGPIO('flap-sensor', [process.env.GPIO_FLAP_SENSOR])
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

    //
    return router
}