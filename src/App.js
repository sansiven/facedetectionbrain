import React, { Component } from 'react';
import Particles from 'react-particles-js';
import Signin from './Components/Signin/Signin';
import Register from './Components/Register/Register';
import FaceRecognition from './Components/FaceRecognition/FaceRecognition' ;
import Navigation from './Components/Navigation/Navigation';
import Logo from './Components/Logo/Logo' ;
import Rank from './Components/Rank/Rank' ;
import ImageLinkForm from './Components/ImageLinkForm/ImageLinkForm' ;
import './App.css';


const particlesOption = {
  particles: {
    number:{
      value:50,
      density:{
        enable:true,
        value_area: 300
      }
    }
  }
}

const initialState = {
  input:'',
  imageUrl:'',
  box: {},
  route: 'signin',
  isSignedIn: false,
  user : {
    id: '',
    name: '',
    email: '',
    entries: 0,
    joined: ''
  }
}


class App extends Component {
  constructor(){
    super();
    this.state= initialState;

    }
  

  loadUser = (data) => {
    this.setState({user:{
      id: data.id,
      name: data.name,
      email: data.email,
      entries: data.entries,
      joined: data.joined
    }

    })
  }
  

 calculateFaceLocation = (data) => {
		const clarifaiface = data.outputs[0].data.regions[0].region_info.bounding_box;
		
		//aafaile pracctice gareko demographics dekhauna lai
		const clarifaiage = data.outputs[0].data.regions[0].data.face.age_appearance.concepts[0].name;
 	  const clarifaigender = data.outputs[0].data.regions[0].data.face.gender_appearance.concepts[0].name;
 	  const clarifaiculture = data.outputs[0].data.regions[0].data.face.multicultural_appearance.concepts[0].name;
		console.log(clarifaiage, clarifaigender);
 	  //--------------------------------------//
		const image = document.getElementById('inputImage');
		const width = Number(image.width);
		const height = Number(image.height);
		return{
			leftCol: clarifaiface.left_col * width,
			topRow : clarifaiface.top_row *height,
			rightCol: width - (clarifaiface.right_col * width),
			bottomRow : height - (clarifaiface.bottom_row * height),
			//---------------------------------		
			age: clarifaiage,
 	 	  gender: clarifaigender,
 	 	  culture: clarifaiculture,
		}
  }

 /*calculateOther = (data) => {
 	 const clarifaiage = data.outputs[0].data.regions[0].data.face.age_appearance.concepts[0];
 	 const clarifaigender = data.outputs[0].data.regions[0].data.face.gender_appearance.concepts[0];
 	 const clarifaiculture = data.outputs[0].data.regions[0].data.face.multicultural_appearance.concepts[0];
 	 return {
 	 	age: clarifaiage,
 	 	gender: clarifaigender,
 	 	culture: clarifaiculture,
 	 } 
 }
 practice gareko
 */


  displayFaceBox = (box) =>{
  	this.setState({box: box})
  }

  onInputChange = (event)=>{
    this.setState({input: event.target.value});
  }

  onButtonSubmit = ()=>{
    this.setState({imageUrl: this.state.input})
    fetch('https://git.heroku.com/arcane-mountain-49517.git/imageurl', {
          method: 'post',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
            input: this.state.input
          })
        })
    .then(response => response.json())
    .then(response => {
      if (response) {
       fetch('https://git.heroku.com/arcane-mountain-49517.git/image', {
          method: 'put',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
            id: this.state.user.id
          })
        })
          .then(response => response.json()) //database ma record namiler aako error check database once :)
          .then(count => {
            this.setState(Object.assign(this.state.user, { entries: count}))
         })
         .catch(console.log) 
        /*.then(response => response.json())
        .then(count => {
            alternative to this, cuz this code changes the entire user object but wwe only need to change user entries so
              this.setState({user:{ 
              entries: count
          this.setState(Object.assign(this.state.user, {entries: count}))
        })*/
      }
      this.displayFaceBox(this.calculateFaceLocation(response))
    })
    .catch(err => console.log(err));
  }
  
  onRouteChange = (route)=>{
  	if (route === 'signout'){
  		this.setState(initialState)
  	}else if (route === 'home') {
  		this.setState({isSignedIn: true})
  	}
  	this.setState({route: route});
  }

  render() {
  	const {isSignedIn, imageUrl, route, box} = this.state; //this.state is destructured i.e where this.state.route is used after this we can use route only
    return (
      <div className="App">
      <Particles className='particles'
            params={particlesOption}
         />
       <Navigation isSignedIn ={isSignedIn} onRouteChange={this.onRouteChange}/>
	       { route === 'home' 
	        ?<div>
	          <Logo />
	          <Rank
              name={this.state.user.name}
              entries={this.state.user.entries}
            />
	          <ImageLinkForm
	            onInputChange={this.onInputChange} 
	           onButtonSubmit={this.onButtonSubmit}
	         />  
	        <FaceRecognition box={box} imageUrl={imageUrl}/>
	        </div>
	        :( route === 'signin'
		        	? <Signin loadUser={this.loadUser} onRouteChange={this.onRouteChange}/>
		        	: <Register loadUser={this.loadUser}  onRouteChange={this.onRouteChange}/>
	          )
	        }
      </div>
    );
  }
}

export default App;
