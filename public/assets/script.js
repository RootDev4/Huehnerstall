'use-strict'

window.onload = () => {

    // Reload page
    document.getElementById('refresh').addEventListener('click', () => location.reload())

    // Open/close trap
    document.getElementById('control').addEventListener('click', event => {
        switch (event.target.getAttribute('data-status')) {
            case 'open':
                alert('open')
            break

            case 'closed':
                alert('closed')
            break

            default:
                alert('Error')
        }
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