import { configureStore } from '@reduxjs/toolkit';
import snocReducer from '../redux/snocSlice';

const snocStore = configureStore({
  reducer: {
    snoc: snocReducer,
  },
});

export default snocStore;
