module.exports = class Webcam {

    /**
     * A class to stream video from the Raspberry Pi camera module
     * @param {Object} app Express object
     * @param {Object} config Configuration JSON object
     */
    constructor(app, config = {}) {
        this.app = app
        this.stream = null
        this.config = config
        this.file = '/stream.mjpg'
    }

    /**
     * // Init webcam stream (Linux only)
     * @returns {Promise} The name of the streamed file
     */
    init() {
        return new Promise((resolve, reject) => {
            try {
                if (process.platform !== 'linux') throw new Error('Unsupported platform')

                this.stream = require('raspberrypi-node-camera-web-streamer')
                this.stream.acceptConnections(this.app, {
                    width: this.config.width || 1280,
                    height: this.config.height || 720,
                    fps: this.config.fps || 16,
                    encoding: this.config.encoding || 'JPEG',
                    quality: this.config.quality || 7
                }, this.file, (this.config.verbose || true))

                resolve(this.file)
            } catch (error) {
                reject(error.message)
            }
        })
    }

    /**
     * Take a snapshot by using the last captured video frame
     * @returns {Promise} JPG image
     */
    snap() {
        return new Promise((resolve, reject) => {
            try {
                resolve(this.stream.getLastFrame())
            } catch (error) {
                reject(error.message)
            }
        })
    }

}