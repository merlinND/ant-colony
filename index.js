const express = require('express')
const exphbs  = require('express-handlebars');

// ----- Configuration
const app = express()
const port = 3000

app.engine('.hbs', exphbs({
    extname: 'hbs',
}));
app.set('view engine', '.hbs');


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
app.get('/playground', (req, res) => {
    res.render('playground', { })
})


app.listen(port, () => console.log(`Ant Colony server listening on port ${port}!`))
