import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface GeneralState {
    erorrModalTitle: string | null
    erorrModalText: string | null
}

const initialState: GeneralState = {
    erorrModalTitle: null,
    erorrModalText: null,
}

const generalSlice = createSlice({
    name: 'general',
    initialState,
    reducers: {
        setErrorModalTitle: (state, action: PayloadAction<string>) => {
            state.erorrModalTitle = action.payload
        },
        setErrorModalText: (state, action: PayloadAction<string>) => {
            state.erorrModalText = action.payload
        },
        clearErrorModal: state => {
            state.erorrModalTitle = null
            state.erorrModalText = null
        },
    },
})

export const { setErrorModalTitle, setErrorModalText, clearErrorModal } = generalSlice.actions

export default generalSlice
