import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
var fs = require('fs');
import { datas } from '../js/lafourchette.json';


render() {
	const listRestaurant = datas.map( (data) => {
		return (
			<li key = { data.title } className = 'restaurant' >
				<h3>{ data.title }</h3>
				{ data.description }
				<h4> { data.promo } </h4>
					{ data.conditions_reductions}
			</li>
		)
	})
	
	return (
        <div className="App">
            <div className="App-header">
                <img src={logo} className="App-logo" alt="logo" />
                <h2>Welcome to { this.props.title }</h2>
            </div>
            <div className="App-intro">
                { listEstablishment }
            </div>

        </div>
    );
}