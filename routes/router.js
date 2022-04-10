const router = require('express').Router()

// GPIO controller route
router.use('/gpio', require('./gpio'))

// Webcam route
// router.use('/webcam', require('./webcam'))

/**
 * Main route
 * @param {Object} app  Express instance
 * @returns {Object}    Express router object
 */
module.exports = app => {

    router.get('/', (req, res) => {
        res.render('index')
    })

    return router
}