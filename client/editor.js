const logger = require("./logger.js");

module.exports.clearCodeErrors = function(editor) {
    if (!editor.widgets)
        return;

    for (var i = 0; i < editor.widgets.length; ++i) {
        editor.removeLineWidget(editor.widgets[i]);
    }
    editor.widgets.length = 0;
};

module.exports.showCodeError = function(editor, exception) {
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
            // Fudge factor to account for some wrapping
            exceptionLine = parseInt(matches[1]) - 2;
        } else {
            exceptionLine = 0;
        }
    } catch (e) {
        exceptionLine = 0;
    }

    str = 'Code error at line ' + exceptionLine + ': ' + message;
    console.log(str);
    console.error(exception);
    logger.error(str);

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
};
