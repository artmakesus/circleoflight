var nodemailer = require('nodemailer');
var ses = require('nodemailer-ses-transport');
var transporter = nodemailer.createTransport(ses({
	accessKeyId: 'ACCESSKEYTBC',
	secretAccessKey: 'SECRETTBC'
}));

const FROM = 'artmakesus@gmail.com';
const SUBJECT = 'Your Photo!';
const TEXT = 'Here\'s your photo captured by the Circle Of Light!';

function sendEmail(recipientEmail, photo) {
	transporter.sendMail({
		from: FROM,
		to: recipientEmail,
		subject: SUBJECT,
		text: TEXT,
		attachments: [
			{
			    filename: 'photo.jpg',
			    path: photo,  
			},
		],
	});
}

module.exports = sendEmail;
