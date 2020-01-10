import React, { Component } from 'react';
import axios from 'axios'

import Table from '../components/Table'

export default class LogContainer extends Component{

	constructor() {
		super();
		this.state = {rows: []};
		
		this.updateRows = this.updateRows.bind(this);
	}
	
	componentDidMount() {
		this.interval = setInterval(() => this.updateRows(), 1000);
	}
	componentWillUnmount() {
		clearInterval(this.interval);
	}
	
	updateRows() {
		axios.get('/logs')
			.then(res => {
				this.setState({ rows: res.data });
			})
			.catch(err => {
				console.log(err);
			})
	}
	
	render() {
		return(
			<Table rows={this.state.rows} />
 		  );
	}
}