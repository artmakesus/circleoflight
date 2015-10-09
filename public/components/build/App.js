'use strict';

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
				elem = React.createElement(StepThree, null);break;
			case 'four':
				elem = React.createElement(StepFour, null);break;
		}

		return elem;
	},
	getInitialState: function getInitialState() {
		return { step: 'one' };
	},
	componentDidMount: function componentDidMount() {
		this.listenerID = dispatcher.register((function (payload) {
			switch (payload.type) {
				case 'gotoStep':
					this.setState({ step: payload.step });
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

	styles: {
		container: {
			width: '100%',
			height: '100%',
			background: 'black'
		}
	},
	render: function render() {
		return React.createElement(
			'div',
			{ style: this.styles.container },
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
				React.createElement('img', { className: 'center', src: 'images/circleoflight.jpg', width: '512' }),
				React.createElement('img', { className: 'center', src: 'images/circleoflight.jpg', width: '512' }),
				React.createElement('img', { className: 'center', src: 'images/circleoflight.jpg', width: '512' })
			)
		);
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
		dispatcher.dispatch({
			type: 'gotoStep',
			step: 'two'
		});
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
				React.createElement(StepTwo.Gallery.Item, null),
				React.createElement(StepTwo.Gallery.Item, null),
				React.createElement(StepTwo.Gallery.Item, null),
				React.createElement(StepTwo.Gallery.Item, null),
				React.createElement(StepTwo.Gallery.Item, null),
				React.createElement(StepTwo.Gallery.Item, null),
				React.createElement(StepTwo.Gallery.Item, null),
				React.createElement(StepTwo.Gallery.Item, null),
				React.createElement(StepTwo.Gallery.Item, null),
				React.createElement(StepTwo.Gallery.Item, null),
				React.createElement(StepTwo.Gallery.Item, null),
				React.createElement(StepTwo.Gallery.Item, null)
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
	handleSurprise: function handleSurprise() {
		var carousel = this.state.carousels.carousel;
		var num = carousel.props.children.length;
		var random = Math.floor(Math.random() * num);
		carousel.goToSlide(random);
	},
	handleSubmit: function handleSubmit() {
		dispatcher.dispatch({
			type: 'gotoStep',
			step: 'three'
		});
	},
	handleBack: function handleBack() {
		dispatcher.dispatch({
			type: 'gotoStep',
			step: 'one'
		});
	}
});

StepTwo.Gallery.Item = React.createClass({
	displayName: 'Item',

	render: function render() {
		return React.createElement(
			'div',
			{ className: 'valign-wrapper', style: { height: '360px' } },
			React.createElement('img', { className: 'center', src: 'images/circleoflight.jpg', height: '256' })
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
			React.createElement(StepThree.Counter, { counter: this.state.counter })
		);
	},
	getInitialState: function getInitialState() {
		return { counter: 10 };
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
			dispatcher.dispatch({
				type: 'gotoStep',
				step: 'four'
			});
		}
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
					this.props.counter
				),
				React.createElement(
					'button',
					{ onClick: this.handleCancel },
					'Cancel'
				)
			)
		);
	},
	handleCancel: function handleCancel() {
		dispatcher.dispatch({ type: "gotoStep", step: "two" });
	}
});

var StepFour = React.createClass({
	displayName: 'StepFour',

	styles: {
		container: {
			width: '100%',
			height: '100%',
			background: 'black'
		}
	},
	render: function render() {
		return React.createElement(
			'div',
			{ style: this.styles.container },
			React.createElement(Header, { tab: 'three' }),
			React.createElement(StepFour.Result, null)
		);
	}
});

StepFour.Result = React.createClass({
	displayName: 'Result',

	render: function render() {
		return React.createElement(
			'div',
			{ className: 'center' },
			React.createElement(
				'h1',
				null,
				'Here is your photo'
			),
			React.createElement(
				'div',
				null,
				React.createElement('img', { src: 'images/circleoflight.jpg', height: '384' })
			),
			React.createElement(
				'button',
				{ onClick: this.handleRetake },
				'Retake'
			),
			React.createElement(
				'button',
				{ onClick: this.handleSave },
				'Save'
			)
		);
	},
	handleRetake: function handleRetake() {
		dispatcher.dispatch({
			type: 'gotoStep',
			step: 'two'
		});
	},
	handleSave: function handleSave() {}
});

ReactDOM.render(React.createElement(App, null), document.getElementById('root'));