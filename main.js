const PRODUCTION = false;

var fs = require('fs');
var path = require('path');
var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var capture = require('./capture.js');
var email = require('./email.js');

app.use(bodyParser.urlencoded({ extended: false, limit: '50mb' }));
app.use(express.static('public'));

app.get('/photos', function(r, w) {
	fs.readdir('public/photos/', function(err, files) {
		if (!err) {
			files = files.map(function(file) { return 'photos/' + file; });
			w.send(files);
		} else {
			w.sendStatus(500);
			console.log(err);
		}
	});
});

app.get('/images', function(r, w) {
	var root = 'images/';
	fs.readdir('public/' + root, function(err, dirs) {
		if (err) {
			w.sendStatus(500);
			console.log(err);
			return;
		}

		var categories = [];
		for (var i in dirs) {
			var dirpath = root + dirs[i];
			var stats = fs.statSync('public/' + dirpath);
			if (!stats.isDirectory()) {
				continue;
			}

			var files = fs.readdirSync('public/' + dirpath);
			categories.push({ name: dirs[i], path: dirpath, images: files });
		}

		w.send(categories);
	});
});

app.post('/capture', function(r, w) {
	capture('public' + path.sep + r.body.image, function(err, output) {
		if (PRODUCTION) {
			if (!err) {
				w.send(output);
			} else {
				w.sendStatus(500);
			}
		} else {
			w.send(output);
		}
	});
});

app.post('/share', function(r, w) {
	w.sendStatus(200);
});

app.post('/email', function(r, w) {
	var em = r.body.email;
	var photo = r.body.photo;
	if (typeof(em) === 'string' && em.length > 3) {
		var filepath = path.sep + 'public' + path.sep + photo;
		email(em, filepath, function(err, body) {
			if (err) {
				console.log(err);
				w.sendStatus(400);
			} else {
				console.log('Sending the photo to', + em);
				w.sendStatus(200);
			}
		});
	} else {
		w.sendStatus(400);
	}
});

var server = app.listen(8080, function() {
	var host = server.address().address;
	var port = server.address().port;
	console.log('CircleOfLight app listening at http://%s:%s', host, port);
});
