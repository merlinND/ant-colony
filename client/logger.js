
var div;

const init = function() {
    div = document.getElementById("logger-window")
}

const print = function(msg) {
    if (div.childElementCount >= 100) {
        div.removeChild(div.firstChild);
    }
    msgDiv = document.createElement("div");
    msgDiv.innerHTML = msg;
    div.appendChild(msgDiv);

    let autoScroll = ( div.scrollHeight - (div.scrollTop+div.offsetHeight) < msgDiv.offsetHeight)
    if(autoScroll==true) {
        div.scrollTop = div.scrollHeight;    
    }
    
}

module.exports = {
    init: init,
    print:print,
}