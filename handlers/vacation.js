var Vacation = require('../models/vacation.js');
var VacationInSeasonListener = require('../models/vacationInSeasonListener');

/*====================================================================================================*/
/**
 */
/*====================================================================================================*/
exports.GetVacations = function (req, res) {
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
}

/*====================================================================================================*/
/**
 */
/*====================================================================================================*/
exports.PostVacations = function (req, res) {
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
}

/*====================================================================================================*/
/**
 */
/*====================================================================================================*/
exports.GetNotifyMeInSeason = function (req, res) {
    res.render('notify-me-when-in-season', {sku: req.query.sku});
}

/*====================================================================================================*/
/**
 */
/*====================================================================================================*/
exports.PostNotifyMeInSeason = function (req, res) {
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
}

exports.GetNurseryRhyme = function(req, res){
    res.render('nursery-rhyme');
}