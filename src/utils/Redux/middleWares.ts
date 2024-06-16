import { Middleware } from '@reduxjs/toolkit'

import { globalInitialStates } from './store'

export const localStorageMiddleware: Middleware = () => next => action => {
    const result = next(action)
    return result
}

export const loadFromLocalStorage: any = () => {
    // Загрузка данных
    const accessTokenData = localStorage.getItem('access_token')
    const refreshTokenData = localStorage.getItem('refresh_token')

    // Формирование объекта начального состояния
    const state: any = {}

    if (accessTokenData !== null) {
        state.auth = {
            ...globalInitialStates.auth,
            access_token: accessTokenData,
            refresh_token: refreshTokenData,
        }
    }

    return state
}
