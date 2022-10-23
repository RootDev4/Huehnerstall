'use strict'

/**
 * Show error message
 * @param {*} msg 
 * @returns 
 */
const showError = msg => $('div#errorMsg > span.message').html('<b>Fehler:</b> ' + msg).parent().slideDown()

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