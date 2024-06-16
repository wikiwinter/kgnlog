import { Flex, Typography } from 'antd'
import { SignUpForm } from '../Components/SignUpForm/SignUpForm'

export function SignUp() {
    return (
        <Flex vertical justify="center" align="center" style={{ width: '100vw', minHeight: '100vh' }}>
            <Typography style={{ fontSize: 30 }}>KGN Logistics</Typography>
            <SignUpForm />
        </Flex>
    )
}
