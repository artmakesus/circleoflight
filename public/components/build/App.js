'use strict';

var $ = require('jquery');
var React = require('react');
var ReactDOM = require('react-dom');
var Flux = require('flux');
var Carousel = require('nuka-carousel');
var cx = require('classnames');
var update = require('react-addons-update');

var dispatcher = new Flux.Dispatcher();

window.fbAsyncInit = function () {
	FB.init({
		appId: '1504892069826912',
		xfbml: true,
		version: 'v2.5'
	});
};
(function (d, s, id) {
	var js,
	    fjs = d.getElementsByTagName(s)[0];
	if (d.getElementById(id)) {
		return;
	}
	js = d.createElement(s);js.id = id;
	js.src = "//connect.facebook.net/en_US/sdk.js";
	fjs.parentNode.insertBefore(js, fjs);
})(document, 'script', 'facebook-jssdk');

function m(a, b) {
	if (!a) {
		a = {};
	}

	if (!b) {
		return a;
	}

	return update(a, { $merge: b });
}

function dataURItoBlob(dataURI) {
	var byteString = atob(dataURI.split(',')[1]);
	var ab = new ArrayBuffer(byteString.length);
	var ia = new Uint8Array(ab);
	for (var i = 0; i < byteString.length; i++) {
		ia[i] = byteString.charCodeAt(i);
	}
	return new Blob([ab], { type: 'image/png' });
}

var App = React.createClass({
	displayName: 'App',

	render: function render() {
		var elem;

		switch (this.state.step) {
			case 'one':
				elem = React.createElement(StepOne, null);break;
			case 'two':
				elem = React.createElement(StepTwo, null);break;
			case 'three':
				elem = React.createElement(StepThree, { selectedImage: this.state.selectedImage });break;
			case 'four':
				elem = React.createElement(StepFour, { resultPhoto: this.state.resultPhoto });break;
		}

		return elem;
	},
	getInitialState: function getInitialState() {
		return { step: 'four', selectedImage: null, resultPhoto: null };
	},
	componentDidMount: function componentDidMount() {
		this.listenerID = dispatcher.register((function (payload) {
			switch (payload.type) {
				case 'gotoStep':
					if (payload.step == 'three' && !payload.selectedImage || payload.step == 'four' && !payload.resultPhoto) {
						break;
					}
					this.setState({ step: payload.step, selectedImage: payload.selectedImage, resultPhoto: payload.resultPhoto });
					break;
			}
		}).bind(this));
	},
	componentWillUnmount: function componentWillUnmount() {
		dispatcher.unregister(this.listenerID);
	}
});

var StepOne = React.createClass({
	displayName: 'StepOne',

	styles: {
		container: {
			display: 'flex',
			flex: '0 0 100%',
			background: 'linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(images/bg.jpg) center / cover'
		}
	},
	render: function render() {
		return React.createElement(
			'div',
			{ style: this.styles.container },
			React.createElement(StepOne.Examples, null),
			React.createElement(StepOne.Intro, null)
		);
	}
});

StepOne.Examples = React.createClass({
	displayName: 'Examples',

	styles: {
		container: {
			display: 'flex',
			flex: '0 0 60%',
			alignItems: 'center',
			justifyContent: 'center'
		},
		inner: {
			display: 'flex',
			flex: '0 0 90%',
			alignItems: 'center'
		}
	},
	render: function render() {
		return React.createElement(
			'div',
			{ style: this.styles.container },
			React.createElement(
				'div',
				{ style: this.styles.inner },
				React.createElement(
					Carousel,
					{ decorators: [] },
					this.state.photos.map(function (photo) {
						return React.createElement('img', { key: photo, className: 'center', src: photo, width: '512' });
					})
				)
			)
		);
	},
	getInitialState: function getInitialState() {
		return { photos: [] };
	},
	componentDidMount: function componentDidMount() {
		$.ajax({
			url: '/photos',
			method: 'GET'
		}).done((function (resp) {
			this.setState({ photos: resp });
		}).bind(this)).fail((function (resp) {
			console.log(resp);
		}).bind(this));
	}
});

StepOne.Intro = React.createClass({
	displayName: 'Intro',

	styles: {
		container: {
			display: 'flex',
			flex: '0 0 40%',
			alignItems: 'center',
			textAlign: 'center'
		}
	},
	render: function render() {
		return React.createElement(
			'div',
			{ style: this.styles.container },
			React.createElement(
				'div',
				{ style: this.styles.inner },
				React.createElement(
					'h1',
					null,
					'CIRCLE OF LIGHT'
				),
				React.createElement(
					'h3',
					null,
					'Create your own light painting now'
				),
				React.createElement(
					'button',
					{ onClick: this.handleClick },
					'START'
				)
			)
		);
	},
	handleClick: function handleClick() {
		dispatcher.dispatch({ type: 'gotoStep', step: 'two' });
	}
});

var Header = React.createClass({
	displayName: 'Header',

	styles: {
		container: {
			display: 'flex',
			flex: '0 0 10%',
			flexDirection: 'row',
			alignItems: 'stretch'
		},
		column: {
			display: 'flex',
			flex: '1 1 33%',
			alignItems: 'center',
			justifyContent: 'center',
			borderTop: '8px solid #636363'
		},
		activeColumn: {
			color: 'white',
			borderTop: '8px solid #2cb976'
		},
		text: {
			color: '#636363'
		},
		activeText: {
			color: '#2cb976'
		}
	},
	render: function render() {
		var tab = this.props.tab;
		var column = this.styles.column;
		var text = this.styles.text;
		var activeColumn = this.styles.activeColumn;
		var activeText = this.styles.activeText;
		return React.createElement(
			'div',
			{ className: cx(this.props.className), style: this.styles.container },
			React.createElement(
				'div',
				{ style: m(column, tab === 'one' && activeColumn) },
				React.createElement(
					'h3',
					{ style: m(text, tab === 'one' && activeText) },
					'STEP 1 CHOOSE YOUR IMAGE'
				)
			),
			React.createElement(
				'div',
				{ style: m(column, tab === 'two' && activeColumn) },
				React.createElement(
					'h3',
					{ style: m(text, tab === 'two' && activeText) },
					'STEP 2 TAKE PHOTO'
				)
			),
			React.createElement(
				'div',
				{ style: m(column, tab === 'three' && activeColumn) },
				React.createElement(
					'h3',
					{ style: m(text, tab === 'three' && activeText) },
					'STEP 3: SHARE PHOTO'
				)
			)
		);
	}
});

var StepTwo = React.createClass({
	displayName: 'StepTwo',

	styles: {
		container: {
			display: 'flex',
			flex: '0 0 100%',
			flexDirection: 'column'
		}
	},
	render: function render() {
		var category = this.state.category;
		var categories = this.state.categories;
		if (categories.length == 0) {
			return null;
		}

		var path = categories.length > 0 ? categories[category].path : '';
		var images = categories.length > 0 ? categories[category].images : [];
		return React.createElement(
			'div',
			{ style: this.styles.container },
			React.createElement(Header, { tab: 'one' }),
			React.createElement(StepTwo.Tabs, { category: categories[category].name, categories: categories }),
			React.createElement(StepTwo.Gallery, { path: path, images: images, selectedImagePath: this.state.imagePath }),
			React.createElement(StepTwo.Buttons, { selectedImagePath: this.state.imagePath })
		);
	},
	getInitialState: function getInitialState() {
		return { category: 0, categories: [], imagePath: null };
	},
	componentDidMount: function componentDidMount() {
		$.ajax({
			url: '/images',
			method: 'GET'
		}).done((function (resp) {
			this.setState({ categories: resp });
		}).bind(this)).fail((function (resp) {
			console.log(resp);
		}).bind(this));

		this.listenerID = dispatcher.register((function (payload) {
			var categories = this.state.categories;
			if (categories.length == 0) {
				return;
			}

			switch (payload.type) {
				case 'clickedImage':
					this.setState({ imagePath: payload.imagePath });
					break;
				case 'changeCategory':
					for (var i = 0; i < categories.length; i++) {
						if (categories[i].name == payload.category) {
							this.setState({ category: i });
							break;
						}
					}
					break;
				case 'surprise':
					var randomCategory = Math.floor(Math.random() * categories.length);
					var category = categories[randomCategory];
					var randomImage = category.images[Math.floor(Math.random() * category.images.length)];
					this.setState({ category: randomCategory, imagePath: category.path + '/' + randomImage });
					break;
			}
		}).bind(this));
	},
	componentWillUnmount: function componentWillUnmount() {
		dispatcher.unregister(this.listenerID);
	}
});

StepTwo.Tabs = React.createClass({
	displayName: 'Tabs',

	styles: {
		container: {
			display: 'flex',
			flexDirection: 'row',
			margin: '0 16px'
		},
		tab: {
			flex: '1 1',
			textTransform: 'uppercase',
			textAlign: 'center',
			cursor: 'pointer',
			borderBottom: '1px solid white'
		},
		activeTab: {
			borderBottom: '8px solid #2cb976'
		}
	},
	render: function render() {
		return React.createElement(
			'div',
			{ style: this.styles.container },
			this.props.categories.map((function (category) {
				var titleStyle = m(this.styles.tab, this.props.category == category.name && this.styles.activeTab);
				return React.createElement(
					'h3',
					{ key: category.name, style: titleStyle, onClick: this.handleClick.bind(this, category.name) },
					category.name
				);
			}).bind(this))
		);
	},
	handleClick: function handleClick(category) {
		dispatcher.dispatch({ type: 'changeCategory', category: category });
	}
});

StepTwo.Gallery = React.createClass({
	displayName: 'Gallery',

	mixins: [Carousel.ControllerMixin],
	styles: {
		container: {
			display: 'flex',
			flex: '1 1 70%',
			flexWrap: 'wrap',
			flexDirection: 'row',
			margin: '0 16px',
			overflowY: 'scroll'
		},
		imageContainer: {
			display: 'flex',
			flex: '0 1 20%',
			alignItems: 'flex-start',
			justifyContent: 'space-between'
		},
		image: {
			maxWidth: '90%',
			maxHeight: '90%',
			marginBottom: '8px',
			border: '8px solid black',
			cursor: 'pointer'
		},
		selectedImage: {
			border: '8px solid #2cb976'
		}
	},
	render: function render() {
		return React.createElement(
			'div',
			{ style: this.styles.container },
			this.props.images.map((function (image) {
				var imagePath = this.props.path + '/' + image;
				var imageStyle = m(this.styles.image, this.props.selectedImagePath == imagePath && this.styles.selectedImage);
				return React.createElement(
					'div',
					{ key: imagePath, style: this.styles.imageContainer },
					React.createElement('img', { src: imagePath, style: imageStyle, onClick: this.handleClick.bind(this, imagePath) })
				);
			}).bind(this))
		);
	},
	handleClick: function handleClick(imagePath) {
		dispatcher.dispatch({ type: 'clickedImage', imagePath: imagePath });
	}
});

StepTwo.Buttons = React.createClass({
	displayName: 'Buttons',

	styles: {
		container: {
			display: 'block',
			margin: '0 auto'
		}
	},
	render: function render() {
		return React.createElement(
			'div',
			{ style: this.styles.container },
			React.createElement(
				'button',
				{ onClick: this.handleBack },
				'BACK'
			),
			React.createElement(
				'button',
				{ onClick: this.handleSurprise },
				'SURPRISE ME'
			),
			React.createElement(
				'button',
				{ onClick: this.handleNext },
				'NEXT'
			)
		);
	},
	handleSurprise: function handleSurprise() {
		dispatcher.dispatch({ type: 'surprise' });
	},
	handleNext: function handleNext() {
		if (!this.props.selectedImagePath) {
			alert('You must select an image first!');
			return;
		}
		dispatcher.dispatch({ type: 'gotoStep', step: 'three', selectedImage: this.props.selectedImagePath });
	},
	handleBack: function handleBack() {
		dispatcher.dispatch({ type: 'gotoStep', step: 'one' });
	}
});

var StepThree = React.createClass({
	displayName: 'StepThree',

	styles: {
		container: {
			display: 'flex',
			flex: '0 0 100%',
			flexDirection: 'column'
		}
	},
	render: function render() {
		var elem;
		if (this.state.ready) {
			elem = React.createElement(StepThree.GoingToTakePhoto, { selectedImage: this.props.selectedImage });
		} else {
			elem = React.createElement(StepThree.GettingReady, null);
		}
		return React.createElement(
			'div',
			{ style: this.styles.container },
			React.createElement(Header, { tab: 'two' }),
			elem
		);
	},
	getInitialState: function getInitialState() {
		return { ready: false };
	},
	componentDidMount: function componentDidMount() {
		this.listenerID = dispatcher.register((function (payload) {
			switch (payload.type) {
				case 'setReady':
					this.setState({ ready: true });
					break;
			}
		}).bind(this));
	},
	componentWillUnmount: function componentWillUnmount() {
		dispatcher.unregister(this.listenerID);
	}
});

StepThree.GettingReady = React.createClass({
	displayName: 'GettingReady',

	styles: {
		container: {
			display: 'flex',
			flex: '1 1 80%',
			flexDirection: 'column'
		},
		titleContainer: {
			display: 'flex',
			flex: '0 0 20%',
			flexWrap: 'wrap',
			justifyContent: 'center'
		},
		title: {
			maxWidth: '80%',
			textAlign: 'center'
		},
		imageContainer: {
			display: 'flex',
			flex: '1 1 256px',
			justifyContent: 'center'
		},
		image: {
			maxHeight: 'auto',
			objectFit: 'contain'
		},
		buttonContainer: {
			flex: '0 0 20%',
			textAlign: 'center'
		}
	},
	render: function render() {
		return React.createElement(
			'div',
			{ style: this.styles.container },
			React.createElement(
				'div',
				{ style: this.styles.titleContainer },
				React.createElement(
					'h1',
					{ style: this.styles.title },
					'PLEASE STAND INFRONT OF THE LED STICK AND DON\'T MOVE FOR 5 SECONDS'
				)
			),
			React.createElement(
				'div',
				{ style: this.styles.imageContainer },
				React.createElement('img', { src: 'images/standing_demo.jpg', style: this.styles.image })
			),
			React.createElement(
				'div',
				{ style: this.styles.buttonContainer },
				React.createElement(
					'button',
					{ style: this.styles.button, onClick: this.handleBack },
					'BACK'
				),
				React.createElement(
					'button',
					{ style: this.styles.button, onClick: this.handleReady },
					'READY'
				)
			)
		);
	},
	handleReady: function handleReady() {
		dispatcher.dispatch({ type: 'setReady' });
	},
	handleBack: function handleBack() {
		dispatcher.dispatch({ type: 'gotoStep', step: 'two' });
	}
});

StepThree.GoingToTakePhoto = React.createClass({
	displayName: 'GoingToTakePhoto',

	styles: {
		container: {
			display: 'flex',
			flex: '1 1 80%',
			flexDirection: 'column'
		},
		titleContainer: {
			display: 'flex',
			flex: '0 0 20%',
			justifyContent: 'center'
		},
		title: {
			fontSize: '5vh'
		},
		numberContainer: {
			display: 'flex',
			flex: '0 0 80%',
			justifyContent: 'center'
		},
		number: {
			fontSize: '50vh',
			margin: 0
		}
	},
	render: function render() {
		return React.createElement(
			'div',
			{ style: this.styles.container },
			React.createElement(
				'div',
				{ style: this.styles.titleContainer },
				React.createElement(
					'h1',
					{ style: this.styles.title },
					'PHOTO TAKING IN...'
				)
			),
			React.createElement(
				'div',
				{ style: this.styles.numberContainer },
				React.createElement(
					'p',
					{ style: this.styles.number },
					this.state.counter
				)
			)
		);
	},
	getInitialState: function getInitialState() {
		return { counter: 1 };
	},
	componentDidMount: function componentDidMount() {
		this.counterID = window.setInterval(this.countDown, 1000);
	},
	componentWillUnmount: function componentWillUnmount() {
		clearTimeout(this.counterID);
	},
	countDown: function countDown() {
		var counter = this.state.counter;
		if (counter > 0) {
			this.setState({ counter: counter - 1 });
		} else {
			clearTimeout(this.counterID);
			this.capture();
		}
	},
	capture: function capture() {
		$.ajax({
			url: '/capture',
			method: 'POST',
			data: { image: this.props.selectedImage }
		}).done(function (resp) {
			dispatcher.dispatch({ type: 'gotoStep', step: 'four', resultPhoto: resp });
		}).fail(function (resp) {
			dispatcher.dispatch({ type: 'gotoStep', step: 'two' });
		});
	},
	handleCancel: function handleCancel() {
		dispatcher.dispatch({ type: 'gotoStep', step: 'two' });
	}
});

var StepFour = React.createClass({
	displayName: 'StepFour',

	styles: {
		container: {
			display: 'flex',
			flex: '0 0 100%',
			flexDirection: 'column'
		}
	},
	render: function render() {
		var elem;
		if (this.state.showShareForm) {
			elem = React.createElement(StepFour.Form, { resultPhoto: this.props.resultPhoto, show: this.state.showShareForm });
		} else {
			elem = React.createElement(StepFour.Result, { resultPhoto: this.props.resultPhoto });
		}
		return React.createElement(
			'div',
			{ style: this.styles.container },
			React.createElement(Header, { tab: 'three' }),
			elem
		);
	},
	getInitialState: function getInitialState() {
		return { showShareForm: false };
	},
	componentDidMount: function componentDidMount() {
		this.listenerID = dispatcher.register((function (payload) {
			switch (payload.type) {
				case 'showShareForm':
					this.setState({ showShareForm: true });break;
				case 'hideShareForm':
					this.setState({ showShareForm: false });break;
			}
		}).bind(this));
	},
	componentWillUnmount: function componentWillUnmount() {
		dispatcher.unregister(this.listenerID);
	}
});

StepFour.Result = React.createClass({
	displayName: 'Result',

	styles: {
		container: {
			display: 'flex',
			flex: '0 0 80%',
			flexDirection: 'column'
		},
		title: {
			flex: '0 0 20%',
			textAlign: 'center'
		},
		imageContainer: {
			display: 'flex',
			flex: '1 1 0%',
			justifyContent: 'center'
		},
		image: {
			border: '4px solid white'
		},
		buttonsContainer: {
			flex: '0 0 20%',
			flexDirection: 'row',
			textAlign: 'center',
			justifyContent: 'center'
		}
	},
	render: function render() {
		return React.createElement(
			'div',
			{ style: this.styles.container },
			React.createElement(
				'h1',
				{ style: this.styles.title },
				'HERE IS YOUR PHOTO'
			),
			React.createElement(
				'div',
				{ style: this.styles.imageContainer },
				React.createElement('img', { id: 'photo', src: this.props.resultPhoto, style: this.styles.image })
			),
			React.createElement(
				'div',
				{ style: this.styles.buttonsContainer },
				React.createElement(
					'button',
					{ onClick: this.handleRetake },
					'RETAKE'
				),
				React.createElement(
					'button',
					{ onClick: this.handleShare },
					'SHARE'
				)
			)
		);
	},
	handleRetake: function handleRetake() {
		dispatcher.dispatch({ type: 'gotoStep', step: 'two' });
	},
	handleShare: function handleShare() {
		dispatcher.dispatch({ type: 'showShareForm' });
	}
});

StepFour.Form = React.createClass({
	displayName: 'Form',

	image: null,
	styles: {
		container: {
			display: 'flex',
			flexDirection: 'column',
			alignItems: 'center'
		},
		titleContainer: {
			flex: '0 0 20%',
			textAlign: 'center'
		},
		socialContainer: {
			display: 'flex',
			flex: '0 0 20%',
			flexDirection: 'row',
			justifyContent: 'space-between'
		},
		facebook: {
			width: '128px',
			height: '128px',
			backgroundColor: '#3B5998',
			backgroundImage: 'url(icons/facebook/facebook-128.png)',
			margin: '0 16px',
			cursor: 'pointer'
		},
		twitter: {
			width: '128px',
			height: '128px',
			backgroundColor: '#00ACED',
			backgroundImage: 'url(icons/twitter/twitter-128.png)',
			margin: '0 16px',
			cursor: 'pointer'
		},
		emailContainer: {
			display: 'flex',
			flex: '0 0 30%',
			flexDirection: 'row',
			alignItems: 'center',
			justifyContent: 'center',
			textAlign: 'center',
			width: '60%',
			margin: '64px 0'
		},
		emailInput: {
			flex: '1 1 70%',
			height: '3rem',
			marginRight: '8px',
			background: '#f3f3f3',
			borderWidth: 0,
			paddingLeft: '16px',
			color: 'black',
			fontWeight: 'bold'
		},
		emailButton: {
			flex: '0 0 30%',
			height: '3rem',
			borderWidth: 0,
			fontWeight: 'bold',
			color: 'black',
			cursor: 'pointer'
		},
		completeContainer: {
			flex: '0 0 20%',
			textAlign: 'center'
		}
	},
	render: function render() {
		return React.createElement(
			'form',
			{ onSubmit: this.handleSubmit, style: this.styles.container },
			React.createElement(
				'div',
				{ style: this.styles.titleContainer },
				React.createElement(
					'h1',
					null,
					'SHARE YOUR PHOTO WITH FRIENDS'
				)
			),
			React.createElement(
				'div',
				{ style: this.styles.socialContainer },
				React.createElement('div', { style: this.styles.facebook, onClick: this.handleFacebookShare }),
				React.createElement('div', { style: this.styles.twitter, onClick: this.handleTwitterShare })
			),
			React.createElement(
				'div',
				{ style: this.styles.emailContainer },
				React.createElement('input', { type: 'email', name: 'email', placeholder: ' EMAIL ADDRESS', style: this.styles.emailInput, required: true }),
				React.createElement('input', { type: 'submit', value: 'SUBMIT', style: this.styles.emailButton })
			),
			React.createElement(
				'div',
				{ style: this.styles.completeContainer },
				React.createElement(
					'button',
					{ type: 'submit', onClick: this.handleDone },
					'DONE'
				),
				React.createElement(
					'button',
					{ onClick: this.handleCancel },
					'CANCEL'
				)
			)
		);
	},
	getInitialState: function getInitialState() {
		return { photoURL: null };
	},
	componentDidMount: function componentDidMount() {
		var image = new Image();
		image.onload = (function () {
			var canvas = document.createElement('canvas');
			canvas.width = image.naturalWidth;
			canvas.height = image.naturalHeight;
			canvas.getContext('2d').drawImage(image, 0, 0);
			this.setState({ photoURL: canvas.toDataURL('image/png') });
		}).bind(this);
		image.src = this.props.resultPhoto;
	},
	componentWillUnmount: function componentWillUnmount() {
		FB.logout();
	},
	handleDone: function handleDone(evt) {
		dispatcher.dispatch({ type: 'gotoStep', step: 'one' });
	},
	handleCancel: function handleCancel(evt) {
		dispatcher.dispatch({ type: 'hideShareForm' });
	},
	handleSubmit: function handleSubmit(evt) {
		evt.preventDefault();

		var form = evt.target;

		$.ajax({
			url: '/share',
			method: 'POST',
			data: $(form).serialize()
		}).done(function (resp) {
			alert('We\'ve emailed the photograph to your email address!');
			dispatcher.dispatch({ type: 'hideShareForm' });
		}).fail(function (resp) {
			alert('Sorry! We encountered problem while sending the photograph to your email address.');
			dispatcher.dispatch({ type: 'hideShareForm' });
		});
	},
	handleFacebookShare: function handleFacebookShare() {
		FB.logout();

		FB.login((function (response) {
			if (response.authResponse) {
				var blob;
				try {
					blob = dataURItoBlob(this.state.photoURL);
				} catch (e) {
					alert('Failed to convert image to blob');
					return;
				}
				var accessToken = FB.getAccessToken();

				var fd = new FormData();
				fd.append("access_token", accessToken);
				fd.append("source", blob);
				fd.append("message", "Just took this photo using Circle Of Light!");
				try {
					$.ajax({
						url: "https://graph.facebook.com/me/photos?access_token=" + accessToken,
						type: "POST",
						data: fd,
						processData: false,
						contentType: false,
						cache: false,
						success: function success(data) {
							alert('Shared the photo on Facebook!');
						},
						error: function error(shr, status, data) {
							console.log("error " + data + " Status " + shr.status);
							alert('Failed to share the photo on Facebook.');
						}
					});
				} catch (e) {
					console.log(e);
				}
			} else {
				alert('Failed to login to Facebook.');
			}
		}).bind(this), { scope: 'publish_actions' });
	},
	handleTwitterShare: function handleTwitterShare() {}
});

ReactDOM.render(React.createElement(App, null), document.getElementById('root'));