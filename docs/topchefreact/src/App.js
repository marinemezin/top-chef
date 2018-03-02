import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import data from './lafourchette.json';

class App extends Component {
  render() {
	/*var datas = exporterJson.getDatas();
	const listRestaurant = datas.map( (data) => {
		return (
			<li key = { data.title } className = 'restaurant' >
				<h3>{ data.title }</h3>
				{ data.description }
				<h4> { data.promo } </h4>
					{ data.conditions_reductions}
			</li>
		)
	})*/
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to React</h1>
        </header>
		<div className="App-intro">
		<ul>
        {
          data.map(function(restaurant){
            return <li>{restaurant.title}, {restaurant.address}, {restaurant.zipcode}, {restaurant.city} PROPOSE {restaurant.promo}  \\\ CONDITIONS : {restaurant.conditions_reductions} </li>;
          })
        }
        </ul>
        </div>
      </div>
    );
  }
}

export default App;
