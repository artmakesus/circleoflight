var path = require('path');
var Mailgun = require('mailgun-js');
var mailgun = new Mailgun({
	apiKey: 'key-330cae01093376b2f392f5deccecac22',
	domain: 'sandbox1637498c75904e02aecee8f9d8d4ba8d.mailgun.org'
});

function send(recipient, photo, cb) {
	var filepath = path.join(__dirname, photo);
	var data = {
		from: 'postmaster@sandbox1637498c75904e02aecee8f9d8d4ba8d.mailgun.org',
		to: recipient,
		subject: 'Circle Of Light',
		text: 'Here\'s the photo you took using Circle of Light!',
		attachment: filepath,
	};

	mailgun.messages().send(data, cb);
}

module.exports = send;
