module.exports = {
	context: __dirname + '/public',
	entry: './components/build/App.js',
	output: {
		filename: './js/script.bundle.js',
	},
	resolve: {
		modulesDirectories: [ 'node_modules' ],
	},
};
