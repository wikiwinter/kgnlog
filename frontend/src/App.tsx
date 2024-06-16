import './App.css'
import ruRU from 'antd/locale/ru_RU'
import { getCurrentHoliday } from './utils/time/getCurrentHoliday'
import { App, ConfigProvider } from 'antd'
import { Routes } from './Routes/Routes'
import { BrowserRouter } from 'react-router-dom'

function MyApp() {
    const name = getCurrentHoliday()

    return (
        <div className={`App ${name}`}>
            <ConfigProvider
                locale={ruRU}
                theme={{
                    components: {
                        Form: {
                            itemMarginBottom: 0,
                        },
                    },
                    token: {
                        fontFamily: 'Source Sans Pro',
                    },
                }}
            >
                <App>
                    <BrowserRouter>
                        <>
                            <Routes />
                        </>
                    </BrowserRouter>
                </App>
            </ConfigProvider>
        </div>
    )
}

export default MyApp
