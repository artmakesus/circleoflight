var fs = require('fs');
var path = require('path');
var express = require('express');
var bodyParser = require('body-parser');
var capture = require('./capture.js');

var app = express();
app.use(bodyParser.urlencoded({ extended: false }));
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
	fs.readdir('public/images/', function(err, files) {
		if (!err) {
			files = files.map(function(file) { return 'images/' + file; });
			w.send(files);
		} else {
			w.sendStatus(500);
			console.log(err);
		}
	});
});

app.post('/capture', function(r, w) {
	capture('public' + path.sep + r.body.image, function(err) {
		if (!err) {
			// TODO: replace dummy
			w.send('images/circleoflight.jpg');
		} else {
			console.log(err);
			w.sendStatus(500);
		}
	});
});

app.post('/share', function(r, w) {
	w.sendStatus(200);
});

var server = app.listen(8080, function() {
	var host = server.address().address;
	var port = server.address().port;
	console.log('CircleOfLight app listening at http://%s:%s', host, port);
});
