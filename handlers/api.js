var tours = require('../lib/tours');

/*====================================================================================================*/
/**
 */
/*====================================================================================================*/
exports.GetTours = function (req, res) {
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
}

/*====================================================================================================*/
/**
 */
/*====================================================================================================*/
exports.UpdateTourById = function (req, res) {
    var p = tours.getTours().some(function(p){ return p.id == req.params.id });
    if (p) {
        if( req.query.name ) p.name = req.query.name;
        if( req.query.price ) p.price = req.query.price;
        res.json({success: true});
    } else {
        res.json({error: 'No such tour exists.'});
    }
}

/*====================================================================================================*/
/**
 */
/*====================================================================================================*/
exports.DeleteTourById = function (req, res) {
    var i;
    for( var i=tours.getTours().length-1; i>=0; i-- )
        if( tours[i].id == req.params.id ) break;
    if( i>=0 ) {
        tours.splice(i, 1);
        res.json({success: true});
    } else {
        res.json({error: 'No such tour exists.'});
    }
}