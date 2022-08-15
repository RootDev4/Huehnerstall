'use strict'

/**
 * Show error message
 * @param {*} msg 
 * @returns 
 */
const showError = msg => $('div#errorMsg > span.message').html(msg).parent().slideDown()

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
    const currentWeekday = new Date().toLocaleString('de', { weekday: 'short' })

    // Check if current weekday is at weekend
    if (['Sa', 'So'].includes(currentWeekday)) {
        return (status == 'open') ? config.weekend.close : config.weekend.open
    } else {
        return (status == 'open') ? config.weekday.close : config.weekday.open
    }
}

/**
 * Main
 */
window.onload = async () => {

    // Get sensor data
    fetch('/read-gpio', { method: 'post', headers: { 'Content-Type': 'application/json' }})
    .then(response => response.json())
    .then(data => {
        if (data.ok === true) {

            // Get door status
            if (data.gpioDoorSensor.ok === true) {
                const door = JSON.parse(data.gpioDoorSensor.data)
                document.getElementById('door').innerText = translate(door.status)
            } else {
                document.getElementById('door').innerHTML = `<a href="#" class="gpio-error" onclick="alert('${data.gpioDoorSensor.error}')">Fehler</a>`
            }

            // Get flap status
            if (data.gpioFlapSensor.ok === true) {
                const flap = JSON.parse(data.gpioFlapSensor.data)
                document.getElementById('flap').innerText = translate(flap.status)

                // Update flap control section
                const text = `Die Hühnerklappe ist ${translate(flap.status)} und ${(flap.status == 'open') ? 'schließt' : 'öffnet'} um ${getTimeSchedule(data.gpioFlapSensor.schedule, flap.status)} Uhr automatisch.`
                document.getElementById('flapStatusInfo').innerText = text
                document.getElementById('flapControlBtn').innerText = (flap.status == 'open') ? 'Hühnerklappe jetzt schließen' : 'Hühnerklappe jetzt öffnen'
                document.getElementById('flapControlBtn').style.display = 'inline-block'
            } else {
                document.getElementById('flap').innerHTML = `<a href="#" class="gpio-error" onclick="alert('${data.gpioFlapSensor.error}')">Fehler</a>`
            }

            // Get temperature & humidity
            if (data.gpioClimateSensor.ok === true) {
                const climate = JSON.parse(data.gpioClimateSensor.data)
                document.getElementById('temperature').innerText = climate.temperature + ' Grad' || 'n/a'
                document.getElementById('humidity').innerText = climate.humidity + '%' || 'n/a'
            } else {
                document.getElementById('temperature').innerHTML = `<a href="#" class="gpio-error" onclick="alert('${data.gpioClimateSensor.error}')">Fehler</a>`
                document.getElementById('humidity').innerHTML = `<a href="#" class="gpio-error" onclick="alert('${data.gpioClimateSensor.error}')">Fehler</a>`
            }
        } else {
            if (data.error) {
                showError(`Folgender Fehler ist beim Abfragen der GPIO-Schnittstelle aufgetreten:<br>${data.error}`)
            } else {
                showError('Ein unbekannter Fehler ist beim Abfragen der GPIO-Schnittstelle aufgetreten.')
            }
        }
    })
    .catch(error => showError(error))

    // Open/close flap manually
    document.getElementById('flapControlBtn').addEventListener('click', async event => {
        event.preventDefault()

        event.target.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i> Bitte warten ...'
        event.target.disabled = true

        //
        Swal.fire({
            title: 'Passwort',
            html: `<input type="password" id="password" class="swal2-input" placeholder="Passwort">`,
            confirmButtonText: 'senden',
            focusConfirm: false,
            showCancelButton: true,
            cancelButtonText: 'abbrechen',
            preConfirm: () => {
                const password = Swal.getPopup().querySelector('#password').value
                if (!password) Swal.showValidationMessage('Bitte das Passwort eingeben.')
                
                // fetch
                return { password: password }
            }
        }).then((result) => {
            Swal.fire(`
    Password: ${result.value.password}
  `.trim())
        })
    })

}