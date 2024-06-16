import { Flex, Typography } from 'antd'
import { LoginForm } from '../Components/LoginForm/LoginForm'

export function SignIn() {
    return (
        <Flex vertical justify="center" align="center" style={{ width: '100vw', minHeight: '100vh' }}>
            <Typography style={{ fontSize: 30 }}>KGN Logistics</Typography>
            <LoginForm />
        </Flex>
    )
}
