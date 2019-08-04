const $ = require('jquery');
require('bootstrap');

const CodeMirror = require("codemirror");
require("codemirror/mode/javascript/javascript");
var CodeMirrorPersist = require("codemirror-persist")
CodeMirrorPersist(CodeMirror)


const sideScrollerPlayground = require("./sideScrollerPlayground.js")
const topDownPlayground = require("./topDownPlayground.js")


const initAntsApp = function(container) {
    console.log('Initializing ants app (editor + game)');
    var editorTarget = container.find(".code-editor textarea")[0];
    var editor = CodeMirror.fromTextArea(editorTarget, {
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
        persist: true // enable buffer persistence
    });

    $('button[name="play"]').on('click', function() {
        console.log(editor.getValue());
    })


    // TODO: initialize game engine

    return editor;
}


$(function() {
    $('.instructions button[name="begin"]').on('click', function() {
        $('#nav-editor-tab').tab('show');
    })


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

