var main = require('./handlers/main');
var newsletter = require('./handlers/newsletter');
var test = require('./handlers/test');
var email = require('./handlers/email');
var cart = require('./handlers/cart');
var vacation = require('./handlers/vacation');
var api = require('./handlers/api');
var extensions = require('./handlers/extensions');
var error = require('./handlers/error');

module.exports = function (app) {

    /*====================================================================================================*/
    /**
     * main
     */
    /*====================================================================================================*/
    app.get('/', main.Home);
    app.get('/headers', main.Headers);
    app.get('/about', main.About);
    app.get('/thank-you', main.ThankYou);

    /*====================================================================================================*/
    /**
     * newsletter
     */
    /*====================================================================================================*/
    app.get('/newsletter', newsletter.GetNewsLetter);
    app.post('/newsletter', newsletter.PostNewsLetter);
    app.get('/newsletter/archive', newsletter.Archive);

    /*====================================================================================================*/
    /**
     * test
     */
    /*====================================================================================================*/
    app.get('/jquerytest', test.JqueryTest);

    /*====================================================================================================*/
    /**
     * email
     */
    /*====================================================================================================*/
    app.get('/email', email.GetEmail);
    app.post('/send-email', email.SendEmail);

    /*====================================================================================================*/
    /**
     * cart
     */
    /*====================================================================================================*/
    app.get('/cart', cart.GetCart);
    app.get('/cart/add', cart.GetAddCart);
    app.post('/cart/add', cart.PostAddCart);

    /*====================================================================================================*/
    /**
     * vacation
     */
    /*====================================================================================================*/
    app.get('/vacations', vacation.GetVacations);
    app.post('/vacations', vacation.PostVacations);
    app.get('/notify-me-when-in-season', vacation.GetNotifyMeInSeason);
    app.post('/notify-me-when-in-season', vacation.PostNotifyMeInSeason);
    app.get('/nursery-rhyme', vacation.GetNurseryRhyme);

    /*====================================================================================================*/
    /**
     * api
     */
    /*====================================================================================================*/
    app.get('/api/tours', api.GetTours);
    app.put('/api/tour/:id', api.UpdateTourById);
    app.delete('/api/tour/:id', api.DeleteTourById);

    /*====================================================================================================*/
    /**
     * extensions
     */
    /*====================================================================================================*/
    app.get('/contest/vacation-photo', extensions.GetUploadPhoto);
    app.post('/contest/vacation-photo/:year/:month', extensions.PostUploadPhoto);
    app.post('/process', extensions.PostProcess);
;
    /*====================================================================================================*/
    /**
     * 错误处理，理应放在最后
     */
    /*====================================================================================================*/
    app.use(error.Error_404);
    app.use(error.Error_500);
};