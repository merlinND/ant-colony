const express = require('express')
const exphbs  = require('express-handlebars');
const i18n    = require('i18n');
const markdownHelper = require('helper-markdown');

// ----- Configuration
const app = express()
const port = 3000

// Internationalization
i18n.configure({
    locales: ['en','fr'],
    cookie: 'locale',
    directory: __dirname + '/locales',
    defaultLocale: 'fr',
});

app.engine('.hbs', exphbs({
    extname: 'hbs',
    helpers: {
        i18n: function() {
            return i18n.__.apply(this,arguments);
        },
        __n: function() {
            return i18n.__n.apply(this, arguments);
        },
        markdown: markdownHelper,
    },
}));
app.set('view engine', '.hbs');
app.use(i18n.init);

// ----- Static files
app.use(express.static('static'))
// Static files included in NPM modules
app.use('/js', express.static(__dirname + '/node_modules/bootstrap/dist/js'));
app.use('/js', express.static(__dirname + '/node_modules/jquery/dist'));
app.use('/js', express.static(__dirname + '/node_modules/phaser/dist'));
app.use('/css', express.static(__dirname + '/node_modules/bootstrap/dist/css'));
app.use('/css', express.static(__dirname + '/node_modules/codemirror/lib'));
app.use('/css', express.static(__dirname + '/node_modules/codemirror/theme'));

// ----- Routes
app.get('/', (req, res) => {
    res.render('index', { })
})
app.get('/top-down-playground', (req, res) => {
    res.render('playground', { containerId: 'top-down-playground' })
})
app.get('/side-scroller-playground', (req, res) => {
    res.render('playground', { containerId: 'side-scroller-playground' })
})


app.listen(port, () => console.log(`Ant Colony server listening on port ${port}!`))
