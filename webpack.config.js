var path = require('path');

module.exports = {
	context: __dirname + path.sep + 'public',
	entry: '.' + path.sep + 'components' + path.sep + 'build' + path.sep + 'App.js',
	output: {
		filename: '.' + path.sep + 'public' + path.sep + 'js' + path.sep + 'script.bundle.js',
	},
	resolve: {
		modulesDirectories: [ 'node_modules' ],
	},
};
