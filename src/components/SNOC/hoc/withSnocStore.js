import React from 'react';
import SnocStoreProvider from '../providers/SnocStoreProvider';

// Higher Order Component để wrap SNOC components với store riêng
const withSnocStore = (WrappedComponent) => {
  return function WithSnocStoreComponent(props) {
    return (
      <SnocStoreProvider>
        <WrappedComponent {...props} />
      </SnocStoreProvider>
    );
  };
};

export default withSnocStore;
