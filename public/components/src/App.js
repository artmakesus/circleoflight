var React = require('react');
var ReactDOM = require('react-dom');
var Flux = require('flux');
var Carousel = require('nuka-carousel');
var cx = require('classnames');
var m = require('merge');

var dispatcher = new Flux.Dispatcher();

var App = React.createClass({
	render: function() {
		var elem;

		switch (this.state.step) {
		case 'one':
			elem = <StepOne />; break;
		case 'two':
			elem = <StepTwo />; break;
		case 'three':
			elem = <StepThree />; break;
		case 'four':
			elem = <StepFour />; break;
		}

		return elem;
	},
	getInitialState: function() {
		return { step: 'one' }
	},
	componentDidMount: function() {
		this.listenerID = dispatcher.register(function(payload) {
			switch (payload.type) {
			case 'gotoStep':
				this.setState({ step: payload.step });
				break;
			}
		}.bind(this));
	},
	componentWillUnmount: function() {
		dispatcher.unregister(this.listenerID);
	},
});

var Header = React.createClass({
	styles: {
		container: {
			width: '100%',
		},
		column: {
			display: 'inline-block',
			width: '33.33%',
			padding: '16px 0',
		},
		activeColumn: {
			background: '#1488c8',
			color: 'white',
		},
	},
	render: function() {
		var tab = this.props.tab;
		var column = this.styles.column;
		var activeColumn = this.styles.activeColumn;
		return (
			<div className={cx(this.props.className)} style={this.styles.container}>
				<div style={m(tab === 'one' && activeColumn, column)}>
					<h3 className='center'>Step 1: Choose</h3>
				</div>
				<div style={m(tab === 'two' && activeColumn, column)}>
					<h3 className='center'>Step 2: Take</h3>
				</div>
				<div style={m(tab === 'three' && activeColumn, column)}>
					<h3 className='center'>Step 3: Share</h3>
				</div>
			</div>
		)
	},
});

var StepOne = React.createClass({
	styles: {
		container: {
			width: '100%',
			height: '100%',
			background: 'black',
		},
	},
	render: function() {
		return (
			<div style={this.styles.container}>
				<div className='valign-wrapper fill-height'>
					<StepOne.Examples />
					<StepOne.Intro />
				</div>
			</div>
		)
	},
});

StepOne.Examples = React.createClass({
	styles: {
		container: {
			width: '50%',
			margin: '32px',
		},
	},
	render: function() {
		return (
			<div style={this.styles.container}>
				<Carousel decorators={[]}>
					<img className='center' src='images/circleoflight.jpg' width='512' />
					<img className='center' src='images/circleoflight.jpg' width='512' />
					<img className='center' src='images/circleoflight.jpg' width='512' />
				</Carousel>
			</div>
		)
	},
});

StepOne.Intro = React.createClass({
	styles: {
		container: {
			width: '50%',
			textAlign: 'center',
			margin: '32px',
			padding: '16px',
		},
	},
	render: function() {
		return (
			<div style={this.styles.container}>
				<h1>Circle Of Light</h1>
				<h3>Take a photo with light painting</h3>
				<button onClick={this.handleClick}>Start</button>
			</div>
		)
	},
	handleClick: function() {
		dispatcher.dispatch({
			type: 'gotoStep',
			step: 'two',
		});
	},
});

var StepTwo = React.createClass({
	render: function() {
		return (
			<div>
				<Header tab="one" />
				<StepTwo.Gallery />
			</div>
		)
	},
});

StepTwo.Gallery = React.createClass({
	mixins: [ Carousel.ControllerMixin ],
	render: function() {
		return (
			<div className='fill-width fill-height'>
				<Carousel ref='carousel' slidesToShow={3} cellAlign='center' decorators={[]} data={this.setCarouselData.bind(this, 'carousel')}>
					<StepTwo.Gallery.Item />
					<StepTwo.Gallery.Item />
					<StepTwo.Gallery.Item />
					<StepTwo.Gallery.Item />
					<StepTwo.Gallery.Item />
					<StepTwo.Gallery.Item />
					<StepTwo.Gallery.Item />
					<StepTwo.Gallery.Item />
					<StepTwo.Gallery.Item />
					<StepTwo.Gallery.Item />
					<StepTwo.Gallery.Item />
					<StepTwo.Gallery.Item />
				</Carousel>
				<div className='center'>
					<button onClick={this.handleSurprise}>Surprise me</button>
					<button onClick={this.handleSubmit}>Submit</button>
				</div>
				<div className='center'>
					<button onClick={this.handleBack}>Back to Home</button>
				</div>
			</div>
		)
	},
	handleSurprise: function() {
		var carousel = this.state.carousels.carousel;
		var num = carousel.props.children.length;
		var random = Math.floor(Math.random() * num);
		carousel.goToSlide(random);
	},
	handleSubmit: function() {
		dispatcher.dispatch({
			type: 'gotoStep',
			step: 'three',
		});
	},
	handleBack: function() {
		dispatcher.dispatch({
			type: 'gotoStep',
			step: 'one',
		});
	},
});

StepTwo.Gallery.Item = React.createClass({
	render: function() {
		return (
			<div className='valign-wrapper' style={{ height: '360px' }}>
				<img className='center' src='images/circleoflight.jpg' height='256' />
			</div>
		)
	}
});

var StepThree = React.createClass({
	render: function() {
		return (
			<div>
				<Header tab="two" />
				<StepThree.Counter counter={this.state.counter} />
			</div>
		)
	},
	getInitialState: function() {
		return { counter: 10 };
	},
	componentDidMount: function() {
		this.counterID = window.setInterval(this.countDown, 1000);
	},
	componentWillUnmount: function() {
		clearTimeout(this.counterID);
	},
	countDown: function() {
		var counter = this.state.counter;
		if (counter > 0) {
			this.setState({ counter: counter - 1 });
		} else {
			dispatcher.dispatch({
				type: 'gotoStep',
				step: 'four',
			});
		}
	},
});

StepThree.Counter = React.createClass({
	styles: {
		container: {
			marginTop: '32px',
		},
		number: {
			fontSize: '10vw',
		},
	},
	render: function() {
		return (
			<div className='valign-wrapper fill-height' style={this.styles.container}>
				<div className='valign center'>
					<h1>Photo Taking In</h1>
					<h2>Stand in front of the light stick for 5 seconds</h2>
					<p style={this.styles.number}>{this.props.counter}</p>
					<button onClick={this.handleCancel}>Cancel</button>
				</div>
			</div>
		)
	},
	handleCancel: function() {
		dispatcher.dispatch({ type: "gotoStep", step: "two" });
	},
});

var StepFour = React.createClass({
	styles: {
		container: {
			width: '100%',
			height: '100%',
			background: 'black',
		},
	},
	render: function() {
		return (
			<div style={this.styles.container}>
				<Header tab="three" />
				<StepFour.Result />
			</div>
		)
	},
});

StepFour.Result = React.createClass({
	render: function() {
		return (
			<div className='center'>
				<h1>Here is your photo</h1>
				<div><img src='images/circleoflight.jpg' height='384' /></div>
				<button onClick={this.handleRetake}>Retake</button>
				<button onClick={this.handleSave}>Save</button>
			</div>
		)
	},
	handleRetake: function() {
		dispatcher.dispatch({
			type: 'gotoStep',
			step: 'two',
		});
	},
	handleSave: function() {
	},
});

ReactDOM.render(<App />, document.getElementById('root'));
