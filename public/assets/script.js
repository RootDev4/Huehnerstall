'use-strict'

/**
 * Data synchronization with server
 */
const sync = () => {
    fetch('/update', { method: 'post'})
        .then(res => res.json())
        .then(data => {
            console.log(data)

            // Update status data
            document.getElementById('trap').innerText = (data.trap === 'open') ? 'geöffnet' : 'geschlossen'
            document.getElementById('door').innerText = (data.door === 'open') ? 'geöffnet' : 'geschlossen'
            document.getElementById('temperature').innerText = data.temperature  || 'n/a'
            document.getElementById('humidity').innerText = data.humidity || 'n/a'

            // Update trap icon
            const trapIconClass = (data.trap === 'open') ? 'fa-house' : 'fa-house-lock'
            document.getElementById('trapIcon').className = '' // Reset classlist
            document.getElementById('trapIcon').classList.add('fa-solid', trapIconClass, 'pe-2')

            // Update door icon
            const doorIconClass = (data.door === 'open') ? 'fa-door-open' : 'fa-door-closed'
            document.getElementById('doorIcon').className = '' // Reset classlist
            document.getElementById('doorIcon').classList.add('fa-solid', doorIconClass, 'pe-2')

            // Update control button
            const controlBtnClass = (data.trap === 'open') ? 'btn-danger' : 'btn-success'
            document.getElementById('controlBtn').innerText = (data.trap === 'open') ? 'Hühnerklappe jetzt schließen' : 'Hühnerklappe jetzt öffnen'
            document.getElementById('controlBtn').className = '' // Reset classlist
            document.getElementById('controlBtn').classList.add('btn', 'btn-sm', controlBtnClass)
            document.getElementById('controlBtn').setAttribute('data-status', data.trap)

            // Update control information
            const text = `Die Hühnerklappe ist ${(data.trap === 'open') ? 'geöffnet' : 'geschlossen'} und ${(data.trap === 'open') ? 'schließt' : 'öffnet'} um ${(data.trap === 'open') ? data.schedule.close : data.schedule.open} Uhr automatisch.`
            document.getElementById('trapControlInfo').innerText = text
        })
        .catch(error => {
            alert('Error while data synchronization with server.')
            console.log(error)
        })
}

/**
 * Main
 */
window.onload = () => {

    // Update data
    sync()

    // Reload page on click
    document.getElementById('refresh').addEventListener('click', () => location.reload())

    // Open/close trap manually
    document.getElementById('controlBtn').addEventListener('click', event => {
        fetch('/control', {
            method: 'post',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: event.target.getAttribute('data-status') })
        })
        .then(res => res.json())
        .then(data => {
            sync()
            console.log(data)
        })
        .catch(err => console.log(err))
    })

    // Take snapshot
    const btn1 = document.getElementById('snap')
    if (btn1) {
        btn1.addEventListener('click', () => {
            fetch('/snap', { method: 'post'})
            .then(res => res.json())
            .then(data => console.log(data))
            .catch(err => console.log(err))
        })
    }

}