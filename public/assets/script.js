'use strict'

/**
 * Show error message
 * @param {*} msg 
 * @returns 
 */
const showError = msg => $('div#errorMsg > span.message').html('<b>Fehler:</b> ' + msg).parent().slideDown()

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
 * 
 * @param {*} msec 
 * @returns 
 */
const reloadAfterPeriod = msec => setTimeout(() => location.reload(), msec)

/**
 * Main
 */
window.onload = async () => {

    // Get flap status
    fetch('/read-gpio/flap').then(response => response.json()).then(data => {
        if (!data.ok) throw new Error(data.error)
        document.getElementById('flap').innerText = translate(data.result.status)
        document.getElementById('flapControlBtn').classList.value = ''
        document.getElementById('flapControlBtn').classList.add('bi', (data.result.status === 'open') ? 'bi-lock' : 'bi-unlock')
        document.getElementById('flapControlBtn').title = (data.result.status === 'open') ? 'Hühnerklappe jetzt schließen' : 'Hühnerklappe jetzt öffnen'
    }).catch(error => document.getElementById('flap').innerHTML = `<a href="#" class="gpio-error" onclick="showError('${error}')">Fehler</a>`)
    
    // Get door status
    fetch('/read-gpio/door').then(response => response.json()).then(data => {
        if (!data.ok) throw new Error(data.error)
        document.getElementById('door').innerText = translate(data.result.status)
    }).catch(error => document.getElementById('door').innerHTML = `<a href="#" class="gpio-error" onclick="showError('${error}')">Fehler</a>`)

    // Get climate status
    fetch('/read-gpio/climate').then(response => response.json()).then(data => {
        if (!data.ok) throw new Error(data.error)
        document.getElementById('temperature').innerText = data.result.temperature + ' Grad' || 'n/a'
        document.getElementById('humidity').innerText = data.result.humidity + '%' || 'n/a'
    }).catch(error => {
        document.getElementById('temperature').innerHTML = `<a href="#" class="gpio-error" onclick="showError('${error}')">Fehler</a>`
        document.getElementById('humidity').innerHTML = `<a href="#" class="gpio-error" onclick="showError('${error}')">Fehler</a>`
    })

    // Take snapshot
    document.getElementById('takeSnapshot').addEventListener('click', async event => {
        event.preventDefault()

        fetch('/snapshot').then(response => response.json()).then(data => {
            if (!data.ok) throw new Error(data.error)

            const downloadLink = document.createElement('a')
            document.body.appendChild(downloadLink)
            downloadLink.href = data.snapshot
            downloadLink.target = '_self'
            downloadLink.download = data.filename
            downloadLink.click()
        }).catch(error => showError(error))
    })

    // Open/close flap manually
    document.getElementById('flapControlBtn').addEventListener('click', async event => {
        event.preventDefault()

        //
        Swal.fire({
            title: 'Passwort erforderlich',
            html: `<input type="password" id="password" class="swal2-input" placeholder="Passwort">`,
            confirmButtonText: 'senden',
            focusConfirm: false,
            showCancelButton: true,
            cancelButtonText: 'abbrechen',
            preConfirm: async () => {
                const password = Swal.getPopup().querySelector('#password').value || null
                if (!password) return Swal.showValidationMessage('Bitte das Passwort eingeben.')
                
                return fetch('/control', {
                    method: 'post',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ password })
                })
                .then(response => response.json())
                .then(data => data)
                .catch(error => error)
            }
        }).then(result => {
            if (result.isConfirmed) {
                Swal.fire(result.value.data || result.value.error)

                if (result.value.ok === true) {
                    document.getElementById('flap').innerHTML = '<div class="spinner-border spinner-border-sm" role="status"></div>'
                    document.getElementById('flapStatusInfo').innerHTML = result.value.data || ''
                    event.target.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i> Bitte warten ...'
                    event.target.disabled = true
                }

                reloadAfterPeriod(60 * 1000)
            }
        })
    })

    // Reload app
    document.getElementById('refresh').addEventListener('click', () => location.reload())

}