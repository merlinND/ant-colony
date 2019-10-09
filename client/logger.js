
var div;

const init = function() {
    div = document.getElementById("logger-window")
}

const clear = function () {
    while (div.firstChild) {
        div.removeChild(div.firstChild);
    }
}

const print = function(msg, type) {
    type = type || "status";

    if (div.childElementCount >= 100) {
        div.removeChild(div.firstChild);
    }
    msgDiv = document.createElement("div");
    msgDiv.className += " " + type;
    msgDiv.innerHTML = msg;
    div.appendChild(msgDiv);

    let autoScroll = ( div.scrollHeight - (div.scrollTop+div.offsetHeight) < msgDiv.offsetHeight)
    if(autoScroll==true) {
        div.scrollTop = div.scrollHeight;
    }
}

const warn = function(msg) {
    return print(msg, "warn");
}

const error = function(msg) {
    return print(msg, "error");
}

module.exports = {
    init: init,
    clear: clear,
    print: print,
    warn: warn,
    error: error,
}
