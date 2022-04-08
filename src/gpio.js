const nconf = require('nconf')

//
nconf.file({ file: './status.json' })

/*
nconf.set('trapControlledManually', false)
nconf.set('trapStatus', 'open')

nconf.save(error => { throw error })

console.log(nconf.get('trapControlledManually'))
*/

/**
 * Synchronize with Raspberry Pi and GPIO
 * @returns 
 */
const requestGPIO = () => {
    return new Promise(async (resolve, reject) => {
        try {
            const data = { trap: 'closed', door: 'closed', temperature: 24, humidity: 27 }

            resolve(data)
        } catch (error) {
            console.log(error)
            reject(error.message)
        }
    })
}

/**
 * 
 * @returns 
 */
module.exports.synchronize = async () => {
    try {
        const data = await requestGPIO()

        resolve(data)
    } catch (error) {
        console.log(error)
        reject(error.message)
    }
}