'use strict'

window.onload = async () => {

    fetch('/read-gpio', { method: 'post', headers: { 'Content-Type': 'application/json' }})
    .then(response => response.json())
    .then(data => console.log(data))
    .catch(error => console.log(error))

}