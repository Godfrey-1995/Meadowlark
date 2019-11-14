var formidable = require('formidable');

/*====================================================================================================*/
/**
 */
/*====================================================================================================*/
exports.GetUploadPhoto = function (req, res) {
    var now_date = new Date();
    res.render('contest/vacation-photo');
}

/*====================================================================================================*/
/**
 */
/*====================================================================================================*/
exports.PostUploadPhoto = function (req, res) {
    let form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
        if(err) return res.redirect(303, '/error');
        console.log('received fields:');
        console.log(fields);
        console.log('received files:');
        console.log(files);
        res.redirect(303, '/thank-you');
    })
}

/*====================================================================================================*/
/**
 */
/*====================================================================================================*/
exports.PostProcess = function (req, res) {
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
}