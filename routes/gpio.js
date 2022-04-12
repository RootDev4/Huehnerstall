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

router.post('/read', async (req, res) => {
    try {
        const module = req.body.module || null
        const args = req.body.args || []
        
        if (!moduleExists(module)) throw new Error(`Module ${module} does not exist.`)
        if (Array.isArray(args) && args.length < 1) throw new Error('Invalid arguments')

        res.json(JSON.parse(await readGPIO(`./python/${module}.py`, args)))
    } catch (error) {
        console.log(error)
        res.json({ error: error.message })
    }
})

module.exports = router