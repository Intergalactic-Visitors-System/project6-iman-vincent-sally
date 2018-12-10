import React, { Component } from "react";
import { Link } from "react-router-dom";
import NASAPhotos from "./NASAPhotos";
import EarthPhotos from "./EarthPhotos";
import EarthWeather from "./EarthWeather";
import firebase from "../data/firebase"
import swal from 'sweetalert';

const provider = new firebase.auth.GoogleAuthProvider();
const auth = firebase.auth();

class Results extends Component {
  constructor() {
    super();
    this.state = {
      user: null,
      newPlace: {},
      placeEntries: {},
    };
  }

  login = () => {
    auth.signInWithPopup(provider)
      .then((result) => {
        const user = result.user;
        this.setState({
          user: user
        });
      });
  }

  logOut = () => {
    auth.signOut()
      .then(() => {
        this.setState({
          user: null
        });
      });
  }

  handleNewPlace = e => {

    if (this.state.user) {
      const newPlace = {
        name: this.props.match.params.name,
        lat: this.props.match.params.lat,
        lng: this.props.match.params.lng,
      };

      const dbRef = firebase.database().ref(`/${this.state.user.uid}`);

      console.log(newPlace)
      // console.log(dbRef.orderByChild("name").equalTo(this.props.match.params.name), 'hi')


      dbRef.once("value").then(snapshot => {

          const stupidDB = snapshot.val();
          console.log(stupidDB, 'database')
          console.log(newPlace, 'cake')


        this.setState({
          placeEntries: stupidDB
        })

        console.log(this.state.placeEntries, 'muffin')

        if (this.state.placeEntries) {
          let alreadyExists = false;
          Object.entries(this.state.placeEntries).forEach((entry) => {

            if (entry[1].lat === newPlace.lat && entry[1].lng === newPlace.lng) {
              alreadyExists = true;
              // console.log("IT MATCHES")
            }

          })
          if (alreadyExists) {
            swal({
              title: "Already in List!",
              text: "This location is already in your destination list.",
              icon: "warning"
            })
          } else {
            dbRef.push(newPlace)
            swal({
              title: "Destination added!",
              text: "Click the [] to view all destinations saved",
              icon: "success"
            })
          }
        } else {
          dbRef.push(newPlace)
          swal({
            title: "Destination added!",
            text: "Click the [] to view all destinations saved",
            icon: "success"
          })
        }
      })


    } else {
      swal({
        title: "Request Denied",
        text: "You must login to save this destination place",
        icon: "error"
      })
    }
  }

  formatName = name => {
    if (name.indexOf("@") === -1) {
      return name;
    } else {
      return `${name.slice(0, name.indexOf("@"))} ${name.slice(name.indexOf("@") + 1)}`;
    }
  }

  componentDidMount() {
    auth.onAuthStateChanged((user) => {
      if (user) {
        this.setState({
          user: user
        }, () => {
          // create reference specific to user
          this.dbRef = firebase.database().ref(`${this.state.user.uid}`);

          this.dbRef.on('value', (snapshot) => {

          });
        })
      }
    })
  }

  render() {
    return (
      <div>
        <main className="results">
          <div className="results-header">
            <nav  className="results-nav">
              <ul>
                <li>
                  {
                    this.state.user ?
                      <button onClick={this.logout}><img src={this.state.user.photoURL} alt="" className="profile-picture" /></button> :
                      <button onClick={this.login}><img src="/assets/alien-icon.png" alt="Login" /></button>
                  }
                </li>

                <li>
                  <a href="/" className="search-icon"><img src="/assets/search-icon.png" alt="Search" /></a>
                </li>

                { this.state.user ?
                  <li>
                  <img src="/assets/list-icon.png" className="list-icon" alt="Saved Places" />
                </li>
                 : null}

                <li>
                  <button onClick={this.appInfo}>
                    <img src="/assets/about-icon.png" alt="About IVS" />
                  </button>
                </li>
              </ul>
            </nav>
            <h2>Visit...</h2>
            <div className="place-heading">
              <h1>{this.formatName(this.props.match.params.name)}</h1>
            </div>
          </div>

          <div className="details clearfix">
            <div className="stats">
              <div className="info">
                {/* sample temperature and wind speed for styling purposes */}
                <p>-1°C</p>
                <p>10 km/hour</p>
                {/* show lat and lng to 2 decimal points */}
                <p>{"{ "}{parseFloat(Number(this.props.match.params.lng)).toFixed(2)}/{parseFloat(Number(this.props.match.params.lat)).toFixed(2)}{" }"}</p>
              </div>
              <div className="share">
                  <button className="save-icon" onClick={this.handleNewPlace}>
                    <img src="/assets/save-icon.png" alt=""/>
                  </button>
                  <img className="twitter-icon" src="/assets/twitter-icon.png" alt=""/>
              </div>
            </div>
            <div className="sat">
              <div className="zoom"></div>
              <div>
                <NASAPhotos
                  lng={this.props.match.params.lng}
                  lat={this.props.match.params.lat}
                />
              </div>
            </div>
          </div>
          <EarthPhotos
            lng={this.props.match.params.lng}
            lat={this.props.match.params.lat}
          />
          <EarthWeather
            lng={this.props.match.params.lng}
            lat={this.props.match.params.lat}
          />
        </main>
        <footer>
          <h3>Intergalactic Visitors System: Earth</h3>
          <p>Developed by Iman, Sally and Vincent</p>
        </footer>
      </div>
    )
  }
}

export default Results;
