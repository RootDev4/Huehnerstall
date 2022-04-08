const router = require('express').Router()
const Webcam = require('./webcam')

let cam = null // webcam object
let file = null // streaming file

module.exports = app => {

    // Index
    router.get('/', async (req, res) => {
        try {
            cam = new Webcam(app)
            file = await cam.init().catch(error => { throw error })
        } catch (error) {
            cam = null
            console.log('Webcam initialization failed with error:', error)
        }

        const streamingAddress = (file) ? `http://127.0.0.1:${port}/${file}` : null
        res.render('index', { streamingAddress: streamingAddress })
    })

    // Updating data
    router.post('/update', async (req, res) => {
        res.json({ trap: 'open', door: 'closed', temperature: 24, humidity: 27, schedule: { open: '05:00', close: '21:00' } })
    })

    // Updating data
    router.post('/control', (req, res) => {
        // If the trap was opened/closed manually, it must also be closed/opened manually again
        //

        switch (req.body.status) {
            case 'open':
                // The trap was open and is now being closed
                //
            break

            case 'closed':
                //
            break

            case null:
            default:
                //
        }

        res.json({ trapAutoStatus: null }) // TO-DO
    })

    // Take a snapshot
    router.post('/snap', async (req, res) => {
        try {
            if (cam) {
                res.json({ snapshot: await cam.snap().catch(error => { throw error }) })
            } else {
                const error = 'Webcam not initialized'
                console.log(error)

                throw new Error(error)
            }
        } catch (error) {
            res.json({ error: error.message })
        }
    })

    return router
}