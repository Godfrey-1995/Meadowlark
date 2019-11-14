

/*====================================================================================================*/
/**
 */
/*====================================================================================================*/
function NewsletterSignUp() {}
NewsletterSignUp.prototype.save = function(callback) {
    callback();
};

/*====================================================================================================*/
/**
 */
/*====================================================================================================*/
exports.GetNewsLetter = function (req, res) {
    res.render('newsletter');
}

/*====================================================================================================*/
/**
 */
/*====================================================================================================*/
exports.PostNewsLetter = function (req, res) {
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
}

/*====================================================================================================*/
/**
 */
/*====================================================================================================*/
exports.Archive = function (req, res) {
    res.render('newsletter/archive');
}