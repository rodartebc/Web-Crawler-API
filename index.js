const express = require('express');
const bodyParser = require('body-parser');

// create express app
const app = express();

// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: true}));

// parse requests of content-type - application/json
app.use(bodyParser.json());

// require routes
require('./app/routes/crawler.routes.js')(app);

// listen
const server = app.listen(8080, () => {
    const host = server.address().adress;
    const port = server.address().port;

    console.log('App listening at http://' + 'localhost' + ':' + port);
});