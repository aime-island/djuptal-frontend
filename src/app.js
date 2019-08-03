import React from 'react';
import ReactDOM from 'react-dom';
import './styles/style.css';

import Dashboard from './components/Dashboard';

const renderApp = () => {
        ReactDOM.render(<Dashboard />, document.getElementById('main'));
};

renderApp();