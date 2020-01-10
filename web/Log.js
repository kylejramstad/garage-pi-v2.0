import React, { Component, Suspense, lazy } from 'react';
const LazyLogContainer = lazy(() => import('./containers/LogContainer'));

export default class History extends Component {
	render(){
		return (
			<div>
				<Suspense fallback={<div>Loading...</div>}>
				<LazyLogContainer />
				</Suspense>
			</div>
		);
	}
}
