document.getElementById('app').innerHTML =
    `
    <a href="/local" >local</a>
    `
    dispatchEvent(new CustomEvent('app-loaded'))