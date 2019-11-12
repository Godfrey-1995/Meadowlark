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

app.get('/headers', function (req, res) {
    let headers_content = '';
    for (let name in req.headers) {
        headers_content += name + ':' + req.headers[name] + '\n';
    }
    res.render('headers', {headers_content: headers_content});
});

app.get('/vacations', function (req, res) {
    Vacation.find({available: true}, function (err, vacations) {
        var context = {
            vacation: vacations.map(function (vacation) {
                return {
                    sku: vacation.sku,
                    name: vacation.name,
                    description: vacation.description,
                    price: vacation.getDisplayPrice(),
                    inSeason: vacation.inSeason,
                }
            })
        }
        res.render('vacations', context);
    })
});

app.post('/vacations', function (req, res) {
    Vacation.findOne({sku: req.body.purchaseSku}, function (err, vacation) {
        if(err || !vacation) {
            req.session.flash = {
                type: 'warning',
                intro: 'Ooops!',
                message: 'Something went wrong with your reservation; ' +
                    'please <a href="/contact">contact us</a>.',
            };
            return res.redirect(303, '/vacations');
        }
        vacation.packagesSold++;
        vacation.save();
        req.session.flash = {
            type: 'success',
            intro: 'Thank you!',
            message: 'Your vacation has been booked.',
        };
        res.redirect(303, '/vacations');
    })
});

app.get('/cart/add', function (req, res, next) {
    var cart = req.session.cart || (req.session.cart = { item: []})
    Vacation.findOne({sku: req.query.sku}, function (err, vacation) {
        if (err) return next(err);
        if (!vacation) return next(new Error('Unknown vacation SKU: ' + req.query.sku));
        cart.item.push({
            vacation: vacation,
            guests: req.body.guests || 1,
        });
        res.redirect(303, '/cart');
    })
});

app.post('/cart/add', function (req, res, next) {
    var cart = req.session.cart || (req.session.cart = { item: []})
    Vacation.findOne({sku: req.body.sku}, function (err, vacation) {
        if (err) return next(err);
        if (!vacation) return next(new Error('Unknown vacation SKU: ' + req.body.sku));
        cart.item.push({
            vacation: vacation,
            guests: req.body.guests || 1,
        });
        res.redirect(303, '/cart');
    })
});

app.get('/cart', function (req, res) {
    var cart = req.session.cart;
    if(!cart) next();
    res.render('cart', { cart: cart });
});

app.get('/notify-me-when-in-season', function (req, res, next) {
    res.render('notify-me-when-in-season', {sku: req.query.sku});
});

app.post('/notify-me-when-in-season', function (req, res, next) {
    VacationInSeasonListener.update(
        {email: req.body.email},
        {$push: { skus: req.body.sku }},
        {upsert: true}, 
        function (err) {
            if(err) {
                console.error(err.stack);
                req.session.flash = {
                    type: 'danger',
                    intro: 'Ooops!',
                    message: 'There was an error processing your request.',
                };
                return res.redirect(303, '/vacations');
            }
            req.session.flash = {
                type: 'success',
                intro: 'Thank you!',
                message: 'You will be notified when this vacation is in season.',
            };
            return res.redirect(303, '/vacations');
        });
});
// =============================>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

//定制首页
app.get('/', function (req, res) {
    res.render('home');
});

//定制关于页面
app.get('/about', function (req, res) {
    res.render('about', {fortune: fortune.getFortune()});
});

app.get('/jquerytest', function(req, res){
    res.render('jquerytest');
});

app.get('/nursery-rhyme', function(req, res){
    res.render('nursery-rhyme');
});

function NewsletterSignUp() {}
NewsletterSignUp.prototype.save = function(callback) {
    callback();
};

app.get('/newsletter', function(req, res){
    res.render('newsletter');
});

// 注册
app.post('/newsletter', function (req, res) {
    let name = req.body.name || '', email = req.body.email || '';
    if (name == '' || email == '') {
        if (req.xhr) return res.json({error: 'Invalid name email address.'});
        req.session.flash = {
            type: 'danger',
            intro: 'Validation error!',
            message: 'The email address you entered was not valid.',
        }
        res.redirect(303, '/newsletter/archive');
    }
    else {
        new NewsletterSignUp({name: name, email: email}).save(function (err) {
            if (err) {
                if (req.xhr) return res.json({ error: 'Database error.'});
                req.session.flash = {
                    type: 'danger',
                    intro: 'Database error!',
                    message: 'There was a database error; please try again later.',
                }
                res.redirect(303, '/newsletter/archive');
            }
            else {
                if (req.xhr) return res.json({ success: true});
                req.session.flash = {
                    type: 'success',
                    intro: 'Thank you!',
                    message: 'You have now been signed up for the newsletter.',
                }
                res.redirect(303, '/newsletter/archive');
            }
        })
    }
});

app.get('/newsletter/archive', function (req, res) {
    res.render('newsletter/archive');
});

// 表单
app.post('/process', function (req, res) {
    let form = req.query.form;
    let csrf = req.body._csrf;
    let name = req.body.name;
    let email = req.body.email;
    console.log('Form (from querystring): ' + form);
    console.log('CSRF token (from hidden form field): ' + csrf);
    console.log('Name (from visible form field): ' + name);
    console.log('Email (from visible form field): ' + email);
    if (req.xhr || req.accepts('json,html') === 'json') {
        res.json({success: true});
    }
    else {
        res.redirect(303, '/thank-you');
    }
});

// 文件上传模版
app.get('/contest/vacation-photo', function (req, res) {
    var now_date = new Date();
    res.render('contest/vacation-photo');
});

// 文件上传
app.post('/contest/vacation-photo/:year/:month',function (req, res) {
    let form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
        if(err) return res.redirect(303, '/error');
        console.log('received fields:');
        console.log(fields);
        console.log('received files:');
        console.log(files);
        res.redirect(303, '/thank-you');
    })
});

app.get('/thank-you', function (req, res) {
    res.render('thank-you');
});

app.get('/error', function (req, res) {
    res.render('error');
});


app.get('/data/nursery-rhyme', function(req, res){
    res.json({
        animal: 'squirrel',
        bodyPart: 'tail',
        adjective: 'bushy',
        noun: 'heck',
    });
});

// 邮件页面
app.get('/email', function (req, res) {
    res.render('emailTest');
});

// 发送邮件
app.post('/send-email', function (req, res) {
    let to = 'do123dixia@163.com';
    let subj = 'Hello';
    let text = 'This is a test email';
    email.send({to: to, subject:subj, text: text});
});

// 提供一个api
app.get('/api/tours', function (req, res) {
    // 拼接xml
    let products = tours.getTours();
    let toursXml = '<?xml version="1.0"?><tours>' +
        products.map(function (p) {
            return '<tour price="' + p.price +
                '" id="' + p.id + '">' + p.name + '</tour>';
        }).join('') + '</tours>';

    // 拼接文本
    let toursText = products.map(function(p){
        return p.id + ': ' + p.name + ' (' + p.price + ')';
    }).join('\n');

    res.format({
        'application/json': function(){
            res.json(tours);
        },
        'application/xml': function(){
            res.type('application/xml');
            res.send(toursXml);
        },
        'text/xml': function(){
            res.type('text/xml');
            res.send(toursXml);
        },
        'text/plain': function(){
            res.type('text/plain');
            res.send(toursText);
        }
    });
});

app.put('/api/tour/:id', function (req, res) {
    var p = tours.getTours().some(function(p){ return p.id == req.params.id });
    if (p) {
        if( req.query.name ) p.name = req.query.name;
        if( req.query.price ) p.price = req.query.price;
        res.json({success: true});
    } else {
        res.json({error: 'No such tour exists.'});
    }
});

app.delete('/api/tour/:id', function(req, res){
    var i;
    for( var i=tours.getTours().length-1; i>=0; i-- )
        if( tours[i].id == req.params.id ) break;
    if( i>=0 ) {
        tours.splice(i, 1);
        res.json({success: true});
    } else {
        res.json({error: 'No such tour exists.'});
    }
});

// 定制404界面
app.use(function (req, res) {
    res.status(404);
    res.render('404');
});

// 定制500界面
app.use(function (err, req, res, next) {
    console.error(err.stack);
    res.status(500);
    res.render('500');
});

app.listen(app.get('port'), function () {
    console.log('Express started in ' + app.get('env') + ' mode on http://127.0.0.1:' +
    app.get('port') + '; press Ctrl-C to terminate');
});