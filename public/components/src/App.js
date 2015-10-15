var $        = require('jquery');
var React    = require('react');
var ReactDOM = require('react-dom');
var Flux     = require('flux');
var Carousel = require('nuka-carousel');
var cx       = require('classnames');
var update   = require('react-addons-update');

var dispatcher = new Flux.Dispatcher();

function m(a, b) {
	if (!a) {
		a = {};
	}

	if (!b) {
		return a;
	}

	return update(a, { $merge: b });
}

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

var StepOne = React.createClass({
	styles: {
		container: {
			display: 'flex',
			flex: '0 0 100%',
			background: 'linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(images/bg.jpg) center / cover',
		},
	},
	render: function() {
		return (
			<div style={this.styles.container}>
				<StepOne.Examples />
				<StepOne.Intro />
			</div>
		)
	},
});

StepOne.Examples = React.createClass({
	styles: {
		container: {
			display: 'flex',
			flex: '0 0 60%',
			alignItems: 'center',
			justifyContent: 'center',
		},
		inner: {
			display: 'flex',
			flex: '0 0 90%',
			alignItems: 'center',
		},
	},
	render: function() {
		return (
			<div style={this.styles.container}>
				<div style={this.styles.inner}>
					<Carousel decorators={[]}>{
						this.state.photos.map(function(photo) {
							return <img key={photo} className='center' src={photo} width='512' />
						})
					}</Carousel>
				</div>
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
			display: 'flex',
			flex: '0 0 40%',
			alignItems: 'center',
			textAlign: 'center',
		},
	},
	render: function() {
		return (
			<div style={this.styles.container}>
				<div style={this.styles.inner}>
					<h1>CIRCLE OF LIGHT</h1>
					<h3>Create your own light painting now</h3>
					<button onClick={this.handleClick}>START</button>
				</div>
			</div>
		)
	},
	handleClick: function() {
		dispatcher.dispatch({ type: 'gotoStep', step: 'two' });
	},
});

var Header = React.createClass({
	styles: {
		container: {
			display: 'flex',
			flex: '0 0 10%',
			flexDirection: 'row',
			alignItems: 'stretch',
		},
		column: {
			display: 'flex',
			flex: '1 1 33%',
			alignItems: 'center',
			justifyContent: 'center',
			borderTop: '8px solid #636363',
		},
		activeColumn: {
			color: 'white',
			borderTop: '8px solid #2cb976',
		},
		text: {
			color: '#636363',
		},
		activeText: {
			color: '#2cb976',
		},
	},
	render: function() {
		var tab = this.props.tab;
		var column = this.styles.column;
		var text = this.styles.text;
		var activeColumn = this.styles.activeColumn;
		var activeText = this.styles.activeText;
		return (
			<div className={cx(this.props.className)} style={this.styles.container}>
				<div style={m(column, tab === 'one' && activeColumn)}>
					<h3 style={m(text, tab === 'one' && activeText)}>STEP 1 CHOOSE YOUR IMAGE</h3>
				</div>
				<div style={m(column, tab === 'two' && activeColumn)}>
					<h3 style={m(text, tab === 'two' && activeText)}>STEP 2 TAKE PHOTO</h3>
				</div>
				<div style={m(column, tab === 'three' && activeColumn)}>
					<h3 style={m(text, tab === 'three' && activeText)}>STEP 3: SHARE PHOTO</h3>
				</div>
			</div>
		)
	},
});

var StepTwo = React.createClass({
	styles: {
		container: {
			display: 'flex',
			flex: '0 0 100%',
			flexDirection: 'column',
		},
	},
	render: function() {
		var category = this.state.category;
		var categories = this.state.categories;
		if (categories.length == 0) {
			return null;
		}

		var path = categories.length > 0 ? categories[category].path : '';
		var images = categories.length > 0 ? categories[category].images : [];
		return (
			<div style={this.styles.container}>
				<Header tab='one' />
				<StepTwo.Tabs category={categories[category].name} categories={categories} />
				<StepTwo.Gallery path={path} images={images} selectedImagePath={this.state.imagePath} />
				<StepTwo.Buttons selectedImagePath={this.state.imagePath} />
			</div>
		)
	},
	getInitialState: function() {
		return { category: 0, categories: [], imagePath: null }
	},
	componentDidMount: function() {
		$.ajax({
			url: '/images',
			method: 'GET',
		}).done(function(resp) {
			this.setState({ categories: resp });
		}.bind(this)).fail(function(resp) {
			console.log(resp);
		}.bind(this));

		this.listenerID = dispatcher.register(function(payload) {
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
		}.bind(this));
	},
	componentWillUnmount: function() {
		dispatcher.unregister(this.listenerID);
	},
});

StepTwo.Tabs = React.createClass({
	styles: {
		container: {
			display: 'flex',
			flexDirection: 'row',
			margin: '0 16px',
		},
		tab: {
			flex: '1 1',
			textTransform: 'uppercase',
			textAlign: 'center',
			cursor: 'pointer',
			borderBottom: '1px solid white',
		},
		activeTab: {
			borderBottom: '8px solid #2cb976',
		},
	},
	render: function() {
		return (
			<div style={this.styles.container}>{
				this.props.categories.map(function(category) {
					var titleStyle = m(this.styles.tab, this.props.category == category.name && this.styles.activeTab);
					return <h3 key={category.name} style={titleStyle} onClick={this.handleClick.bind(this, category.name)}>{category.name}</h3>
				}.bind(this))
			}</div>
		)
	},
	handleClick: function(category) {
		dispatcher.dispatch({ type: 'changeCategory', category: category });
	},
});

StepTwo.Gallery = React.createClass({
	mixins: [ Carousel.ControllerMixin ],
	styles: {
		container: {
			display: 'flex',
			flex: '1 1 70%',
			flexWrap: 'wrap',
			flexDirection: 'row',
			margin: '0 16px',
			overflowY: 'scroll',
		},
		imageContainer: {
			display: 'flex',
			flex: '0 1 20%',
			alignItems: 'flex-start',
			justifyContent: 'space-between',
		},
		image: {
			maxWidth: '90%',
			maxHeight: '90%',
			marginBottom: '8px',
			border: '8px solid black',
			cursor: 'pointer',
		},
		selectedImage: {
			border: '8px solid #2cb976',
		},
	},
	render: function() {
		return (
			<div style={this.styles.container}>{
				this.props.images.map(function(image) {
					var imagePath = this.props.path + '/' + image;
					var imageStyle = m(this.styles.image, this.props.selectedImagePath == imagePath && this.styles.selectedImage);
					return (
						<div key={imagePath} style={this.styles.imageContainer}>
							<img src={imagePath} style={imageStyle} onClick={this.handleClick.bind(this, imagePath)} />
						</div>
					)
				}.bind(this))
			}</div>
		)
	},
	handleClick: function(imagePath) {
		dispatcher.dispatch({ type: 'clickedImage', imagePath: imagePath });
	},
});

StepTwo.Buttons = React.createClass({
	styles: {
		container: {
			display: 'block',
			margin: '0 auto',
		},
	},
	render: function() {
		return (
			<div style={this.styles.container}>
				<button onClick={this.handleBack}>BACK</button>
				<button onClick={this.handleSurprise}>SURPRISE ME</button>
				<button onClick={this.handleNext}>NEXT</button>
			</div>
		)
	},
	handleSurprise: function() {
		dispatcher.dispatch({ type: 'surprise' });
	},
	handleNext: function() {
		if (!this.props.selectedImagePath) {
			alert('You must select an image first!');
			return;
		}
		dispatcher.dispatch({ type: 'gotoStep', step: 'three', image: this.props.selectedImagePath });
	},
	handleBack: function() {
		dispatcher.dispatch({ type: 'gotoStep', step: 'one' });
	},
});

var StepThree = React.createClass({
	styles: {
		container: {
			display: 'flex',
			flex: '0 0 100%',
			flexDirection: 'column',
		},
	},
	render: function() {
		var elem;
		if (this.state.ready) {
			elem = <StepThree.GoingToTakePhoto image={this.props.image} />
		} else {
			elem = <StepThree.GettingReady />
		}
		return (
			<div style={this.styles.container}>
				<Header tab='two' />
				{ elem }
			</div>
		)
	},
	getInitialState: function() {
		return { ready: false };
	},
	componentDidMount: function() {
		this.listenerID = dispatcher.register(function(payload) {
			switch (payload.type) {
			case 'setReady':
				this.setState({ ready: true });
				break;
			}
		}.bind(this));
	},
	componentWillUnmount: function() {
		dispatcher.unregister(this.listenerID);
	},
});

StepThree.GettingReady = React.createClass({
	styles: {
		container: {
			display: 'flex',
			flex: '1 1 80%',
			flexDirection: 'column',
		},
		titleContainer: {
			display: 'flex',
			flex: '0 0 20%',
			flexWrap: 'wrap',
			justifyContent: 'center',
		},
		title: {
			maxWidth: '80%',
			textAlign: 'center',
		},
		imageContainer: {
			display: 'flex',
			flex: '1 1 256px',
			justifyContent: 'center',
		},
		image: {
			maxHeight: 'auto',
			objectFit: 'contain',
		},
		buttonContainer: {
			flex: '0 0 20%',
			textAlign: 'center',
		},
	},
	render: function() {
		return (
			<div style={this.styles.container}>
				<div style={this.styles.titleContainer}>
					<h1 style={this.styles.title}>PLEASE STAND INFRONT OF THE LED STICK AND DON&#39;T MOVE FOR 5 SECONDS</h1>
				</div>
				<div style={this.styles.imageContainer}>
					<img src='images/standing_demo.jpg' style={this.styles.image} />
				</div>
				<div style={this.styles.buttonContainer}>
					<button style={this.styles.button} onClick={this.handleBack}>BACK</button>
					<button style={this.styles.button} onClick={this.handleReady}>READY</button>
				</div>
			</div>
		)
	},
	handleReady: function() {
		dispatcher.dispatch({ type: 'setReady' });
	},
	handleBack: function() {
		dispatcher.dispatch({ type: 'gotoStep', step: 'two', });
	},
});

StepThree.GoingToTakePhoto = React.createClass({
	styles: {
		container: {
			display: 'flex',
			flex: '1 1 80%',
			flexDirection: 'column',
		},
		titleContainer: {
			display: 'flex',
			flex: '0 0 20%',
			justifyContent: 'center',
		},
		title: {
			fontSize: '5vh',
		},
		numberContainer: {
			display: 'flex',
			flex: '0 0 80%',
			justifyContent: 'center',
		},
		number: {
			fontSize: '50vh',
			margin: 0,
		},
	},
	render: function() {
		return (
			<div style={this.styles.container}>
				<div style={this.styles.titleContainer}>
					<h1 style={this.styles.title}>PHOTO TAKING IN...</h1>
				</div>
				<div style={this.styles.numberContainer}>
					<p style={this.styles.number}>{this.state.counter}</p>
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
			clearTimeout(this.counterID);
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
		dispatcher.dispatch({ type: 'gotoStep', step: 'two' });
	},
});

var StepFour = React.createClass({
	styles: {
		container: {
			display: 'flex',
			flex: '0 0 100%',
			flexDirection: 'column',
		},
	},
	render: function() {
		var elem;
		if (this.state.showShareForm) {
			elem = <StepFour.Form show={this.state.showShareForm} />
		} else {
			elem = <StepFour.Result resultPhoto={this.props.resultPhoto} />
		}
		return (
			<div style={this.styles.container}>
				<Header tab='three' />
				{ elem }
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
	styles: {
		container: {
			display: 'flex',
			flex: '0 0 80%',
			flexDirection: 'column',
		},
		title: {
			flex: '0 0 20%',
			textAlign: 'center',
		},
		imageContainer: {
			display: 'flex',
			flex: '1 1 0%',
			justifyContent: 'center',
		},
		image: {
			border: '4px solid white',
		},
		buttonsContainer: {
			flex: '0 0 20%',
			flexDirection: 'row',
			textAlign: 'center',
			justifyContent: 'center',
		},
	},
	render: function() {
		return (
			<div style={this.styles.container}>
				<h1 style={this.styles.title}>HERE IS YOUR PHOTO</h1>
				<div style={this.styles.imageContainer}>
					<img src={this.props.resultPhoto} style={this.styles.image} />
				</div>
				<div style={this.styles.buttonsContainer}>
					<button onClick={this.handleRetake}>RETAKE</button>
					<button onClick={this.handleShare}>SHARE</button>
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
			display: 'flex',
			flexDirection: 'column',
			alignItems: 'center',
		},
		titleContainer: {
			flex: '0 0 20%',
			textAlign: 'center',
		},
		socialContainer: {
			display: 'flex',
			flex: '0 0 20%',
			flexDirection: 'row',
			justifyContent: 'space-between',
		},
		facebook: {
			width: '128px',
			height: '128px',
			backgroundColor: '#3B5998',
			backgroundImage: 'url(icons/facebook/facebook-128.png)',
			margin: '0 16px',
		},
		twitter: {
			width: '128px',
			height: '128px',
			backgroundColor: '#00ACED',
			backgroundImage: 'url(icons/twitter/twitter-128.png)',
			margin: '0 16px',
		},
		emailContainer: {
			display: 'flex',
			flex: '0 0 30%',
			flexDirection: 'row',
			alignItems: 'center',
			justifyContent: 'center',
			textAlign: 'center',
			width: '60%',
			margin: '64px 0',
		},
		emailInput: {
			flex: '1 1 70%',
			height: '3rem',
			marginRight: '8px',
			background: '#f3f3f3',
			borderWidth: 0,
			paddingLeft: '16px',
			color: 'black',
			fontWeight: 'bold',
		},
		emailButton: {
			flex: '0 0 30%',
			height: '3rem',
			borderWidth: 0,
			fontWeight: 'bold',
			color: 'black',
			cursor: 'pointer',
		},
		completeContainer: {
			flex: '0 0 20%',
			textAlign: 'center',
		},
	},
	render: function() {
		return (
			<form onSubmit={this.handleSubmit} style={this.styles.container}>
				<div style={this.styles.titleContainer}>
					<h1>SHARE YOUR PHOTO WITH FRIENDS</h1>
				</div>
				<div style={this.styles.socialContainer}>
					<div style={this.styles.facebook} />
					<div style={this.styles.twitter} />
				</div>
				<div style={this.styles.emailContainer}>
					<input type='email' name='email' placeholder=' EMAIL ADDRESS' style={this.styles.emailInput} required />
					<input type='submit' value='SUBMIT' style={this.styles.emailButton} />
				</div>
				<div style={this.styles.completeContainer}>
					<button type='submit' onClick={this.handleDone}>DONE</button>
					<button onClick={this.handleCancel}>CANCEL</button>
				</div>
			</form>
		)
	},
	handleDone: function(evt) {
		dispatcher.dispatch({ type: 'gotoStep', step: 'one' });
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
