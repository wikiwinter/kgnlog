import { useRef, useState } from 'react';
import { Form, Input, Button, message, ConfigProvider, Select } from 'antd';
import { Formik, FormikHelpers } from 'formik';
import * as Yup from 'yup';
import { API } from '../../utils/helpers/api/axios';
import { useAppSelector } from '../../utils/hooks/redux';
import { useReactToPrint } from 'react-to-print';
import './ShipmentPage.css';

interface ShipmentFormValues {
    recipient_phone_number: string;
    cargo_col: string;
    cargo_description: string;
    check_number: string;
    recipient_name: string;
    truck_type: string;
    price: string;
    comment: string;
}

export function ShipmentPage() {
    const [qrData, setQrData] = useState<{ qrImage: string, recipient_phone_number: string, recipient_name: string, cargo_col: string }[]>([]);
    const qrCodeRef = useRef<HTMLDivElement>(null);
    const { userData } = useAppSelector(state => state.auth);
    const truck_type_options = [
        { value: 'Голова', label: 'Голова' },
        { value: 'Прицеп', label: 'Прицеп' },
    ];

    const initialValues: ShipmentFormValues = {
        recipient_phone_number: '',
        cargo_col: '',
        cargo_description: '',
        check_number: '',
        recipient_name: '',
        truck_type: '',
        price: '',
        comment: '',
    };

    const validationSchema = Yup.object().shape({
        recipient_phone_number: Yup.string().required('Телефонный номер обязателен'),
        recipient_name: Yup.string().required('Имя получателя обязательно'),
        cargo_description: Yup.string().required('Описание груза обязательно'),
        check_number: Yup.string().required('Количество чеков обязательно'),
        truck_type: Yup.string().required('Тип кузова обязателен'),
        cargo_col: Yup.string().required('Количество груза обязательно'),
        price: Yup.string().required('Цена обязательна'),
        comment: Yup.string().required('Комментарий обязателен'),
    });

    const handlePrint = useReactToPrint({
        content: () => qrCodeRef.current,
        pageStyle: `
            @page {
                size: auto;
                margin: 0;
            }
            @media print {
                body {
                    -webkit-print-color-adjust: exact;
                }
            }
        `,
        onAfterPrint: () => message.success('QR код(ы) успешно распечатан(ы)'),
        onPrintError: () => message.error('Ошибка при печати QR кода(ов)')
    });

    const handleSubmit = async (values: ShipmentFormValues, { setSubmitting }: FormikHelpers<ShipmentFormValues>) => {
        try {
            const numberOfChecks = parseInt(values.check_number, 10);
            const qrDataList: { qrImage: string, recipient_phone_number: string, recipient_name: string, cargo_col: string }[] = [];

            for (let i = 0; i < numberOfChecks; i++) {
                const dataToSend = { ...values, price: values.price };
                const response = await API.CRM.PROTECTED.post('/generate_qr', dataToSend, {
                    responseType: 'blob',
                });
                const url = window.URL.createObjectURL(new Blob([response.data]));
                qrDataList.push({ 
                    qrImage: url, 
                    recipient_phone_number: values.recipient_phone_number, 
                    recipient_name: values.recipient_name, 
                    cargo_col: values.cargo_col 
                });
            }

            setQrData(qrDataList);
            message.success('QR код(ы) успешно сгенерирован(ы)');

            await API.CRM.PROTECTED.put('http://127.0.0.1:5000/update_status', {
                status: 'Заказ в пути',
                ...values
            });
            message.success('Статус заказа обновлен на "Заказ в пути"');

            // Запуск печати
            handlePrint();
        } catch (error) {
            message.error('Ошибка при генерации QR кода или обновлении статуса заказа');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <ConfigProvider 
            theme={{
                components: {
                    Form: {
                        labelFontSize: 18,
                        verticalLabelPadding: 0
                    }
                }
            }}
        >
            <div className="shipment-page-container">
                <div className="background-image"></div>
                <div className="content">
                    <div className="section-container">
                        <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit}>
                            {({ values, errors, touched, handleChange, handleBlur, handleSubmit, isSubmitting, setFieldValue }) => (
                                <Form onFinish={handleSubmit}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                        <Form.Item
                                            label="Телефонный номер получателя"
                                            help={touched.recipient_phone_number && errors.recipient_phone_number}
                                            labelCol={{ span: 24 }}
                                            validateStatus={touched.recipient_phone_number && errors.recipient_phone_number ? 'error' : ''}
                                        >
                                            <Input 
                                                size='large' 
                                                name="recipient_phone_number" 
                                                onChange={handleChange} 
                                                onBlur={handleBlur} 
                                                value={values.recipient_phone_number} 
                                                placeholder='Например, +77775553535'
                                            />
                                        </Form.Item>
                                        <Form.Item
                                            label="ФИО получателя"
                                            help={touched.recipient_name && errors.recipient_name}
                                            labelCol={{ span: 24 }}
                                            validateStatus={touched.recipient_name && errors.recipient_name ? 'error' : ''}
                                        >
                                            <Input 
                                                size='large' 
                                                name="recipient_name" 
                                                onChange={handleChange} 
                                                onBlur={handleBlur} 
                                                value={values.recipient_name} 
                                                placeholder='Например, Иванов Иван Иванович'
                                            />
                                        </Form.Item>
                                        <Form.Item
                                            label="Количество мест"
                                            help={touched.cargo_col && errors.cargo_col}
                                            labelCol={{ span: 24 }}
                                            validateStatus={touched.cargo_col && errors.cargo_col ? 'error' : ''}
                                        >
                                            <Input 
                                                size='large' 
                                                name="cargo_col" 
                                                onChange={handleChange} 
                                                onBlur={handleBlur} 
                                                value={values.cargo_col} 
                                                placeholder='Например, 15'
                                            />
                                        </Form.Item>
                                        <Form.Item
                                            label="Описание груза"
                                            help={touched.cargo_description && errors.cargo_description}
                                            labelCol={{ span: 24 }}
                                            validateStatus={touched.cargo_description && errors.cargo_description ? 'error' : ''}
                                        >
                                            <Input 
                                                size='large' 
                                                name="cargo_description" 
                                                onChange={handleChange} 
                                                onBlur={handleBlur} 
                                                value={values.cargo_description} 
                                                placeholder='Например, Везу стекло и зеркала'
                                            />
                                        </Form.Item>
                                        <Form.Item
                                            label="Тип кузова"
                                            help={touched.truck_type && errors.truck_type}
                                            validateStatus={touched.truck_type && errors.truck_type ? 'error' : ''}
                                            labelCol={{ span: 24 }}
                                        >
                                            <Select
                                                size='large'
                                                placeholder='Выберите тип кузова'
                                                onChange={value => setFieldValue('truck_type', value)}
                                                onBlur={handleBlur}
                                                value={values.truck_type || undefined}
                                                options={truck_type_options}
                                            />
                                        </Form.Item>
                                        <Form.Item
                                            label="Количество чеков"
                                            help={touched.check_number && errors.check_number}
                                            labelCol={{ span: 24 }}
                                            validateStatus={touched.check_number && errors.check_number ? 'error' : ''}
                                        >
                                            <Input 
                                                size='large' 
                                                name="check_number" 
                                                onChange={handleChange} 
                                                onBlur={handleBlur} 
                                                value={values.check_number} 
                                                placeholder='Например, 3'
                                            />
                                        </Form.Item>
                                        <Form.Item
                                            label="Цена"
                                            help={touched.price && errors.price}
                                            labelCol={{ span: 24 }}
                                            validateStatus={touched.price && errors.price ? 'error' : ''}
                                        >
                                            <Input
                                                size='large'
                                                name="price"
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                value={values.price}
                                                placeholder='Например, 1000'
                                            />
                                        </Form.Item>
                                        <Form.Item
                                            label="Комментарий"
                                            help={touched.comment && errors.comment}
                                            labelCol={{ span: 24 }}
                                            validateStatus={touched.comment && errors.comment ? 'error' : ''}
                                        >
                                            <Input
                                                size='large'
                                                name="comment"
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                value={values.comment}
                                                placeholder='Например, Дополнительные инструкции'
                                            />
                                        </Form.Item>
                                        <Form.Item
                                            label="Имя"
                                            labelCol={{ span: 24 }}
                                        >
                                            <Input 
                                                size='large' 
                                                disabled
                                                value={userData?.username} 
                                            />
                                        </Form.Item>
                                        <Form.Item
                                            label="Номер телефона"
                                            labelCol={{ span: 24 }}
                                        >
                                            <Input 
                                                size='large' 
                                                disabled
                                                value={userData?.phone_number} 
                                            />
                                        </Form.Item>
                                        <Form.Item
                                            label="Номер машины"
                                            labelCol={{ span: 24 }}
                                        >
                                            <Input 
                                                size='large' 
                                                disabled
                                                value={userData?.cargo_number} 
                                            />
                                        </Form.Item>
                                    </div>
                                    <Form.Item>
                                        <Button type="primary" htmlType="submit" loading={isSubmitting}>
                                            Сгенерировать QR код
                                        </Button>
                                    </Form.Item>
                                </Form>
                            )}
                        </Formik>
                    </div>
                    {qrData.length > 0 && (
                        <div className="qr-container" ref={qrCodeRef}>
                            {qrData.map((data, index) => (
                                <div key={index} className="qr-item">
                                    <img src={data.qrImage} alt={`QR Code ${index + 1}`} className="qr-code" />
                                    <div className="qr-details">
                                        <p>Телефонный номер получателя: {data.recipient_phone_number}</p>
                                        <p>ФИО получателя: {data.recipient_name}</p>
                                        <p>Количество мест: {data.cargo_col}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </ConfigProvider>
    );
}
