import { configureStore } from '@reduxjs/toolkit';
import { Reducer as appReducer} from 'store/app';
import { createBrowserHistory } from 'history';
import thunk from 'redux-thunk';
export const history = createBrowserHistory();
const rootReducer = (history:any) => ({
    apps: appReducer
})
const store = configureStore({
    reducer: rootReducer(history),
    middleware: [thunk]
})
export default store