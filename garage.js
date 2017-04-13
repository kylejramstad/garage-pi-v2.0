import React from 'react'
import ReactDOM from 'react-dom'
import axios from 'axios'


const GarageState = React.createClass({
  getStateText: function(garageState) {
    if (!garageState) {
      return '';
    }

    if (garageState.open) {
      return 'Open';
    } else if (garageState.close) {
      return 'Closed';
    } else {
      return 'Partially open';
    }
  },

  render: function() {
    var stateText = this.getStateText(this.props.garageState);

    return (
      <div className="state">
        <span>The garage door is</span>
        <p>{stateText}</p>
      </div>
    )
  }
});

const GarageButton = React.createClass({
  render: function() {
    let garageState = this.props.garageState || {};
    let garage = this.props.garage;
    let text = (garageState.open) ? 'Close' : 'Open';

    return (
      <button onClick={garage.sendRelay}>{text}</button>
    )
  }
});

const Garage = React.createClass({
  sendRelay: function() {
    axios.get('/relay');

    // After 15 seconds check the status
    setTimeout(this.updateStatus, 15000);
  },

  updateStatus: function() {
    axios.get('/status')
      .then(function(res) {
        this.setState({garageState: res.data});
      }.bind(this));
  },

  componentDidMount: function() {
    this.updateStatus();
  },

  render: function() {
    let garageState = (this.state || {}).garageState;

    return (
        <div>
          <GarageState garageState={garageState} />
          <GarageButton garageState={garageState} garage={this} />
        </div>
    )
  }
});

ReactDOM.render(<Garage />, document.getElementById('garage'));
