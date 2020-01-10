import React, { Component, Suspense, lazy } from 'react';
const LazyGarageContainer = lazy(() => import('./containers/GarageContainer'));

export default class Garage extends Component {
  render() {
	return (
		<div>
			<Suspense fallback={<div>Loading...</div>}>
				<LazyGarageContainer />
			</Suspense>
		</div>
    );
  }
}
