import App from 'app/App';
import React from 'react';
import ReactDOM from 'react-dom';
import * as serviceWorker from './serviceWorker';
import 'element-theme-default';
import { Provider } from 'react-redux';
import store from 'store';
import { i18n } from 'element-react'
import locale from 'element-react/src/locale/lang/vi'

ReactDOM.render(
    <Provider store={store}>
        <App />
    </Provider>
    , document.getElementById('root')
);
i18n.use(locale);
serviceWorker.unregister();
