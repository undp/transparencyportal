/************************* Redux Files ************************/
import { createStore, applyMiddleware, compose } from 'redux';
import thunkMiddleware from 'redux-thunk';
import { createLogger } from 'redux-logger';

/************************* Reducer Files ************************/
import rootReducer from './rootReducer';

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
const loggerMiddleware = createLogger();

export default function configureStore(preloadedState) {
	return createStore(
		rootReducer,
		preloadedState,
		composeEnhancers(applyMiddleware(
			thunkMiddleware,
			// loggerMiddleware
		))
	);
}


