import React, { Component } from 'react'

import GarageState from '../components/GarageState'
import GarageButton from '../components/GarageButton'

class GarageContainer extends Component {
	constructor(props) {
		super(props);

		this.state = { garageState: '' };

		this.eventSource = new EventSource("status");

		this.sendRelay = this.sendRelay.bind(this);
		this.getGarageStatus = this.getGarageStatus.bind(this);
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

	sendRelay(){
		const Http = new XMLHttpRequest();
		const url='/relay';
		Http.open("GET", url);
		Http.send();
	}

	getGarageStatus() {
		let { garageState } = this.state;

		if (!garageState) {
			return 'Loading...';
		}

		if (garageState.open && garageState.close){
			return 'Garage Door Fell Off!!!!';
		} else if (garageState.open) {
			return 'Open';
		} else if (garageState.close) {
			return 'Closed';
		} else {
			return 'Partially open';
		}
	}

	render() {
		let { garageState } = this.state;

		return (
			<div>
				<GarageState getGarageStatus={this.getGarageStatus} />
				<GarageButton 
					buttonText={garageState.open ? 'Close' : 'Open'}
					sendRelay={this.sendRelay} />
			</div>
		)
	}
}

export default GarageContainer
