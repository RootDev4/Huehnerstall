'use-strict'

/**
 * 
 * @param {*} module 
 * @param {*} args 
 * @returns 
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
 * @param {*} status 
 * @returns 
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
 * 
 * @param {*} config 
 * @returns 
 */
const getTimeSchedule = config => {
    const status = config.hatchStatus
    const currentWeekday = new Date().toLocaleString('de', { weekday: 'short' })

    // Check if current weekday is at weekend
    if (['Sa', 'So'].includes(currentWeekday)) {
        return (status == 'open') ? config.schedule.weekend.close : config.schedule.weekend.open
    }

    return (status == 'open') ? config.schedule.week.close : config.schedule.week.open
}

/**
 * 
 * @returns 
 */
const getConfig = () => {
    return new Promise(async (resolve, reject) => {
        fetch('/get-config')
        .then(response => response.json())
        .then(data => {
            if (data.error) throw data.error
            resolve(data)
        })
        .catch(error => reject(error))
    })
}

/**
 * 
 * @param {*} data 
 * @returns 
 */
const setConfig = data => {
    return new Promise(async (resolve, reject) => {
        fetch('/set-config', {
            method: 'post',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
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
 * 
 * @param {*} config 
 * @returns 
 */
const synchronize = config => {
    return new Promise(async (resolve, reject) => {
        try {
            // Read modules connected with GPIO
            const door = await readGPIO('door-sensor', [config.gpio.status.door]).catch(error => { throw error })
            const hatch = await readGPIO('hatch-sensor', [config.gpio.status.hatch]).catch(error => { throw error })
            const climate = await readGPIO('climate-sensor', [config.gpio.climate]).catch(error => { throw error })

            // Update data
            document.getElementById('hatch').innerText = translate(hatch.status)
            document.getElementById('door').innerText = translate(door.status)
            document.getElementById('temperature').innerText = climate.temperature + ' Grad' || 'n/a'
            document.getElementById('humidity').innerText = climate.humidity + '%' || 'n/a'

            // Update hatch icon
            const hatchIconClass = (hatch.status == 'open') ? 'fa-house' : 'fa-house-lock'
            document.getElementById('hatchIcon').className = '' // Reset classlist
            document.getElementById('hatchIcon').classList.add('fa-solid', hatchIconClass, 'pe-2')

            // Update door icon
            const doorIconClass = (door.status == 'open') ? 'fa-door-open' : 'fa-door-closed'
            document.getElementById('doorIcon').className = '' // Reset classlist
            document.getElementById('doorIcon').classList.add('fa-solid', doorIconClass, 'pe-2')

            // Update hatch control section
            const controlHatchBtnClass = (hatch.status == 'open') ? 'btn-danger' : 'btn-success'
            const text = `Die Hühnerklappe ist ${translate(hatch.status)} und ${(hatch.status == 'open') ? 'schließt' : 'öffnet'} um ${getTimeSchedule(config)} Uhr automatisch.`
            document.getElementById('controlHatchInfo').innerText = text
            document.getElementById('controlHatchBtn').innerText = (hatch.status == 'open') ? 'Hühnerklappe jetzt schließen' : 'Hühnerklappe jetzt öffnen'
            document.getElementById('controlHatchBtn').className = '' // Reset classlist
            document.getElementById('controlHatchBtn').classList.add('btn', 'btn-sm', controlHatchBtnClass)
            document.getElementById('controlHatchBtn').setAttribute('data-status', hatch.status)
            document.getElementById('controlHatchBtn').disabled = false
            document.getElementById('manualOperationActive').style.display = (hatch.manually) ? 'block' : 'none'

            // If the hatch is currently travelling, update the control button
            console.log(config.hatchTravelling)
            if (config.hatchTravelling) {
                document.getElementById('controlHatchBtn').innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i> Bitte warten ...'
                document.getElementById('controlHatchBtn').disabled = true
            }

            resolve({ door: door.status, hatch: hatch.status, climate: climate })
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
        document.getElementById('configData').value = JSON.stringify(config)

        // Synchronizing with controller module and sensors
        const syncResult = await synchronize(config).catch(error => { throw error })

        // Reload page on click
        document.getElementById('refresh').addEventListener('click', () => location.reload())

        // Save config
        document.getElementById('configSave').addEventListener('click', async event => {
            event.preventDefault()

            const data = document.getElementById('configData').value
            
            if (data.length) {
                if (confirm('Dies überschreibt die aktuelle Konfiguration. Fortfahren?')) {
                    setConfig(JSON.parse(data)).then(() => location.reload()).catch(error => { throw error })
                }
            } else {
                alert('Das Konfigurationsdatenobjekt darf nicht leer sein.')
            }
        })

        // Open/close hatch manually
        document.getElementById('controlHatchBtn').addEventListener('click', async event => {
            event.preventDefault()

            event.target.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i> Bitte warten ...'
            event.target.disabled = true

            // Update config
            //await setConfig({ hatchTravelling: true })

            // Open/close the hatch
            if (config.hatchStatus == 'open') {
                readGPIO('hatch-controller', [config.gpio.control.close]) // Close hatch
                    .then(async data => {
                        if (!data.ok) throw new Error('Closing hatch failed due to an unknown error.')

                        //await setConfig({ hatchTravelling: false, hatchStatus: 'closed' })
                        setTimeout(() => { location.reload() }, 50 * 1000) // 50 seconds
                    })
                    .catch(error => { throw error })
            } else {
                readGPIO('hatch-controller', [config.gpio.control.open]) // Open hatch
                    .then(data => {
                        if (!data.ok) throw new Error('Opening hatch failed due to an unknown error.')

                        //await setConfig({ hatchTravelling: false, hatchStatus: 'open' })
                        setTimeout(() => { location.reload() }, 60 * 1000) // 60 seconds
                    })
                    .catch(error => { throw error })
            }
        })

    } catch (error) {
        console.log(error)

        document.querySelector('#errorMsg > div > span').innerText = error.message
        document.getElementById('errorMsg').classList.remove('d-none')
    }


}