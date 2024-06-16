import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit'
// import api from '../../../configs/api/api'

import { NavigateFunction } from 'react-router-dom'
import { AxiosResponse } from 'axios'
import { API } from '../../../utils/helpers/api/axios'
interface IUserData {
    email: string
    phone_number: string
    cargo_number: string
    username: string
}
interface IUserSliceState {
    loading: boolean
    error: boolean
    ok: boolean
    access: boolean
    message: string
    access_token: string
    refresh_token: string
    stayLogged: boolean
    userData: IUserData | null
}

const initialState: IUserSliceState = {
    userData: null,
    loading: true,
    error: false,
    ok: false,
    access: false,
    message: '',
    access_token: '',
    refresh_token: '',
    stayLogged: false,
}

export interface ApiGetOwnRolesPayload {
    finishLoading: boolean
    startLoading: boolean
}

export interface LoginWithPassPayload {
    login: string
    password: string
    navigate: NavigateFunction
    needRefresh: boolean
}
export interface LoginPayload {
    login: string
    password: string
    navigate: NavigateFunction
    stayLogged: boolean
}
export interface RegisterPayload {
    login: string
    password: string
    navigate: NavigateFunction
    email: string
    phone: string
    cargo_number: string
}
interface AuthResponse {
    access_token: string
    refresh_token: string
}

export const hasAccess = createAsyncThunk('auth/hasAccess', async (_, { dispatch }) => {
    try {
        const response = await API.CRM.PROTECTED.get('/access')
        dispatch(setUserData(response.data))
        dispatch(setAccess(true))
    } catch (e: any) {
        dispatch(setUserData(null))
        dispatch(setAccess(false))
    }
})

export const login = createAsyncThunk(
    'auth/login',
    async ({ login, password, navigate, stayLogged }: LoginPayload, { dispatch }) => {
        try {
            dispatch(setError(false))
            dispatch(setMessage(''))
            dispatch(setLoading(true))

            const {
                data: { access_token, refresh_token },
            }: AxiosResponse<AuthResponse> = await API.CRM.PUBLIC.post('/login', { username: login, password })

            localStorage.setItem('access_token', access_token)
            localStorage.setItem('refresh_token', refresh_token)

            dispatch(setAccessToken(access_token))
            dispatch(setRefreshToken(refresh_token))

            dispatch(setStayLogged(stayLogged))

            dispatch(setOk(true))
            dispatch(setMessage(`Добро пожаловать, ${login}`))

            dispatch(setAccess(true))
            navigate('/', { replace: true })
            dispatch(reset())
        } catch (e: any) {}
    }
)
export const register = createAsyncThunk(
    'auth/register',
    async ({ login, password, email, phone, navigate, cargo_number }: RegisterPayload, { dispatch }) => {
        try {
            dispatch(setError(false))
            dispatch(setMessage(''))
            dispatch(setLoading(true))

            const {
                data: { access_token },
            }: AxiosResponse<AuthResponse> = await API.CRM.PUBLIC.post('/register', {
                username: login,
                password: password,
                email: email,
                phone_number: phone,
                cargo_number: cargo_number,
            })

            localStorage.setItem('access_token', access_token)
            dispatch(setAccessToken(access_token))
            navigate('/', { replace: true })
            dispatch(reset())
        } catch (e: any) {}
    }
)

export const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setLoading: (state, { payload }: { payload: boolean }) => {
            state.loading = payload
        },
        setError: (state, { payload }: { payload: boolean }) => {
            state.loading = false
            state.error = payload
        },
        setOk: (state, { payload }: { payload: boolean }) => {
            state.loading = false
            state.ok = payload
        },
        setMessage: (state, { payload }: { payload: string }) => {
            state.message = payload
        },
        reset: state => {
            state.loading = false
            state.error = false
            state.ok = false
            state.message = ''
        },
        logout: state => {
            localStorage.removeItem('access_token')
            localStorage.removeItem('refresh_token')
            state.loading = false
            state.error = false
            state.ok = false
            state.message = ''
            state.access = false
            state.access_token = ''
            state.refresh_token = ''
            state.userData = null
        },
        setAccessToken: (state, { payload }: { payload: string }) => {
            state.access_token = payload
        },
        setRefreshToken: (state, { payload }: { payload: string }) => {
            state.refresh_token = payload
        },
        setAccess: (state, { payload }: { payload: boolean }) => {
            state.access = payload
        },
        setStayLogged: (state, action: PayloadAction<boolean>) => {
            state.stayLogged = action.payload
        },
        setUserData: (state, action: PayloadAction<IUserData | null>) => {
            state.userData = action.payload
        },
    },
})

export const {
    setLoading,
    setError,
    setOk,
    setMessage,
    reset,
    setAccessToken,
    setRefreshToken,
    setAccess,
    logout,
    setStayLogged,
    setUserData,
} = authSlice.actions

export default authSlice
