import { Formik } from 'formik'
import * as Yup from 'yup'
import { Form, Input, Button, Typography, Flex } from 'antd'
import { UserOutlined, LockOutlined, ExclamationCircleFilled } from '@ant-design/icons'
import { motion } from 'framer-motion'
import { shakeAnimation } from '../../../../UI/framerAnimations'
import styles from './LoginForm.module.css'
import { useAppDispatch, useAppSelector } from '../../../../utils/hooks/redux'
import { login, setError } from '../../redux/auth.slice'
import { useNavigate } from 'react-router-dom'
import { ChangeEvent } from 'react'

interface LoginFormValues {
    username: string
    password: string
    rememberMe: boolean
}

const validationSchema = Yup.object({
    username: Yup.string().required('Это поле обязательно'),
    password: Yup.string().required('Это поле обязательно'),
    rememberMe: Yup.boolean(),
})

export function LoginForm() {
    const { stayLogged, error, message } = useAppSelector(state => state.auth)
    const dispatch = useAppDispatch()
    const navigate = useNavigate()
    const initialValues: LoginFormValues = {
        username: '',
        password: '',
        rememberMe: stayLogged,
    }

    const handleSubmit = (values: LoginFormValues) => {
        dispatch(
            login({
                login: values.username,
                password: values.password,
                stayLogged: values.rememberMe,
                navigate: navigate,
            })
        )
    }

    return (
        <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit}>
            {({ values, errors, touched, handleChange, handleBlur, handleSubmit }) => {
                const customOnChange = (e: ChangeEvent<HTMLInputElement>) => {
                    handleChange(e)
                    if (error) {
                        dispatch(setError(false))
                    }
                }

                return (
                    <motion.div
                        initial={{ scale: 0.5 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.5 }}
                        className={styles.form}
                    >
                        <h1 style={{ textAlign: 'center' }}>Авторизация</h1>
                        <Form onFinish={handleSubmit} style={{ width: '100%' }}>
                            <Flex vertical gap={15}>
                                <motion.div
                                    variants={shakeAnimation}
                                    animate={(touched.username && errors.username) || error ? 'shake' : 'initial'}
                                >
                                    <Form.Item
                                        className={styles.form_item}
                                        validateStatus={(touched.username && errors.username) || error ? 'error' : ''}
                                        help={touched.username && errors.username ? errors.username : null}
                                    >
                                        <Input
                                            size="large"
                                            prefix={<UserOutlined />}
                                            placeholder="Username"
                                            name="username"
                                            value={values.username}
                                            onChange={customOnChange}
                                            onBlur={handleBlur}
                                        />
                                    </Form.Item>
                                </motion.div>
                                <motion.div
                                    animate={(touched.password && errors.password) || error ? 'shake' : 'initial'}
                                    variants={shakeAnimation}
                                >
                                    <Form.Item
                                        className={styles.form_item}
                                        validateStatus={(touched.password && errors.password) || error ? 'error' : ''}
                                        help={touched.password && errors.password ? errors.password : null}
                                    >
                                        <Input.Password
                                            size="large"
                                            prefix={<LockOutlined />}
                                            placeholder="Password"
                                            name="password"
                                            value={values.password}
                                            onChange={customOnChange}
                                            onBlur={handleBlur}
                                        />
                                    </Form.Item>
                                </motion.div>
                                {error && (
                                    <Typography.Text className={styles.global_error} type="danger">
                                        {
                                            <>
                                                <ExclamationCircleFilled /> {message}
                                            </>
                                        }
                                    </Typography.Text>
                                )}
                                {/* <Form.Item className={styles.checkbox}>
                                    <Checkbox
                                        checked={values.rememberMe}
                                        onChange={e => setFieldValue('rememberMe', e.target.checked)}
                                    >
                                        Запомнить меня
                                    </Checkbox>
                                </Form.Item> */}
                                <Form.Item className={styles.signin_btn}>
                                    <Button size="large" type="primary" htmlType="submit" block>
                                        Войти
                                    </Button>
                                </Form.Item>
                                <Typography.Text>
                                    <Flex justify='space-between' align='center'>
                                        Нет аккаунта?{' '}
                                        <Button type="link" onClick={() => navigate('/signup')}>
                                            Зарегистрируйтесь
                                        </Button>
                                    </Flex>
                                    
                                </Typography.Text>
                            </Flex>
                        </Form>
                    </motion.div>
                )
            }}
        </Formik>
    )
}
