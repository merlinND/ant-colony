const $ = require('jquery');
require('bootstrap');

const CodeMirror = require("codemirror");
require("codemirror/mode/javascript/javascript");
var CodeMirrorPersist = require("codemirror-persist")
CodeMirrorPersist(CodeMirror)


const sideScrollerPlayground = require("./sideScrollerPlayground.js")
const topDownPlayground = require("./topDownPlayground.js")

const executeUserCode = function(user_code, editor) {
    clearCodeErrors(editor);
    try {
        eval(user_code);
    } catch (e) {
        showCodeError(editor, e);
    }
};

const clearCodeErrors = function(editor) {
    if (!editor.widgets)
        return;

    for (var i = 0; i < editor.widgets.length; ++i) {
        editor.removeLineWidget(editor.widgets[i]);
    }
    editor.widgets.length = 0;
}

const showCodeError = function(editor, exception) {
    if (!editor.widgets)
        editor.widgets = []

    // Find offending line in user code
    // TODO: make this more robust and work cross-browser
    const message = exception.message;
    const lineRegex = /eval .+ <anonymous>:(\d+)/;
    var exceptionLine;
    try {
        var matches = exception.stack.match(lineRegex);
        if (matches.length > 1) {
            exceptionLine = parseInt(matches[1]);
        } else {
            exceptionLine = 0;
        }
    } catch (e) {
        exceptionLine = 0;
    }

    console.log('Code error at line ' + exceptionLine + ': ' + message);

    editor.operation(function(){
        if (!exception) return;

        var msg = document.createElement("div");
        var icon = msg.appendChild(document.createElement("span"));
        icon.innerHTML = "Error: ";
        icon.className = "code-error-icon";
        msg.appendChild(document.createTextNode(message));
        msg.className = "code-error text-danger";

        var widget = editor.addLineWidget(exceptionLine - 1, msg, {
            coverGutter: false, noHScroll: true
        });
        editor.widgets.push(widget);
    });

    // TODO: consider scrolling to first error
    // var info = editor.getScrollInfo();
    // var after = editor.charCoords({line: editor.getCursor().line + 1, ch: 0}, "local").top;
    // if (info.top + info.clientHeight < after)
    //   editor.scrollTo(null, after - info.clientHeight + 3);
}




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

    // For debugging
    window.code_editor = editor;

    // Initialize game engine
    // TODO: Refactor actual game away from "playground" file.
    var gameContainer = container.find(".game-view");
    var game = topDownPlayground.init(gameContainer);

    $('button[name="play"]').on('click', function() {
        const userCode = editor.getValue();
        game.setUserCode(userCode);
    })
    gameContainer.on('click', function() {
        game.input.enabled = true;
    });
    gameContainer.on('mouseenter', function() {
        game.input.enabled = true;
    });
    gameContainer.on('mouseleave', function() {
        game.input.enabled = false;

    });
    game.input.enabled = false;

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

