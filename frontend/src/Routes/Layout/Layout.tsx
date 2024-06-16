import { useState } from 'react'
import { Layout, Menu, Drawer, Button, Flex } from 'antd'
import { MenuOutlined } from '@ant-design/icons'
import { useNavigate, useLocation, Outlet } from 'react-router-dom'
import { useAppDispatch } from '../../utils/hooks/redux'
import { logout } from '../../Modules/Auth/redux/auth.slice'

const { Header, Content } = Layout

const AppLayout = () => {
    const [visible, setVisible] = useState(false)
    const navigate = useNavigate()
    const location = useLocation()
    const dispatch = useAppDispatch()

    const showDrawer = () => {
        setVisible(true)
    }

    const onClose = () => {
        setVisible(false)
    }

    const handleNavigate = (path: string) => {
        navigate(path)
        setVisible(false)
    }

    const logoutLocal = () => {
        dispatch(logout())
        navigate('/signin')
    }

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Layout>
                <Header style={{ paddingLeft: 20, backgroundColor: '#fff' }}>
                    <Flex justify='space-between' align='center' style={{height: '100%'}}>
                        <Button
                            type="primary"
                            onClick={showDrawer}
                            icon={<MenuOutlined />}
                        >
                            Меню
                        </Button>
                        <Button onClick={logoutLocal}>Выйти</Button>
                    </Flex>
                </Header>
                <Content style={{ margin: '0px 0px 0' }}>
                    <div style={{ padding: 0, minHeight: 360 }}>
                        <Outlet />
                    </div>
                </Content>
            </Layout>
            <Drawer title="Меню" placement="left" onClose={onClose} visible={visible}>
                <Menu theme="light" mode="vertical" defaultSelectedKeys={[location.pathname]}>
                    <Menu.Item key="/home" onClick={() => handleNavigate('/')}>
                        Главная
                    </Menu.Item>
                    <Menu.Item key="/users" onClick={() => handleNavigate('/users')}>
                        База данных
                    </Menu.Item>
                </Menu>
            </Drawer>
        </Layout>
    )
}

export default AppLayout
