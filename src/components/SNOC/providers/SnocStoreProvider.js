import React from 'react';
import { Provider } from 'react-redux';
import snocStore from '../store/snocStore';

const SnocStoreProvider = ({ children }) => {
  return (
    <Provider store={snocStore}>
      {children}
    </Provider>
  );
};

export default SnocStoreProvider;
