const $ = require('jquery');
const codemirror = require("codemirror");
const codemirror_js = require("codemirror/mode/javascript/javascript");

const sideScrollerPlayground = require("./sideScrollerPlayground.js")
const topDownPlayground = require("./topDownPlayground.js")

const initAntsApp = function(container) {
    console.log('Initializing ants app (editor + game)');
    var editorTarget = container.find(".code-editor textarea")[0];
    var editor = codemirror.fromTextArea(editorTarget, {
        mode: "javascript",
        lineWrapping: false,
        // extraKeys: {
        //     'Ctrl-Space': 'autocomplete',
        //     'Ctrl-S': fn_saveScript
        // },
        lineNumbers: true,
        theme: 'base16-light', // 'monokai',
        value: "",
        indentUnit: 4,
    });

    // TODO: initialize game engine

    return editor;
}


$(function() {

    var container = $('#ants-app');
    if (container.length) {
        initAntsApp(container);
        return;
    }

    container = $('#side-scroller-playground');
    if (container.length) {
        sideScrollerPlayground.init(container);
        return;
    }

    container = $('#top-down-playground');
    if (container.length) {
        topDownPlayground.init(container);
        return;
    }

    console.error('Could not detect page type.')
})

