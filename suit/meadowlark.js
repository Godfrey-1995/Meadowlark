var express = require('express');
var app = express();
var handlebars = require('express3-handlebars')
    .create({defaultLayout: 'main'});
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

app.set('port', process.env.PORT || 8888);

//访问静态资源
app.use(express.static(__dirname + '/public'));

//定制首页
app.get('/', function (req, res) {
    // res.type('text/plain');
    // res.send('Meadowlark Travel');
    res.render('home');
});

//定制关于页面
app.get('/about', function (req, res) {
    // res.type('text/plain');
    // res.send('About Meadowlark Travel');
    res.render('about')
});

// 定制404界面
app.use(function (req, res) {
    // res.type('text/plain');
    res.status(404);
    // res.send('404 - Not found');
    res.render('404');
});

// 定制500界面
app.use(function (err, req, res, next) {
    console.error(err.stack);
    // res.type('text/plain');
    res.status(500);
    // res.send('500 - Server Error');
    res.render('500');
});

app.listen(app.get('port'), function () {
    console.log('Express started on http://127.0.0.1:' +
    app.get('port') + '; press Ctrl-C to terminate');
});