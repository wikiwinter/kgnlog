import { Card } from 'antd'
import { useNavigate } from 'react-router-dom'

interface Props {
    user: {
        id: number
        full_name: string
        lastName: string
        phone_number: string
        email: string
    }
}
const UserCard = ({ user }: Props) => {
    const navigate = useNavigate()

    const handleClick = () => {
        navigate(`/user/${user.id}`)
    }

    return (
        <Card onClick={handleClick} hoverable style={{ width: '100%', margin: '10px' }}>
            <p>{user.full_name}</p>
            <p>{user.phone_number}</p>
            <p>{user.email}</p>
        </Card>
    )
}

export default UserCard
