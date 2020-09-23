const nextPage = parseInt(window.location.pathname.split('/').pop()) + 1
const prevPage = nextPage - 2

document.getElementById('app').innerHTML =
    `
    <a href="/local" >local</a>
    <a href="http://spank.test/local-full" >local full</a>
    <a href="http://forign.com/foreign" >foreign</a>
    `
