var Vacation = require('../models/vacation.js');

/*====================================================================================================*/
/**
 */
/*====================================================================================================*/
exports.GetCart = function (req, res, next) {
    var cart = req.session.cart;
    if(!cart) return next();
    res.render('cart', { cart: cart });
}

exports.GetAddCart = function (req, res) {
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
}

exports.PostAddCart = function (req, res) {
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
}