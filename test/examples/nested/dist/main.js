const nextPage = parseInt(window.location.pathname.split('/').pop()) + 1
const prevPage = nextPage - 2

document.getElementById('app').innerHTML =
    `
    <h1>HELLO</h1>
    <a href="/page/${prevPage.toString()}" id="prev-page" >prev (${prevPage})</a>
    <a href="/page/${nextPage.toString()}" id="next-page" >next (${nextPage})</a>
    `
