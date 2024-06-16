import { debounce } from 'lodash'

export const searchDebounceFunction = (fetchFunc: (value: string) => void) =>
    debounce(searchValue => {
        fetchFunc(searchValue)
    }, 1000)
