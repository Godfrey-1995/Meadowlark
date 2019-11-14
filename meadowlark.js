var logcat = console.log;
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var fortune = require('./lib/fortune.js');
var formidable = require('formidable');
var credentials = require('./credentials');
var email = require('./lib/email');
var tours = require('./lib/tours');
var VacationInSeasonListener = require('./models/vacationInSeasonListener');

var routes = require('./routes');

// 连接数据库
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/meadowlark_db', { useNewUrlParser: true, useUnifiedTopology: true }, (err, res)=>{
    if (err) return console.log(err);
});
var Vacation = require('./models/vacation.js');

Vacation.find(function(err, vacations){
    if(vacations.length) return;
    new Vacation({
        name: 'Hood River Day Trip',
        slug: 'hood-river-day-trip',
        category: 'Day Trip',
        sku: 'HR199',
        description: 'Spend a day sailing on the Columbia and ' +
            'enjoying craft beers in Hood River!',
        priceInCents: 9995,
        tags: ['day trip', 'hood river', 'sailing', 'windsurfing', 'breweries'],
        inSeason: true,
        maximumGuests: 16,
        available: true,
        packagesSold: 0,
    }).save();
    new Vacation({
        name: 'Oregon Coast Getaway',
        slug: 'oregon-coast-getaway',
        category: 'Weekend Getaway',
        sku: 'OC39',
        description: 'Enjoy the ocean air and quaint coastal towns!',
        priceInCents: 269995,
        tags: ['weekend getaway', 'oregon coast', 'beachcombing'],
        inSeason: false,
        maximumGuests: 8,
        available: true,
        packagesSold: 0,
}).save();
    new Vacation({
        name: 'Rock Climbing in Bend',
        slug: 'rock-climbing-in-bend',
        category: 'Adventure',
        sku: 'B99',
        description: 'Experience the thrill of climbing in the high desert.',
        priceInCents: 289995,
        tags: ['weekend getaway', 'bend', 'high desert', 'rock climbing'],
        inSeason: true,
        requiresWaiver: true,
        maximumGuests: 4,
        available: false,
        packagesSold: 0,
        notes: 'The tour guide is currently recovering from a skiing accident.',
    }).save();
});

var handlebars = require('express3-handlebars')
    .create({defaultLayout: 'main',
        helpers: {
            section: function(name, options){
                if(!this._sections) this._sections = {};
                this._sections[name] = options.fn(this);
                return null;
            }
        }});
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

app.set('port', process.env.PORT || 8888);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(require('cookie-parser')(credentials.cookieSecret));
app.use(require('express-session')({
    resave: false,
    saveUninitialized: false,
    secret: credentials.cookieSecret,
}));



// 测试
app.use(function (req, res, next) {
    let show_tests = app.get('env') !== 'production' && req.query.test === '1';
   res.locals.showTests = show_tests;
   next();
});

//访问静态资源
app.use(express.static(__dirname + '/public'));

app.use(function (req, res, next) {
    res.locals.flash = req.session.flash;
    delete req.session.flash;
    next();
});

routes(app);

app.listen(app.get('port'), function () {
    console.log('Express started in ' + app.get('env') + ' mode on http://127.0.0.1:' +
    app.get('port') + '; press Ctrl-C to terminate');
});