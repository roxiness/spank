document.getElementById('app').innerHTML = 
`
    <h1>HELLO</h1>
    <div id="location">${window.location.href}</div>
    <a href="/relative-link">relative link</a>
    
    <a href="http://spank.test">local link to root</a>
    <a href="http://spank.test/local-link">local link</a>
    <a href="//spank.test/local-link2">local link2</a>
    <a href="./relative-vanilla">relative vanilla</a>

    <a href="mailto:example@email.com">mail link</a>
    
    <a href="http://foreign.com">foreign link</a>
    <a href="http://foreign.com/foo">foreign link2</a>
    <a href="https://foreign.com">foreign link</a>
    <a href="https://foreign.com/foo">foreign link2</a>
    <a href="//foreign.com">foreign link</a>
    <a href="//foreign.com/foo">foreign link2</a>
    
`
