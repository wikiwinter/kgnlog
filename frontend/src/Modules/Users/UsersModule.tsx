import { Row, Col } from 'antd'
import UserCard from './Components/UserCard/UserCard'
import { useAppDispatch, useAppSelector } from '../../utils/hooks/redux'
import { useEffect } from 'react'
import { getUsers } from './redux/users.slice'

const UsersModule = () => {
    const dispatch = useAppDispatch()
    const { users } = useAppSelector(state => state.users)
    useEffect(() => {
        dispatch(getUsers())
    }, [])
    return (
        <Row gutter={[16, 24]}>
            {users?.map(user => (
                <Col key={user.phone_number} xs={24} sm={24} md={24} lg={24} xl={24}>
                    <UserCard user={user} />
                </Col>
            ))}
        </Row>
    )
}

export default UsersModule
