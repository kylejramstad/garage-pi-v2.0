import React, { Component } from 'react';

import Table from '../components/Table'

export default class LogContainer extends Component{

	constructor() {
		super();
		this.state = {rows: []};
		
		this.eventSource = new EventSource("logs");
	}
	
	componentDidMount() {
		this.eventSource.onmessage = function(event){
			this.setState(JSON.parse(event.data));
		}.bind(this);
		
		this.eventSource.addEventListener("closedConnection", e =>
		  this.stopUpdates()
		);
	}
	
	stopUpdates(){
		this.eventSource.close();
	}
	
	render() {
		return(
			<Table rows={this.state.rows} />
 		  );
	}
}