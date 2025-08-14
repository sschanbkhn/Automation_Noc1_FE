// import React, { useEffect } from 'react';
// import { useDispatch, useSelector, Provider } from 'react-redux';
// import snocStore, { RootState, AppDispatch } from '../store/snocStore';
// import { fetchSnocData } from '../redux/Healthcheck/snocSlice';

// const SnocHealthcheckContent = () => {
//   const dispatch = useDispatch<AppDispatch>();
//   const { platforms, loading, error } = useSelector((state: RootState) => state.snoc);

//   useEffect(() => {
//     dispatch(fetchSnocData());
//   }, [dispatch]);

//   return (
//     <div>
//       {loading && <p>Loading...</p>}
//       {error && <p>Error: {error}</p>}
//       <pre>{JSON.stringify(platforms, null, 2)}</pre>
//     </div>
//   );
// };

// const HealthcheckSnoc = () => (
//   <Provider store={snocStore}>
//     <SnocHealthcheckContent />
//   </Provider>
// );

// export default HealthcheckSnoc;
