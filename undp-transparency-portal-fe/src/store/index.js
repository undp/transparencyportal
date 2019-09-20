/************************* Redux Files ************************/
import { createStore, applyMiddleware, compose } from 'redux';
import thunkMiddleware from 'redux-thunk';
// import { createLogger } from 'redux-logger';

/************************* Reducer Files ************************/
import rootReducer from './rootReducer';

// const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
// const loggerMiddleware = createLogger();

const configureStore = (preloadedState) =>
	createStore(
		rootReducer,
		preloadedState,
		applyMiddleware(
			thunkMiddleware
			// loggerMiddleware
		)
		// composeEnhancers(applyMiddleware(
		// 	thunkMiddleware,
		// 	// loggerMiddleware
		// ))
	);

export default configureStore;
