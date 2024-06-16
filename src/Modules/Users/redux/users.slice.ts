import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit'
// import api from '../../../configs/api/api'

import { API } from '../../../utils/helpers/api/axios'

interface IUserSliceState {
    users: Array<any> | null
}

const initialState: IUserSliceState = {
    users: null,
}

export const getUsers = createAsyncThunk('users/get', async (_, { dispatch }) => {
    try {
        const { data } = await API.CRM.PROTECTED.get('/list')
        dispatch(setUsers(data.users))
    } catch (e: any) {
        console.log(e)
    }
})

export const usersSlice = createSlice({
    name: 'users',
    initialState,
    reducers: {
        setUsers: (state, action: PayloadAction<Array<any> | null>) => {
            state.users = action.payload
        },
    },
})

export const { setUsers } = usersSlice.actions

export default usersSlice
