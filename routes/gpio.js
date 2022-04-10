const router = require('express').Router()
const { spawn } = require('child_process')
const fs = require('fs')

/**
 * 
 * @param {String} path 
 * @param {Array} args 
 * @returns 
 */
const readGPIO = (path, args = []) => {
    return new Promise((resolve, reject) => {
        const python = spawn('python', [path, ...args])

        python.stdout.on('data', data => resolve(data.toString()))
        python.stderr.on('data', data => reject(data.toString()))
    })
}

/**
 * 
 * @param {*} module 
 * @returns 
 */
const moduleExists = module => {
    return fs.existsSync(`./python/${module}.py`)
}

/*
const hatch = JSON.parse(await readGPIO('./python/hatch-sensor.py', [26]))
const door = JSON.parse(await readGPIO('./python/door-sensor.py', [19]))
const climateData = JSON.parse(await readGPIO('./python/climate-sensor.py', [2]))
const scheduleData = { schedule: { open: '05:00', close: '21:00' } }
*/

router.post('/read', async (req, res) => {
    try {
        const module = req.body.module || null
        const args = req.body.args || []
        
        if (!moduleExists(module)) throw new Error('')
        if (Array.isArray(args) && args.length < 1) throw new Error('')

        res.json(JSON.parse(await readGPIO(`./python/${module}.py`, args)))
    } catch (error) {
        console.log(error)
        res.json({ error: error.message })
    }
})

module.exports = router