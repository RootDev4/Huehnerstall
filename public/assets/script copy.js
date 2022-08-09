'use-strict'

/**
 * Request python scripts to read/write GPIO pins
 * @param {String} module Name of requested module 
 * @param {Array} args Array with optional arguments 
 * @returns {Promise} JSON object with result data
 */
const readGPIO = (module, args) => {
    return new Promise((resolve, reject) => {
        fetch('/gpio/read', {
            method: 'post',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ module: module, args: args })
        })
            .then(response => response.json())
            .then(data => {
                if (data.error) throw data.error
                resolve(data)
            })
            .catch(error => reject(error))
    })
}

/**
 * Translate status text into German
 * @param {String} status open/close
 * @returns {string} German translation
 */
const translate = status => {
    switch (status) {
        case 'open':
            return 'geöffnet'
        case 'closed':
            return 'geschlossen'
        case 'n/a':
        default:
            return 'n/a'
    }
}

/**
 * Get time plan from config object
 * @param {Object} config JSON config object
 * @returns {String} open/close time plan
 */
const getTimeSchedule = (config, status) => {
    //const flapCurrentStatus = localStorage.getItem('flapCurrentStatus')
    const currentWeekday = new Date().toLocaleString('de', { weekday: 'short' })

    // Check if current weekday is at weekend
    if (['Sa', 'So'].includes(currentWeekday)) {
        return (status == 'open') ? config.schedule.weekend.close : config.schedule.weekend.open
    }

    return (status == 'open') ? config.schedule.week.close : config.schedule.week.open
}

/**
 * Get data from config file
 * @returns {Promise} JSON object with result data
 */
const getConfig = () => {
    return new Promise(async (resolve, reject) => {
        fetch('/get-config')
            .then(response => response.json())
            .then(data => {
                if (data.error) throw new Error(data.error)
                resolve(data)
            })
            .catch(error => reject(error))
    })
}

/**
 * Synchronizing with controller module and sensors and update HTML
 * @param {Object} config JSON config object 
 * @returns {Promise} JSON object with result data
 */
const synchronize = config => {
    return new Promise(async (resolve, reject) => {
        try {
            // Read modules connected with GPIO
            const door = await readGPIO('door-sensor', [config.gpio.status.door])
            const flap = await readGPIO('flap-sensor', [config.gpio.status.flap])
            const climate = await readGPIO('climate-sensor', [config.gpio.climate])

            // Catch errors from python scripts
            if (door.error) throw new Error(door.error)
            if (flap.error) throw new Error(flap.error)
            if (climate.error) throw new Error(climate.error)

            // Update data
            document.getElementById('flap').innerText = translate(flap.status)
            document.getElementById('door').innerText = translate(door.status)
            document.getElementById('temperature').innerText = climate.temperature + ' Grad' || 'n/a'
            document.getElementById('humidity').innerText = climate.humidity + '%' || 'n/a'

            // Update flap control section
            const text = `Die Hühnerklappe ist ${translate(flap.status)} und ${(flap.status == 'open') ? 'schließt' : 'öffnet'} um ${getTimeSchedule(config, flap.status)} Uhr automatisch.`
            document.getElementById('flapStatusInfo').innerText = text
            document.getElementById('flapControlBtn').innerText = (flap.status == 'open') ? 'Hühnerklappe jetzt schließen' : 'Hühnerklappe jetzt öffnen'
            document.getElementById('flapControlBtn').style.display = 'inline-block'

            // Return data
            resolve({ door: door.status, flap: flap.status, climate: climate })
        } catch (error) {
            reject(error)
        }
    })
}

/**
 * Main
 */
window.onload = async () => {

    try {

        // Get config data
        const config = await getConfig()
        //document.getElementById('configData').value = JSON.stringify(config)

        // Synchronizing with controller module and sensors
        const syncResult = await synchronize(config)

        // Reload page on click
        document.getElementById('refresh').addEventListener('click', () => location.reload())

        // Check if webcam server is available and start stream if so
        fetch(`http://${config.host}:${config.ports.webcam}/`, { mode: 'no-cors' })
            .then(() => {
                const webcam = document.getElementById('webcam')
                const stream = document.createElement('img')
                stream.src = `http://${config.host}:${config.ports.webcam}/stream.mjpg`
                webcam.innerHTML = '' // Clear HTML
                webcam.appendChild(stream)
            })
            .catch(error => {
                if (error.message.includes('Failed to fetch')) error.message = 'Der Webcam-Server ist nicht erreichbar.'
                $('#webcam').html('').next('div.alert').html(error.message).slideDown('slow')
            })

        // Open/close flap manually
        document.getElementById('flapControlBtn').addEventListener('click', async event => {
            event.preventDefault()

            event.target.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i> Bitte warten ...'
            event.target.disabled = true

            const flapCurrentStatus = await readGPIO('flap-sensor', [config.gpio.status.flap])
            
            // Throw error if current status of the flap was not readable
            if (!['open', 'closed'].includes(flapCurrentStatus.status)) throw new Error('Der aktuelle Status der Hühnerklappe konnte nicht erfasst werden. Reset nötig!')

            const setGpioPin = (flapCurrentStatus.status == 'open') ? config.gpio.control.close : config.gpio.control.open

            // Open/close the flap
            readGPIO('flap-controller', [setGpioPin])
                .then(data => {
                    if (!data.ok) throw new Error(`Die Steuerung der Hühnerklappe schlug aufgrund eines unbekannten Fehlers fehl (akt. Status: ${flapCurrentStatus}).`)

                    // Check flap status
                    const checkFlapStatus = setInterval(async () => {
                        const newFlapStatus = await readGPIO('flap-sensor', [config.gpio.status.flap])

                        if (newFlapStatus.status !== flapCurrentStatus.status) {
                            clearInterval(checkFlapStatus)
                            location.reload()
                        }
                    }, 5 * 1000) // check every 5 seconds
                })
                .catch(error => { throw new Error(error) })
            
        })

    } catch (error) {
        console.log(error)

        // Show error
        $('#errorMsg').find('.message').html(error)
        $('#errorMsg').slideDown('slow')
    }

}

/**
 * 
 */
window.addEventListener('beforeunload', event => {
    event.preventDefault()
    e.returnValue = ''
    confirm('Close?')
})