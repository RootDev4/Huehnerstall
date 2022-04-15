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
        const python = spawn('python', [path, ...args])

        python.stdout.on('data', data => resolve(data.toString()))
        python.stderr.on('data', data => reject(data.toString()))
    })
}

/**
 * Checks if a python module exists by name
 * @param {Sring} module Name of python module 
 * @returns {Boolean} True/False
 */
const moduleExists = module => {
    return fs.existsSync(`./python/${module}.py`)
}

/**
 * Route for requesting GPIO module via python
 */
router.post('/read', async (req, res) => {
    try {
        const module = req.body.module || null
        const args = req.body.args || []
        
        if (!moduleExists(module)) throw new Error(`Module ${module} does not exist.`)
        if (Array.isArray(args) && args.length < 1) throw new Error('Invalid arguments')

        const result = await readGPIO(`./python/${module}.py`, args)

        res.json(JSON.parse(result))
    } catch (error) {
        res.json({ error: error })
    }
})

module.exports = router