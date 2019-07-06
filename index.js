const express = require('express')
const exphbs  = require('express-handlebars');

const app = express()
const port = 3000


app.engine('.hbs', exphbs({
    extname: 'hbs',
}));
app.set('view engine', '.hbs');

app.use(express.static('static'))

app.get('/', (req, res) => {
    res.render('index', { name:'John' })
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))
