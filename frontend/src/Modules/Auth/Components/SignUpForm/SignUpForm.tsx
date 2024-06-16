import { Formik } from 'formik'
import * as Yup from 'yup'
import { Form, Input, Button, Typography, Flex } from 'antd'
import { UserOutlined, LockOutlined, MailOutlined, PhoneOutlined, CarOutlined } from '@ant-design/icons'
import { motion } from 'framer-motion'
import styles from './SignUpForm.module.css' // Предполагается, что у вас есть стили для формы регистрации
import { useAppDispatch } from '../../../../utils/hooks/redux' // Замените на ваш собственный action для регистрации
import { useNavigate } from 'react-router-dom'
import { register } from '../../redux/auth.slice'

// Определение интерфейса для значений формы
interface RegistrationFormValues {
    username: string
    password: string
    phoneNumber: string
    email: string
    cargo_number: string
}

// Схема валидации формы
const validationSchema = Yup.object({
    username: Yup.string().required('Это поле обязательно'),
    password: Yup.string().required('Это поле обязательно').min(8, 'Пароль должен быть не менее 8 символов'),
    phoneNumber: Yup.string()
        .required('Это поле обязательно')
        .matches(/^\+[0-9]{1,14}$/, 'Некорректный формат номера'),
    email: Yup.string().email('Некорректный email').required('Это поле обязательно'),
    cargo_number: Yup.string().required('Это поле обязательно'),
})

export function SignUpForm() {
    const dispatch = useAppDispatch()
    const navigate = useNavigate()

    const initialValues: RegistrationFormValues = {
        username: '',
        password: '',
        phoneNumber: '',
        email: '',
        cargo_number: '',
    }

    const handleSubmit = (values: RegistrationFormValues) => {
        dispatch(
            register({
                email: values.email,
                password: values.password,
                phone: values.phoneNumber,
                login: values.username,
                navigate: navigate,
                cargo_number: values.cargo_number,
            })
        )
    }

    return (
        <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit}>
            {({ values, errors, touched, handleChange, handleBlur, handleSubmit }) => (
                <motion.div
                    initial={{ scale: 0.5 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className={styles.form}
                >
                    <h1 style={{ textAlign: 'center' }}>Регистрация</h1>
                    <Form onFinish={handleSubmit} style={{ width: '100%' }}>
                        <Flex vertical gap={16}>
                            <Form.Item
                                validateStatus={touched.username && errors.username ? 'error' : ''}
                                help={touched.username && errors.username ? errors.username : null}
                            >
                                <Input
                                    size="large"
                                    prefix={<UserOutlined />}
                                    placeholder="Username"
                                    name="username"
                                    value={values.username}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                />
                            </Form.Item>
                            <Form.Item
                                validateStatus={touched.email && errors.email ? 'error' : ''}
                                help={touched.email && errors.email ? errors.email : null}
                            >
                                <Input
                                    size="large"
                                    prefix={<MailOutlined />}
                                    placeholder="Email"
                                    name="email"
                                    value={values.email}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                />
                            </Form.Item>
                            <Form.Item
                                validateStatus={touched.phoneNumber && errors.phoneNumber ? 'error' : ''}
                                help={touched.phoneNumber && errors.phoneNumber ? errors.phoneNumber : null}
                            >
                                <Input
                                    size="large"
                                    prefix={<PhoneOutlined />}
                                    placeholder="Phone Number"
                                    name="phoneNumber"
                                    value={values.phoneNumber}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                />
                            </Form.Item>
                            <Form.Item
                                validateStatus={touched.cargo_number && errors.cargo_number ? 'error' : ''}
                                help={touched.cargo_number && errors.cargo_number ? errors.cargo_number : null}
                            >
                                <Input
                                    size="large"
                                    prefix={<CarOutlined />}
                                    placeholder="Номер машины"
                                    name="cargo_number"
                                    value={values.cargo_number}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                />
                            </Form.Item>
                            <Form.Item
                                validateStatus={touched.password && errors.password ? 'error' : ''}
                                help={touched.password && errors.password ? errors.password : null}
                            >
                                <Input.Password
                                    size="large"
                                    prefix={<LockOutlined />}
                                    placeholder="Password"
                                    name="password"
                                    value={values.password}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                />
                            </Form.Item>
                            <Form.Item>
                                <Button size="large" type="primary" htmlType="submit" block>
                                    Зарегистрироваться
                                </Button>
                            </Form.Item>
                            <Typography.Text>
                                <Flex justify='space-between' align='center'>
                                    Есть аккаунт?{' '}
                                    <Button type="link" onClick={() => navigate('/signin')}>
                                        Войти
                                    </Button>
                                </Flex>
                                
                            </Typography.Text>
                        </Flex>
                    </Form>
                </motion.div>
            )}
        </Formik>
    )
}
