import React, { useEffect } from 'react';
import { Provider, useDispatch, useSelector } from 'react-redux';
import snocStore from '../store/snocStore';
import { fetchSnocProtectedData } from '../redux/snocSlice';

const SnocProtectedContent = () => {
  const dispatch = useDispatch();
  const { data, loading, error } = useSelector(state => state.snoc);

  useEffect(() => {
    dispatch(fetchSnocProtectedData());
  }, [dispatch]);

  return (
    <div>
      {loading && <p>Loading protected data...</p>}
      {error && <p>Error: {error}</p>}
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
};

const SnocProtectedData = () => (
  <Provider store={snocStore}>
    <SnocProtectedContent />
  </Provider>
);

export default SnocProtectedData;
