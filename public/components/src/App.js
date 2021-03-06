var $        = require('jquery');
var React    = require('react');
var ReactDOM = require('react-dom');
var Flux     = require('flux');
var Carousel = require('nuka-carousel');
var cx       = require('classnames');
var update   = require('react-addons-update');

var dispatcher = new Flux.Dispatcher();

window.fbAsyncInit = function() {
	FB.init({
		appId      : '1504892069826912',
		xfbml      : true,
		version    : 'v2.5'
	});
};
(function(d, s, id){
 var js, fjs = d.getElementsByTagName(s)[0];
	 if (d.getElementById(id)) {return;}
	 js = d.createElement(s); js.id = id;
	 js.src = "//connect.facebook.net/en_US/sdk.js";
	 fjs.parentNode.insertBefore(js, fjs);
 }(document, 'script', 'facebook-jssdk'));

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
	render: function() {
		var elem;

		switch (this.state.step) {
		case 'one':
			elem = <StepOne />; break;
		case 'two':
			elem = <StepTwo />; break;
		case 'three':
			elem = <StepThree selectedImage={this.state.selectedImage} />; break;
		case 'four':
			elem = <StepFour resultPhoto={this.state.resultPhoto} />; break;
		}

		return elem;
	},
	getInitialState: function() {
		return { step: 'one', selectedImage: null, resultPhoto: null }
	},
	componentDidMount: function() {
		this.listenerID = dispatcher.register(function(payload) {
			switch (payload.type) {
			case 'gotoStep':
				if ((payload.step == 'three' && !payload.selectedImage) ||
				    (payload.step == 'four' && !payload.resultPhoto)) {
					break;
				}
				this.setState({ step: payload.step, selectedImage: payload.selectedImage, resultPhoto: payload.resultPhoto });
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
			WebkitFlex: '0 0 100%',
			msFlex: '0 0 100%',
			flex: '0 0 100%',
			background: 'linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(images/bg.jpg) center / cover',
		},
	},
	render: function() {
		return (
			<div className='flex' style={this.styles.container}>
				<StepOne.Examples />
				<StepOne.Intro />
			</div>
		)
	},
});

StepOne.Examples = React.createClass({
	styles: {
		container: {
			WebkitFlex: '0 0 60%',
			msFlex: '0 0 60%',
			flex: '0 0 60%',
		},
		inner: {
			WebkitFlex: '0 0 80%',
			msFlex: '0 0 90%',
			flex: '0 0 90%',
			overflow: 'hidden',
		},
		image: {
			pointerEvents: 'none',
		},
	},
	render: function() {
		return (
			<div className='flex align-center justify-center' style={this.styles.container}>
				<div className='flex row align-center' style={this.styles.inner}>
					<Carousel decorators={[]}>{
						this.state.photos.map(function(photo) {
							return <img key={photo} className='center' src={photo} width='512' style={this.styles.image} />
						}.bind(this))
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
			WebkitFlex: '0 0 90%',
			msFlex: '0 0 90%',
			flex: '0 0 40%',
		},
		inner: {
			flex: '1 1 100%',
			textAlign: 'center',
		},
	},
	render: function() {
		return (
			<div className='flex align-center' style={this.styles.container}>
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
			WebkitFlex: '0 0 10%',
			msFlex: '0 0 10%',
			flex: '0 0 10%',
		},
		column: {
			WebkitFlex: '1 1 33.33%',
			msFlex: '1 1 33.33%',
			flex: '1 1 33.33%',
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
			<div className={cx('flex row align-center', this.props.className)} style={this.styles.container}>
				<div className='flex align-center justify-center' style={m(column, tab === 'one' && activeColumn)}>
					<h3 style={m(text, tab === 'one' && activeText)}>STEP 1 CHOOSE YOUR IMAGE</h3>
				</div>
				<div className='flex align-center justify-center' style={m(column, tab === 'two' && activeColumn)}>
					<h3 style={m(text, tab === 'two' && activeText)}>STEP 2 TAKE PHOTO</h3>
				</div>
				<div className='flex align-center justify-center' style={m(column, tab === 'three' && activeColumn)}>
					<h3 style={m(text, tab === 'three' && activeText)}>STEP 3: SHARE PHOTO</h3>
				</div>
			</div>
		)
	},
});

var StepTwo = React.createClass({
	styles: {
		container: {
			WebkitFlex: '0 0 100%',
			msFlex: '0 0 100%',
			flex: '0 0 100%',
		},
	},
	render: function() {
		var category = this.state.category;
		var categories = this.state.categories;
		categories.push({ name: "search" });

		var path = categories.length > 0 ? categories[category].path : '';
		var images = categories.length > 0 ? categories[category].images : [];
		return (
			<div className='flex column' style={this.styles.container}>
				<Header tab='one' />
				<StepTwo.Tabs category={categories[category].name} categories={categories} />
				<StepTwo.Gallery category={categories[category].name} path={path} images={images} selectedImagePath={this.state.imagePath} />
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
			margin: '0 16px',
		},
		tab: {
			WebkitFlex: '1 1',
			msFlex: '1 1',
			flex: '1 1',
			textTransform: 'uppercase',
			textAlign: 'center',
			cursor: 'pointer',
			paddingBottom: '8px',
			borderBottom: '1px solid white',
			transition: 'border-bottom .2s, padding-bottom .2s',
		},
		activeTab: {
			paddingBottom: '1px',
			borderBottom: '8px solid #2cb976',
		},
	},
	render: function() {
		return (
			<div className='flex row' style={this.styles.container}>{
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
			WebkitFlex: '1 1 70%',
			msFlex: '1 1 70%',
			flex: '1 1 70%',
			flexWrap: 'wrap',
			margin: '0 16px',
			overflowY: 'scroll',
		},
		imageContainer: {
			WebkitFlex: '0 1 20%',
			msFlex: '0 1 20%',
			flex: '0 1 20%',
		},
		image: {
			maxHeight: '256px',
			marginBottom: '8px',
			border: '8px solid black',
			cursor: 'pointer',
			pointerEvents: 'none',
			imageRendering: 'pixelated',
		},
		selectedImage: {
			border: '8px solid #2cb976',
		},
	},
	render: function() {
		if (this.props.category == 'search') {
			return <StepTwo.Search selectedImage={this.props.selectedImagePath} />
		}
		return (
			<div className='flex row' style={this.styles.container}>{
				this.props.images.map(function(image) {
					var imagePath = this.props.path + '/' + image;
					var imageStyle = m(this.styles.image, this.props.selectedImagePath == imagePath && this.styles.selectedImage);
					return (
						<div key={imagePath} className='flex row align-start justify-between' style={this.styles.imageContainer} onClick={this.handleClick.bind(this, imagePath)} >
							<img src={imagePath} style={imageStyle} />
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

StepTwo.Search = React.createClass({
	render: function() {
		return (
			<div className='flex column' style={this.styles.container}>
				<input type='text' placeholder="SEARCH THE WEB" style={this.styles.search} onChange={this.handleChange} />
				{ this.state.searching ? <StepTwo.Search.Loading /> : <StepTwo.Search.Results searching={this.state.searching} images={this.state.images} selectedImage={this.props.selectedImage} /> }
			</div>
		)
	},
	getInitialState: function() {
		return { images: [], searching: false };
	},
	styles: {
		container: {
			WebkitFlex: '1 1 70%',
			msFlex: '1 1 70%',
			flex: '1 1 70%',
			margin: '0 16px',
			overflowY: 'hidden',
		},
		search: {
			color: '#111111',
			padding: '16px',
			width: '50%',
			margin: '0 auto',
			fontWeight: 'bold',
			textTransform: 'uppercase',
		},
	},
	handleChange: function(event) {
		clearTimeout(this.searchTimerID);

		if (event.target.value.length <= 2) {
			return;
		}

		this.searchTimerID = setTimeout(function() {
			this.setState({ searching: true });

			$.ajax({
				url: '/search',
				method: 'GET',
				data: { keyword: event.target.value },
				dataType: 'json',
			}).done(function(data) {
				this.setState({ images: data, searching: false });
			}.bind(this)).fail(function(resp) {
				this.setState({ images: [], searching: false });
			}.bind(this));
		}.bind(this), 1000);
	},
});

StepTwo.Search.Loading = React.createClass({
	render: function() {
		return (
			<div className='flex row justify-center' style={this.styles.container}>
				<h1>Loading</h1>
			</div>
		)
	},
	styles: {
		container: {
			WebkitFlex: '1 1 70%',
			msFlex: '1 1 70%',
			flex: '1 1 70%',
			flexWrap: 'wrap',
			padding: '16px',
			overflowY: 'scroll',
		},
	},
});

StepTwo.Search.Results = React.createClass({
	render: function() {
		return (
			<div className='flex row' style={this.styles.container}>{
				this.props.images.map(function(image, i) {
					var imagePath = image.MediaUrl;
					var thumbnailPath = image.Thumbnail.MediaUrl;
					var imageStyle = m(this.styles.image, this.props.selectedImage == imagePath && this.styles.selectedImage);
					return (
						<div key={image.ID} className='flex row align-start justify-between' style={this.styles.imageContainer} onClick={this.handleClick.bind(this, imagePath)} >
							<img src={thumbnailPath} style={imageStyle} />
						</div>
					)
				}.bind(this))
			}</div>
		)
	},
	styles: {
		container: {
			WebkitFlex: '1 1 70%',
			msFlex: '1 1 70%',
			flex: '1 1 70%',
			flexWrap: 'wrap',
			padding: '16px',
			overflowY: 'scroll',
		},
		imageContainer: {
			WebkitFlex: '0 1 20%',
			msFlex: '0 1 20%',
			flex: '0 1 20%',
		},
		image: {
			maxHeight: '256px',
			marginBottom: '8px',
			border: '8px solid black',
			cursor: 'pointer',
			pointerEvents: 'none',
			imageRendering: 'pixelated',
		},
		selectedImage: {
			border: '8px solid #2cb976',
		},
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
		dispatcher.dispatch({ type: 'gotoStep', step: 'three', selectedImage: this.props.selectedImagePath });
	},
	handleBack: function() {
		dispatcher.dispatch({ type: 'gotoStep', step: 'one' });
	},
});

var StepThree = React.createClass({
	styles: {
		container: {
			WebkitFlex: '0 0 100%',
			msFlex: '0 0 100%',
			flex: '0 0 100%',
		},
	},
	render: function() {
		var elem;
		if (this.state.ready) {
			elem = <StepThree.GoingToTakePhoto selectedImage={this.props.selectedImage} />
		} else {
			elem = <StepThree.GettingReady />
		}
		return (
			<div className='flex column' style={this.styles.container}>
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
			WebkitFlex: '1 1 60%',
			msFlex: '1 1 60%',
			flex: '1 1 60%',
		},
		titleContainer: {
			WebkitFlex: '0 0 20%',
			msFlex: '0 0 20%',
			flex: '0 0 20%',
			flexWrap: 'wrap',
		},
		title: {
			maxWidth: '80%',
			textAlign: 'center',
		},
		imageContainer: {
			WebkitFlex: '0 1 20%',
			msFlex: '0 1 20%',
			flex: '0 1 20%',
		},
		image: {
			maxHeight: '384px',
			objectFit: 'contain',
		},
		buttonContainer: {
			WebkitFlex: '0 0 20%',
			msFlex: '0 0 20%',
			flex: '0 0 20%',
			textAlign: 'center',
		},
	},
	render: function() {
		return (
			<div className='flex column' style={this.styles.container}>
				<div className='flex justify-center' style={this.styles.titleContainer}>
					<h1 style={this.styles.title}>PLEASE STAND INFRONT OF THE LED STICK AND DON&#39;T MOVE FOR 5 SECONDS</h1>
				</div>
				<div className='flex justify-center' style={this.styles.imageContainer}>
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
			WebkitFlex: '1 1 80%',
			msFlex: '1 1 80%',
			flex: '1 1 80%',
		},
		titleContainer: {
			WebkitFlex: '0 0 20%',
			msFlex: '0 0 20%',
			flex: '0 0 20%',
		},
		title: {
			fontSize: '5vh',
		},
		numberContainer: {
			WebkitFlex: '0 0 80%',
			msFlex: '0 0 80%',
			flex: '0 0 80%',
		},
		number: {
			fontSize: '50vh',
			margin: 0,
		},
	},
	render: function() {
		return (
			<div className='flex column' style={this.styles.container}>
				<div className='flex justify-center' style={this.styles.titleContainer}>
					<h1 style={this.styles.title}>PHOTO TAKING IN...</h1>
				</div>
				<div className='flex justify-center' style={this.styles.numberContainer}>
					<p style={this.styles.number}>{this.state.counter}</p>
				</div>
			</div>
		)
	},
	getInitialState: function() {
		return { counter: 5 };
	},
	componentDidMount: function() {
		this.counterID = setInterval(this.countDown, 1000);
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
			data: { image: this.props.selectedImage },
		}).done(function(filename) {
			filename = filename.substring(7, filename.length); 
			setTimeout(function() {
				dispatcher.dispatch({ type: 'gotoStep', step: 'four', resultPhoto: filename });
			}, 5000);
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
			WebkitBoxFlex: '0 0 100%',
			WebkitFlex: '0 0 100%',
			msFlex: '0 0 100%',
			flex: '0 0 100%',
		},
	},
	render: function() {
		var elem;
		if (this.state.showShareForm) {
			elem = <StepFour.Form resultPhoto={this.props.resultPhoto} show={this.state.showShareForm} />
		} else {
			elem = <StepFour.Result resultPhoto={this.props.resultPhoto} />
		}
		return (
			<div className='flex column' style={this.styles.container}>
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
			WebkitFlex: '0 0 80%',
			msFlex: '0 0 80%',
			flex: '0 0 80%',
		},
		title: {
			WebkitFlex: '0 0 10%',
			msFlex: '0 0 10%',
			flex: '0 0 10%',
			textAlign: 'center',
		},
		imageContainer: {
			WebkitFlex: '1 1 20%',
			msFlex: '1 1 20%',
			flex: '1 1 20%',
		},
		image: {
			border: '4px solid white',
			maxHeight: '384px',
			imageRendering: 'pixelated',
		},
		buttonsContainer: {
			WebkitFlex: '0 0 20%',
			msFlex: '0 0 20%',
			flex: '0 0 20%',
			textAlign: 'center',
		},
	},
	render: function() {
		return (
			<div className='flex column' style={this.styles.container}>
				<h1 style={this.styles.title}>HERE IS YOUR PHOTO</h1>
				<div className='flex justify-center' style={this.styles.imageContainer}>
					<img id='photo' src={this.props.resultPhoto} style={this.styles.image} />
				</div>
				<div className='row justify-center' style={this.styles.buttonsContainer}>
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
	styles: {
		container: {
			WebkitFlexDirection: 'column',
			msFlexDirection: 'column',
			flexDirection: 'column',
			WebkitAlignItems: 'center',
			msAlignItems: 'center',
			alignItems: 'center',
		},
		titleContainer: {
			WebkitFlex: '0 0 20%',
			msFlex: '0 0 20%',
			flex: '0 0 20%',
			textAlign: 'center',
		},
		socialContainer: {
			WebkitFlex: '0 0 20%',
			msFlex: '0 0 20%',
			flex: '0 0 20%',
			WebkitFlexDirection: 'row',
			msFlexDirection: 'row',
			flexDirection: 'row',
			WebkitJustifyContent: 'center',
			msJustifyContent: 'center',
			justifyContent: 'space-between',
		},
		facebook: {
			width: '128px',
			height: '128px',
			backgroundColor: '#3B5998',
			backgroundImage: 'url(icons/facebook/facebook-128.png)',
			margin: '0 16px',
			cursor: 'pointer',
		},
		twitter: {
			width: '128px',
			height: '128px',
			backgroundColor: '#00ACED',
			backgroundImage: 'url(icons/twitter/twitter-128.png)',
			margin: '0 16px',
			cursor: 'pointer',
			opacity: 0.2,
		},
		emailContainer: {
			WebkitFlex: '0 0 30%',
			msFlex: '0 0 30%',
			flex: '0 0 30%',
			WebkitFlexDirection: 'row',
			msFlexDirection: 'row',
			flexDirection: 'row',
			WebkitAlignItems: 'center',
			msAlignItems: 'center',
			alignItems: 'center',
			WebkitJustifyContent: 'center',
			msJustifyContent: 'center',
			justifyContent: 'center',
			textAlign: 'center',
			width: '60%',
			margin: '64px 0',
		},
		emailInput: {
			WebkitFlex: '1 1 70%',
			msFlex: '1 1 70%',
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
			WebkitFlex: '0 0 30%',
			msFlex: '0 0 30%',
			flex: '0 0 30%',
			height: '3rem',
			borderWidth: 0,
			fontWeight: 'bold',
			color: 'black',
			cursor: 'pointer',
		},
		sendingEmail: {
			background: 'black',
			color: 'white',
		},
		completeContainer: {
			WebkitFlex: '0 0 20%',
			msFlex: '0 0 20%',
			flex: '0 0 20%',
			textAlign: 'center',
		},
	},
	render: function() {
		return (
			<form ref='form' className='flex' style={this.styles.container} onSubmit={function(evt) { evt.preventDefault(); }}>
				<div style={this.styles.titleContainer}>
					<h1>SHARE YOUR PHOTO WITH FRIENDS</h1>
				</div>
				<div className='flex' style={this.styles.socialContainer}>
					<div style={this.styles.facebook} onClick={this.handleFacebookShare} />
					<div style={this.styles.twitter} onClick={this.handleTwitterShare} />
				</div>
				<div className='flex' style={this.styles.emailContainer}>
					<input type='email' name='email' placeholder=' OR SEND TO EMAIL ADDRESS' style={this.styles.emailInput} required />
					<input type='hidden' name='photo' value={this.props.resultPhoto} />
					<input type='submit' value={this.state.sendingEmail ? 'Sending..' : 'SUBMIT'} style={m(this.styles.emailButton, this.state.sendingEmail && this.styles.sendingEmail)} onClick={this.handleEmail} />
				</div>
				<div style={this.styles.completeContainer}>
					<button onClick={this.handleDone}>DONE</button>
					<button onClick={this.handleCancel}>CANCEL</button>
				</div>
			</form>
		)
	},
	getInitialState: function() {
		return { photoURL: null, sendingEmail: false };
	},
	componentDidMount: function() {
		var image = new Image();
		image.onload = function() {
			var canvas = document.createElement('canvas');
			canvas.width = image.naturalWidth;
			canvas.height = image.naturalHeight;
			canvas.getContext('2d').drawImage(image, 0, 0);
			this.setState({ photoURL: canvas.toDataURL('image/jpg') });
		}.bind(this);
		image.src = this.props.resultPhoto;
	},
	handleDone: function(evt) {
		dispatcher.dispatch({ type: 'gotoStep', step: 'one' });
	},
	handleCancel: function(evt) {
		dispatcher.dispatch({ type: 'hideShareForm' });
	},
	handleEmail: function(evt) {
		evt.preventDefault();

		this.setState({ sendingEmail: true });

		var data = $(this.refs.form).serialize()
		$.ajax({
			url: '/email',
			method: 'POST',
			data: data,
		}).done(function(resp) {
			this.setState({ sendingEmail: false });
			alert('We\'ve emailed the photograph to your email address!');
		}.bind(this)).fail(function(resp) {
			this.setState({ sendingEmail: false });
			alert('Sorry! We encountered problem while sending the photograph to your email address.');
		}.bind(this));
	},
	handleFacebookShare: function() {
		var share = function() {
			FB.login(function(response) {
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
					$.ajax({
						url: "https://graph.facebook.com/me/photos?access_token=" + accessToken,
						type: "POST",
						data: fd,
						processData: false,
						contentType: false,
						cache: false,
						success: function (data) {
							alert('Shared the photo on Facebook!');
						},
						error: function (shr, status, data) {
							console.log("error " + data + " Status " + shr.status);
							alert('Failed to share the photo on Facebook.');
						},
					});
				} else {
					// Didn't login to Facebook
				}
			}.bind(this), { scope: 'publish_actions' });
		}.bind(this);

		FB.getLoginStatus(function(response) {
			if (response.status === 'connected') {
				FB.logout(function(response) {
					share();
				});
			} else {
				share();
			}
		});
	},
	handleTwitterShare: function() {
		
	},
});

ReactDOM.render(<App />, document.getElementById('root'));
