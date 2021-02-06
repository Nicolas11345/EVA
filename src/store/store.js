import Axios from 'axios';
import { isEmpty } from '../utils'
import {
  createSlice,
  configureStore,
  createAsyncThunk,
} from '@reduxjs/toolkit';

const axios = Axios.create({
    headers: {
        'Authorization':'App'
    }
});

const initialState = {
    user : {},
};
  
export const getUser = createAsyncThunk(
    'user/session',
    () => {
        return axios.get('/users/session')
        .then(res => {
            if (!isEmpty(res.data)) {
                return res.data;
            }
        })
    },
);

export const slice = createSlice({
    name: 'user',
    initialState,
    reducers: {},
    extraReducers: {
        [getUser.fulfilled]: (state, action) => {
            state.user = action.payload;
        },
    },
});

export const store = configureStore({
    reducer: slice.reducer,
});





	


