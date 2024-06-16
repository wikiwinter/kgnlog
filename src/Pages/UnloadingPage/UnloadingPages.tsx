import { useState } from 'react';
import { Button, Card, Input, Select, Typography, message } from 'antd';
import debounce from 'lodash/debounce';
import { API } from '../../utils/helpers/api/axios';

const { Option } = Select;

interface Result {
  cargo_description: string;
  sms_sent_counter: number;
  recipient_name: string;
  recipient_phone_number: string;
  check_number: number;
  truck_type: string;
  cargo_col: number;
  fill_date: string;
  price: number;
  payment_state: string;
  comment: string;
  driver_username: string;
  driver_phone_number: string;
  car_number: string;
  id: number;
}

export function UnloadingPages() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [results, setResults] = useState<Result[]>([]);
  const [editingPaymentState, setEditingPaymentState] = useState<{ [key: number]: string }>({});

  const handleSearch = async (phone: string) => {
    try {
      const response = await API.CRM.PROTECTED.post('/get_info_by_phone_new', {
        phone_number: phone
      });
      setResults(response.data);
    } catch (error) {
      if ((error as any).response.status === 401) {
        message.error('Проблема с аутентификацией. Пожалуйста, войдите заново.');
      } else {
        message.error('Ошибка при поиске данных');
      }
    }
  };

  const handleSendSMS = async (recipient: string, shipmentId: number) => {
    try {
      await API.CRM.PROTECTED.post('/send_sms', {
        recipient,
        shipmentId
      });
  
      // Обновляем статус заказа на "Заказ на складе"
      await API.CRM.PROTECTED.put('/update_status_new', {
        recipient_phone_number: recipient,
        status: 'Заказ на складе'
      });
  
      handleSearch(phoneNumber);
      message.success('СМС отправлено успешно');
    } catch (error) {
      if ((error as any).response.status === 401) {
        message.error('Проблема с аутентификацией. Пожалуйста, войдите заново.');
      } else {
        message.error('Ошибка при отправке СМС');
      }
    }
  };
  

  const handlePaymentStateChange = (id: number, value: string) => {
    setEditingPaymentState((prev) => ({ ...prev, [id]: value }));
  };

  const handleSavePaymentState = async (id: number) => {
    try {
      const paymentState = editingPaymentState[id];
      await API.CRM.PROTECTED.post('/update_payment_state_new', {
        id,
        payment_state: paymentState
      });
      handleSearch(phoneNumber);
      message.success('Статус оплаты обновлен успешно');
    } catch (error) {
      if ((error as any).response.status === 401) {
        message.error('Проблема с аутентификацией. Пожалуйста, войдите заново.');
      } else {
        message.error('Ошибка при обновлении статуса оплаты');
      }
    }
  };

  const debouncedSearch = debounce(handleSearch, 300);

  const handleChange = (value: string) => {
    setPhoneNumber(value);
    debouncedSearch(value);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <Input
        placeholder="Введите номер телефона"
        size="large"
        onChange={(e) => handleChange(e.target.value)}
        value={phoneNumber}
        style={{ marginBottom: '20px' }}
      />
      {results.map((item, index) => (
        <Card key={index} title={`Товар: ${item.cargo_description}`} style={{ marginTop: '20px' }}>
          <Typography.Text type='success'>Количество отправленных СМС: {item.sms_sent_counter}</Typography.Text>
          <p>ФИО получателя: {item.recipient_name}</p>
          <p>Телефон получателя: {item.recipient_phone_number}</p>
          <p>Количество чеков: {item.check_number}</p>
          <p>Количество груза: {item.cargo_col}</p>
          <p>Дата заполнения: {item.fill_date}</p>
          <p>Цена: {item.price}</p>
          <p>Статус оплаты:
            <Select
              value={editingPaymentState[item.id] || item.payment_state}
              onChange={(value) => handlePaymentStateChange(item.id, value)}
              style={{ width: 120, marginLeft: '10px' }}
            >
              <Option value="Оплачено">Оплачено</Option>
              <Option value="Не оплачено">Не оплачено</Option>
            </Select>
          </p>
          <p>Комментарий: {item.comment}</p>
          <Button style={{ backgroundColor: 'green' }} type="primary" onClick={() => handleSendSMS(item.recipient_phone_number, item.id)}>
            Отправить СМС
          </Button>
          <Button style={{ marginLeft: '10px' }} type="primary" onClick={() => handleSavePaymentState(item.id)}>
            Сохранить статус оплаты
          </Button>
        </Card>
      ))}
    </div>
  );
}
