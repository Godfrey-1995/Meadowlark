var nodemailer = require('nodemailer');
var credentials = require('../credentials');

module.exports = (function() {
    let mailTransport = nodemailer.createTransport({
        service: '163',
        port: '465',
        secureConnection: true,
        auth: {
            user: credentials.mail.user,
            pass: credentials.mail.password
        }
    });
    let from = '"JavaScript之禅" <zhoutf1995@163.com>';
    let errorRecipient = 'do123dixia@163.com';
    return {
        send: function (mail) {
            mail = mail || {};
            let to = mail.to;
            let subject = mail.subject;
            let text = mail.text;

            mailTransport.sendMail({
                from: from,
                to: to,
                subject: subject,
                text: text
            }, function (err, info) {
                if (err) return console.error('Unable to send mail: ' + err);
                console.log('Message sent: %s', info.messageId);
            })
        },
        sendError: function (mail) {
            let message = mail.message;
            let exception = mail.exception;
            let filename = mail.filename;
            let body = '<h1>Meadowlark Travel Site Error</h1>' +
                'message:<br><pre>' + message + '</pre><br>';
            if(exception) body += 'exception:<br><pre>' + exception + '</pre><br>';
            if(filename) body += 'filename:<br><pre>' + filename + '</pre><br>';
            mailTransport.sendMail({
                from: from,
                to: errorRecipient,
                subject: 'Meadowlark Travel Site Error',
                html: body,
                generateTextFromHtml: true
            }, function(err){
                if(err) console.error('Unable to send email: ' + err);
            });
        }
    }
})();

