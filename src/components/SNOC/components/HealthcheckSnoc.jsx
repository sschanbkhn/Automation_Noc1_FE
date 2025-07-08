import React, { useEffect } from 'react';
import { useDispatch, useSelector, Provider } from 'react-redux';
import snocStore from '../store/snocStore';
import { fetchSnocData } from '../redux/snocSlice';

const SnocHealthcheckContent = () => {
  const dispatch = useDispatch();
  const { data, loading, error } = useSelector(state => state.snoc);

  useEffect(() => {
    dispatch(fetchSnocData());
  }, [dispatch]);

  return (
    <div>
      {loading && <p>Loading...</p>}
      {error && <p>Error: {error}</p>}
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
};

const HealthcheckSnoc = () => (
  <Provider store={snocStore}>
    <SnocHealthcheckContent />
  </Provider>
);

export default HealthcheckSnoc;
