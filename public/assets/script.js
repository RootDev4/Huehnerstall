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
        .then(data => resolve(data))
        .catch(error => reject(error))
    })
}

/**
 * 
 * @param {String} status 
 * @returns {Boolean}
 */
const isOpen = status => (status == 'open') ? true : false

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
 * @param {*} status 
 * @returns 
 */
const getTimeSchedule = status => {
    return (status == 'open') ? '21:00' : '05:30' // TO-DO
}

/**
 * 
 * @returns 
 */
const controlHatch = () => {
    return new Promise(async (resolve, reject) => {
        try {
            const hatch = await readGPIO('hatch-sensor', [16]) // GPIO.BCM 16
            console.log(hatch)

            resolve()
        } catch (error) {
            reject(error)
        }
    })
}

/**
 * 
 * @returns 
 */
const update = () => {
    return new Promise(async (resolve, reject) => {
        try {
            // Read modules connected with GPIO
            const door = await readGPIO('door-sensor', [26]).catch(error => { throw error }) // GPIO.BCM 26
            const hatch = await readGPIO('hatch-sensor', [16]).catch(error => { throw error }) // GPIO.BCM 16
            const climate = await readGPIO('climate-sensor', [4]).catch(error => { throw error }) // GPIO.BCM 4

            console.log('Hatch', hatch)

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
            const text = `Die Hühnerklappe ist ${translate(hatch.status)} und ${(hatch.status == 'open') ? 'schließt' : 'öffnet'} um ${getTimeSchedule(hatch.status)} Uhr automatisch.`
            document.getElementById('controlHatchInfo').innerText = text
            document.getElementById('controlHatchBtn').innerText = (hatch.status == 'open') ? 'Hühnerklappe jetzt schließen' : 'Hühnerklappe jetzt öffnen'
            document.getElementById('controlHatchBtn').className = '' // Reset classlist
            document.getElementById('controlHatchBtn').classList.add('btn', 'btn-sm', controlHatchBtnClass)
            document.getElementById('controlHatchBtn').setAttribute('data-status', hatch.status)

            resolve()
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

        throw new Error('Foobar')

        // Update live data
        await update().catch(error => { throw error })

        // Reload page on click
        document.getElementById('refresh').addEventListener('click', () => location.reload())

        // Open/close hatch manually
        document.getElementById('controlHatchBtn').addEventListener('click', async event => {
            event.preventDefault()
            
            if (event.target.getAttribute('data-status') == 'open') {
                readGPIO('hatch-controller', [21]) // GPIO.BCM 21 => close
                .then(async data => {
                    console.log(data)
                    await update().catch(error => { throw error })
                })
                .catch(error => { throw error })
            } else {
                console.log(1)
                readGPIO('hatch-controller', [20]) // GPIO.BCM 20 => open
                .then(async data => {
                    console.log(data)
                    await update().catch(error => { throw error })
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