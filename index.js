import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import { datas } from './lafourchette.json';

class App extends Component {
	
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
                <h2>Welcome to { this.props.title }</h2>
            </div>
            <div className="App-intro">
                { listRestaurant }
            </div>

        </div>
    );
}
}