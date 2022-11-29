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
 * 
 * @param {*} buffer 
 * @returns 
 */
const bufferToBase64 = buffer => {
    const bytes = new Uint8Array(buffer)
    let binary = ''
    for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i])
    return `data:image/png;base64,${window.btoa(binary)}`
}

/**
 * Main
 */
window.onload = async () => {
    const socket = io()
    const image = document.getElementById('webstream')

    socket.on('stream', data => image.src = bufferToBase64(data))

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

    // Open webstream in fullscreen
    document.getElementById('fullscreen').addEventListener('click', event => {
        event.preventDefault()

        Swal.fire({
            html: `<img src="/webcam" style="transform: scale(-1, -1); width: 100%;">`,
            showConfirmButton: false,
            showCancelButton: true,
            cancelButtonText: 'schließen',
            width: 'auto'
        })
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

                reloadAfterPeriod(70 * 1000) // 70sec
            }
        })
    })

    // Reload app
    document.getElementById('refresh').addEventListener('click', event => {
        event.target.classList.add('spinner')
        setTimeout(() => location.reload(), 3000)
    })

}