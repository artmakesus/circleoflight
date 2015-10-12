'use strict';

var $ = require('jquery');
var React = require('react');
var ReactDOM = require('react-dom');
var Flux = require('flux');
var Carousel = require('nuka-carousel');
var cx = require('classnames');
var m = require('merge');

var dispatcher = new Flux.Dispatcher();

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
				elem = React.createElement(StepThree, { image: this.state.image });break;
			case 'four':
				elem = React.createElement(StepFour, { resultPhoto: this.state.resultPhoto });break;
		}

		return elem;
	},
	getInitialState: function getInitialState() {
		return { step: 'one', image: null, resultPhoto: null };
	},
	componentDidMount: function componentDidMount() {
		this.listenerID = dispatcher.register((function (payload) {
			switch (payload.type) {
				case 'gotoStep':
					if (payload.step == 'three' && !payload.image || payload.step == 'four' && !payload.resultPhoto) {
						break;
					}
					this.setState({ step: payload.step, image: payload.image, resultPhoto: payload.resultPhoto });
					break;
			}
		}).bind(this));
	},
	componentWillUnmount: function componentWillUnmount() {
		dispatcher.unregister(this.listenerID);
	}
});

var Header = React.createClass({
	displayName: 'Header',

	styles: {
		container: {
			width: '100%'
		},
		column: {
			display: 'inline-block',
			width: '33.33%',
			padding: '16px 0'
		},
		activeColumn: {
			background: '#1488c8',
			color: 'white'
		}
	},
	render: function render() {
		var tab = this.props.tab;
		var column = this.styles.column;
		var activeColumn = this.styles.activeColumn;
		return React.createElement(
			'div',
			{ className: cx(this.props.className), style: this.styles.container },
			React.createElement(
				'div',
				{ style: m(tab === 'one' && activeColumn, column) },
				React.createElement(
					'h3',
					{ className: 'center' },
					'Step 1: Choose'
				)
			),
			React.createElement(
				'div',
				{ style: m(tab === 'two' && activeColumn, column) },
				React.createElement(
					'h3',
					{ className: 'center' },
					'Step 2: Take'
				)
			),
			React.createElement(
				'div',
				{ style: m(tab === 'three' && activeColumn, column) },
				React.createElement(
					'h3',
					{ className: 'center' },
					'Step 3: Share'
				)
			)
		);
	}
});

var StepOne = React.createClass({
	displayName: 'StepOne',

	render: function render() {
		return React.createElement(
			'div',
			{ className: 'fill-height' },
			React.createElement(
				'div',
				{ className: 'valign-wrapper fill-height' },
				React.createElement(StepOne.Examples, null),
				React.createElement(StepOne.Intro, null)
			)
		);
	}
});

StepOne.Examples = React.createClass({
	displayName: 'Examples',

	styles: {
		container: {
			width: '50%',
			margin: '32px'
		}
	},
	render: function render() {
		return React.createElement(
			'div',
			{ style: this.styles.container },
			React.createElement(
				Carousel,
				{ decorators: [] },
				this.state.photos.map(function (photo) {
					return React.createElement('img', { key: photo, className: 'center', src: photo, width: '512' });
				})
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
			width: '50%',
			textAlign: 'center',
			margin: '32px',
			padding: '16px'
		}
	},
	render: function render() {
		return React.createElement(
			'div',
			{ style: this.styles.container },
			React.createElement(
				'h1',
				null,
				'Circle Of Light'
			),
			React.createElement(
				'h3',
				null,
				'Take a photo with light painting'
			),
			React.createElement(
				'button',
				{ onClick: this.handleClick },
				'Start'
			)
		);
	},
	handleClick: function handleClick() {
		dispatcher.dispatch({ type: 'gotoStep', step: 'two' });
	}
});

var StepTwo = React.createClass({
	displayName: 'StepTwo',

	render: function render() {
		return React.createElement(
			'div',
			null,
			React.createElement(Header, { tab: 'one' }),
			React.createElement(StepTwo.Gallery, null)
		);
	}
});

StepTwo.Gallery = React.createClass({
	displayName: 'Gallery',

	mixins: [Carousel.ControllerMixin],
	render: function render() {
		return React.createElement(
			'div',
			{ className: 'fill-width fill-height' },
			React.createElement(
				Carousel,
				{ ref: 'carousel', slidesToShow: 3, cellAlign: 'center', decorators: [], data: this.setCarouselData.bind(this, 'carousel') },
				this.state.images.map(function (image) {
					return React.createElement(StepTwo.Gallery.Item, { key: image, image: image });
				})
			),
			React.createElement(
				'div',
				{ className: 'center' },
				React.createElement(
					'button',
					{ onClick: this.handleSurprise },
					'Surprise me'
				),
				React.createElement(
					'button',
					{ onClick: this.handleSubmit },
					'Submit'
				)
			),
			React.createElement(
				'div',
				{ className: 'center' },
				React.createElement(
					'button',
					{ onClick: this.handleBack },
					'Back to Home'
				)
			)
		);
	},
	getInitialState: function getInitialState() {
		return { images: [] };
	},
	componentDidMount: function componentDidMount() {
		$.ajax({
			url: '/images',
			method: 'GET'
		}).done((function (resp) {
			this.setState({ images: resp });
		}).bind(this)).fail((function (resp) {
			console.log(resp);
		}).bind(this));
	},
	handleSurprise: function handleSurprise() {
		var carousel = this.state.carousels.carousel;
		var num = carousel.props.children.length;
		var random = Math.floor(Math.random() * num);
		carousel.goToSlide(random);
	},
	handleSubmit: function handleSubmit() {
		var carousel = this.state.carousels.carousel;
		var image = this.state.images[carousel.state.currentSlide];
		dispatcher.dispatch({ type: 'gotoStep', step: 'three', image: image });
	},
	handleBack: function handleBack() {
		dispatcher.dispatch({ type: 'gotoStep', step: 'one' });
	}
});

StepTwo.Gallery.Item = React.createClass({
	displayName: 'Item',

	render: function render() {
		return React.createElement(
			'div',
			{ className: 'valign-wrapper', style: { height: '360px' } },
			React.createElement('img', { className: 'center', src: this.props.image, height: '256' })
		);
	}
});

var StepThree = React.createClass({
	displayName: 'StepThree',

	render: function render() {
		return React.createElement(
			'div',
			null,
			React.createElement(Header, { tab: 'two' }),
			React.createElement(StepThree.Counter, { image: this.props.image })
		);
	}
});

StepThree.Counter = React.createClass({
	displayName: 'Counter',

	styles: {
		container: {
			marginTop: '32px'
		},
		number: {
			fontSize: '10vw'
		}
	},
	render: function render() {
		return React.createElement(
			'div',
			{ className: 'valign-wrapper fill-height', style: this.styles.container },
			React.createElement(
				'div',
				{ className: 'valign center' },
				React.createElement(
					'h1',
					null,
					'Photo Taking In'
				),
				React.createElement(
					'h2',
					null,
					'Stand in front of the light stick for 5 seconds'
				),
				React.createElement(
					'p',
					{ style: this.styles.number },
					this.state.counter
				),
				React.createElement(
					'button',
					{ onClick: this.handleCancel },
					'Cancel'
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
			data: { image: this.props.image }
		}).done(function (resp) {
			console.log(resp);
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

	render: function render() {
		return React.createElement(
			'div',
			{ className: 'relative fill-height' },
			React.createElement(Header, { className: 'absolute', tab: 'three' }),
			React.createElement(StepFour.Result, { resultPhoto: this.props.resultPhoto }),
			React.createElement(StepFour.Form, { show: this.state.showShareForm })
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

	render: function render() {
		return React.createElement(
			'div',
			{ className: 'absolute center fill-width fill-height valign-wrapper' },
			React.createElement(
				'div',
				{ className: 'valign center' },
				React.createElement(
					'h1',
					null,
					'Here is your photo'
				),
				React.createElement(
					'div',
					null,
					React.createElement('img', { src: this.props.resultPhoto, height: '384' })
				),
				React.createElement(
					'button',
					{ onClick: this.handleRetake },
					'Retake'
				),
				React.createElement(
					'button',
					{ onClick: this.handleShare },
					'Share'
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
			background: 'rgba(0, 0, 0, 0.8)',
			zIndex: '-1'
		},
		show: {
			background: 'rgba(0, 0, 0, 0.8)',
			zIndex: '1'
		}
	},
	render: function render() {
		if (this.props.show) {
			return React.createElement(
				'form',
				{ className: 'absolute fill-width fill-height valign-wrapper', onSubmit: this.handleSubmit, style: this.styles.show },
				React.createElement(
					'div',
					{ className: 'valign center' },
					React.createElement(
						'h1',
						null,
						'Share through Email'
					),
					React.createElement('input', { type: 'email', name: 'email', required: true }),
					React.createElement(
						'div',
						null,
						React.createElement('input', { type: 'button', onClick: this.handleCancel, value: 'Cancel' }),
						React.createElement(
							'button',
							{ type: 'submit' },
							'Submit'
						)
					)
				)
			);
		}
		return React.createElement(
			'form',
			{ className: 'absolute fill-width fill-height valign-wrapper', onSubmit: this.handleSubmit, style: this.styles.container },
			React.createElement(
				'div',
				{ className: 'valign center' },
				React.createElement(
					'h1',
					null,
					'Share through Email'
				),
				React.createElement('input', { type: 'email', name: 'email', required: true }),
				React.createElement(
					'div',
					null,
					React.createElement('input', { type: 'button', onClick: this.handleCancel, value: 'Cancel' }),
					React.createElement(
						'button',
						{ type: 'submit' },
						'Submit'
					)
				)
			)
		);
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
	}
});

ReactDOM.render(React.createElement(App, null), document.getElementById('root'));