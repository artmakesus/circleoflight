var $        = require('jquery');
var React    = require('react');
var ReactDOM = require('react-dom');
var Flux     = require('flux');
var Carousel = require('nuka-carousel');
var cx       = require('classnames');
var m        = require('merge');

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
			elem = <StepThree image={this.state.image} />; break;
		case 'four':
			elem = <StepFour resultPhoto={this.state.resultPhoto} />; break;
		}

		return elem;
	},
	getInitialState: function() {
		return { step: 'one', image: null, resultPhoto: null }
	},
	componentDidMount: function() {
		this.listenerID = dispatcher.register(function(payload) {
			switch (payload.type) {
			case 'gotoStep':
				if ((payload.step == 'three' && !payload.image) ||
				    (payload.step == 'four' && !payload.resultPhoto)) {
					break;
				}
				this.setState({ step: payload.step, image: payload.image, resultPhoto: payload.resultPhoto });
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
	render: function() {
		return (
			<div className='fill-height'>
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
				<Carousel decorators={[]}>{
					this.state.photos.map(function(photo) {
						return <img key={photo} className='center' src={photo} width='512' />
					})
				}</Carousel>
			</div>
		)
	},
	getInitialState: function() {
		return { photos: [] }
	},
	componentDidMount: function() {
		$.ajax({
			url: '/photos',
			method: 'GET',
		}).done(function(resp) {
			this.setState({ photos: resp });
		}.bind(this)).fail(function(resp) {
			console.log(resp);
		}.bind(this));
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
		dispatcher.dispatch({ type: 'gotoStep', step: 'two' });
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
				<Carousel ref='carousel' slidesToShow={3} cellAlign='center' decorators={[]} data={this.setCarouselData.bind(this, 'carousel')}>{
					this.state.images.map(function(image) {
						return <StepTwo.Gallery.Item key={image} image={image} />
					})
				}</Carousel>
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
	getInitialState: function() {
		return { images : [] };
	},
	componentDidMount: function() {
		$.ajax({
			url: '/images',
			method: 'GET',
		}).done(function(resp) {
			this.setState({ images: resp });
		}.bind(this)).fail(function(resp) {
			console.log(resp);
		}.bind(this));
	},
	handleSurprise: function() {
		var carousel = this.state.carousels.carousel;
		var num = carousel.props.children.length;
		var random = Math.floor(Math.random() * num);
		carousel.goToSlide(random);
	},
	handleSubmit: function() {
		var carousel = this.state.carousels.carousel;
		var image = this.state.images[carousel.state.currentSlide];
		dispatcher.dispatch({ type: 'gotoStep', step: 'three', image: image });
	},
	handleBack: function() {
		dispatcher.dispatch({ type: 'gotoStep', step: 'one' });
	},
});

StepTwo.Gallery.Item = React.createClass({
	render: function() {
		return (
			<div className='valign-wrapper' style={{ height: '360px' }}>
				<img className='center' src={this.props.image} height='256' />
			</div>
		)
	}
});

var StepThree = React.createClass({
	render: function() {
		return (
			<div>
				<Header tab="two" />
				<StepThree.Counter image={this.props.image} />
			</div>
		)
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
					<p style={this.styles.number}>{this.state.counter}</p>
					<button onClick={this.handleCancel}>Cancel</button>
				</div>
			</div>
		)
	},
	getInitialState: function() {
		return { counter: 1 };
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
			this.capture();
		}
	},
	capture: function() {
		$.ajax({
			url: '/capture',
			method: 'POST',
			data: { image: this.props.image },
		}).done(function(resp) {
			console.log(resp);
			dispatcher.dispatch({ type: 'gotoStep', step: 'four', resultPhoto: resp });
		}).fail(function(resp) {
			dispatcher.dispatch({ type: 'gotoStep', step: 'two' });
		});
	},
	handleCancel: function() {
		dispatcher.dispatch({ type: "gotoStep", step: "two" });
	},
});

var StepFour = React.createClass({
	render: function() {
		return (
			<div className='relative fill-height'>
				<Header className='absolute' tab="three" />
				<StepFour.Result resultPhoto={this.props.resultPhoto} />
				<StepFour.Form show={this.state.showShareForm} />
			</div>
		)
	},
	getInitialState: function() {
		return { showShareForm: false };
	},
	componentDidMount: function() {
		this.listenerID = dispatcher.register(function(payload) {
			switch (payload.type) {
			case 'showShareForm':
				this.setState({ showShareForm: true }); break;
			case 'hideShareForm':
				this.setState({ showShareForm: false }); break;
			}
		}.bind(this));
	},
	componentWillUnmount: function() {
		dispatcher.unregister(this.listenerID);
	},
});

StepFour.Result = React.createClass({
	render: function() {
		return (
			<div className='absolute center fill-width fill-height valign-wrapper'>
				<div className='valign center'>
					<h1>Here is your photo</h1>
					<div><img src={this.props.resultPhoto} height='384' /></div>
					<button onClick={this.handleRetake}>Retake</button>
					<button onClick={this.handleShare}>Share</button>
				</div>
			</div>
		)
	},
	handleRetake: function() {
		dispatcher.dispatch({ type: 'gotoStep', step: 'two' });
	},
	handleShare: function() {
		dispatcher.dispatch({ type: 'showShareForm' });
	},
});

StepFour.Form = React.createClass({
	image: null,
	styles: {
		container: {
			background: 'rgba(0, 0, 0, 0.8)',
			zIndex: '-1',
		},
		show: {
			background: 'rgba(0, 0, 0, 0.8)',
			zIndex: '1',
		},
	},
	render: function() {
		if (this.props.show) {
			return (
				<form className='absolute fill-width fill-height valign-wrapper' onSubmit={this.handleSubmit} style={this.styles.show}>
					<div className='valign center'>
						<h1>Share through Email</h1>
						<input type='email' name='email' required />
						<div>
							<input type='button' onClick={this.handleCancel} value='Cancel' />
							<button type='submit'>Submit</button>
						</div>
					</div>
				</form>
			)
		}
		return (
			<form className='absolute fill-width fill-height valign-wrapper' onSubmit={this.handleSubmit} style={this.styles.container}>
				<div className='valign center'>
					<h1>Share through Email</h1>
					<input type='email' name='email' required />
					<div>
						<input type='button' onClick={this.handleCancel} value='Cancel' />
						<button type='submit'>Submit</button>
					</div>
				</div>
			</form>
		)
	},
	handleCancel: function(evt) {
		dispatcher.dispatch({ type: 'hideShareForm' });
	},
	handleSubmit: function(evt) {
		evt.preventDefault();

		var form = evt.target;
		$.ajax({
			url: '/share',
			method: 'POST',
			data: $(form).serialize(),
		}).done(function(resp) {
			alert('We\'ve emailed the photograph to your email address!');
			dispatcher.dispatch({ type: 'hideShareForm' });
		}).fail(function(resp) {
			alert('Sorry! We encountered problem while sending the photograph to your email address.');
			dispatcher.dispatch({ type: 'hideShareForm' });
		});
	},
});

ReactDOM.render(<App />, document.getElementById('root'));
