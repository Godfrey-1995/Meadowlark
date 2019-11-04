var express = require('express');
var app = express();
var handlebars = require('express3-handlebars')
    .create({defaultLayout: 'main'});
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

app.set('port', process.env.PORT || 8888);

// 测试
app.use(function (req, res, next) {
    let show_tests = app.get('env') !== 'production' && req.query.test === '1';
   res.locals.showTests = show_tests;
   next();
});

//访问静态资源
app.use(express.static(__dirname + '/public'));

//定制首页
app.get('/', function (req, res) {
    res.render('home');
});

let fortunes = [
    "Conquer your fears or they will conquer you.",
    "Rivers need springs.",
    "Do not fear what you don't know.",
    "You will have a pleasant surprise.",
    "Whenever possible, keep it simple."
];

//定制关于页面
app.get('/about', function (req, res) {
    let randmFortune = fortunes[Math.floor(Math.random() * fortunes.length)];
    res.render('about', {fortune: randmFortune});
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
    console.log('Express started on http://127.0.0.1:' +
    app.get('port') + '; press Ctrl-C to terminate');
});