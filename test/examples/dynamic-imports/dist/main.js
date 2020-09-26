import('./file.js').then(res => {
    document.getElementById('app').innerHTML = `
    <h1>HELLO</h1>
    <div id="status">${res.default.status}</div>
`
    dispatchEvent(new CustomEvent('app-loaded'))
})