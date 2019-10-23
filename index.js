const express = require('express')
const exphbs  = require('express-handlebars');
const i18n    = require('i18n');
const markdownHelper = require('helper-markdown');

// ----- Configuration
const app = express()
const port = process.env.PORT || 3000

// Internationalization
i18n.configure({
    locales: ['en','fr'],
    cookie: 'locale',
    directory: __dirname + '/locales',
    defaultLocale: 'fr',
    updateFiles: false,
    objectNotation: true,
    // TODO: what is this used for?
    indent: "\t",
});

app.engine('.hbs', exphbs({
    extname: 'hbs',
    helpers: {
        i18n: function() {
            if (!arguments[0]) {
                console.error(arguments);
                return;
            }
            var res = i18n.__.apply(this, arguments);
            var arry = [].concat(res);
            return arry.join('\n');
        },
        // i18nVar: function() {
        //     console.log(arguments);
        //     return i18n.__.apply(this, arguments);
        // },
        __n: function() {
            return i18n.__n.apply(this, arguments);
        },
        markdown: markdownHelper,
        join: function(val, delimiter, start, end) {
            var arry = [].concat(val);
            delimiter = ( typeof delimiter == "string" ? delimiter : ',' );
            start = start || 0;
            end = ( end === undefined ? arry.length : end );
            return arry.slice(start, end).join(delimiter);
        }
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
app.use('/favicon.png', express.static(__dirname + '/static/images/favicon.png'));
app.use('/favicon.ico', express.static(__dirname + '/static/images/favicon.ico'));

const availableLevels = {
    'direction': 'DirectionOfFood',
    'distance': 'DistanceToFood',
    'edible': 'IsFoodEdible',
    'closest': 'ChooseClosestFood',
    'foraging': 'Foraging',
}
const nextLevel = {
    'direction': 'distance',
    'distance': 'edible',
    'edible': 'closest',
    'closest': 'foraging',
    'foraging': 'direction',
}

// ----- Routes
app.get('/', (req, res) => {
    res.redirect('/levels/direction');
})
app.get('/levels', (req, res) => {
    res.redirect('/levels/direction');
})

app.get('/levels/:level', (req, res) => {
    if (!Object.keys(availableLevels).includes(req.params.level)) {
        res.status(404).send('Unknown level name.');
        return;
    }

    const levelName = availableLevels[req.params.level];
    res.render('index', {
        'level': levelName,
        'levelStarterCode': levelName + ".starter_code",
        'levelInstructions': levelName + ".instructions",
        'nextLevel': '/levels/' + nextLevel[req.params.level],
    });
})

app.get('/top-down-playground', (req, res) => {
    res.render('playground', { containerId: 'top-down-playground' });
})
app.get('/side-scroller-playground', (req, res) => {
    res.render('playground', { containerId: 'side-scroller-playground' });
})


app.listen(port, () => console.log(`Ant Colony server listening on port ${port}!`))
