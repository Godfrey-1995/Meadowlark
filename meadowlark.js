var express = require('express');
var app = express();
var fortune = require('./lib/fortune.js');
var tours = require('./lib/tours');
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

app.get('/headers', function (req, res) {
    let headers_content = '';
    for (let name in req.headers) {
        headers_content += name + ':' + req.headers[name] + '\n';
    }
    res.render('headers', {headers_content: headers_content});
});

//定制首页
app.get('/', function (req, res) {
    res.render('home');
});

//定制关于页面
app.get('/about', function (req, res) {
    res.render('about', {fortune: fortune.getFortune()});
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
    if( p ) {
        if( req.query.name ) p.name = req.query.name;
        if( req.query.price ) p.price = req.query.price;
        res.json({success: true});
    } else {
        res.json({error: 'No such tour exists.'});
    }
});

// app.del('/api/tour/:id', function(req, res){
//     var i;
//     for( var i=tours.getTours().length-1; i>=0; i-- )
//         if( tours[i].id == req.params.id ) break;
//     if( i>=0 ) {
//         tours.splice(i, 1);
//         res.json({success: true});
//     } else {
//         res.json({error: 'No such tour exists.'});
//     }
// });

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