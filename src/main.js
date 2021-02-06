/* This is the main code executed by the EVA app
 Author : Nicolas Rioux
*/

import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux'
import { store } from './store/store'
import App from './components/App'

ReactDOM.render(
    <Provider store = {store}>
        <App />
    </Provider>, document.getElementById('app'));