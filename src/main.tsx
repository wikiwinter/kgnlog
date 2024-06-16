import ReactDOM from 'react-dom/client'
import MyApp from './App.tsx'
import './index.css'
import { Provider } from 'react-redux'
import { store } from './utils/Redux/store.ts'

ReactDOM.createRoot(document.getElementById('root')!).render(
    <Provider store={store}>
        <MyApp />
    </Provider>
)
