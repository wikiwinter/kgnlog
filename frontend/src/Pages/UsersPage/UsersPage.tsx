import { useState, useEffect } from 'react';
import { Table, Button, DatePicker, message } from 'antd';
import * as XLSX from 'xlsx';
import './UsersPage.css';

interface QRData {
    recipient_name: string;
    recipient_phone_number: string;
    loading: string;
    price: number | null;
    payment_state: string;
    status: string;
    date: string;
}

interface QRDataByDate {
    [date: string]: QRData[];
}

const UsersPage = () => {
    const [qrDataByDate, setQrDataByDate] = useState<QRDataByDate>({});
    const [totalPriceByDate, setTotalPriceByDate] = useState<{ [date: string]: number }>({});
    const [selectedDate, setSelectedDate] = useState<string>('');

    useEffect(() => {
        fetchAllQrData();
    }, []);

    const fetchAllQrData = async () => {
        try {
            const currentDate = new Date();
            const dates = [];
            for (let i = 0; i < 7; i++) {
                const date = new Date(currentDate);
                date.setDate(date.getDate() - i);
                const formattedDate = formatDate(date);
                dates.push(formattedDate);
            }

            const qrData: QRDataByDate = {};
            const totalPrice: { [date: string]: number } = {};
            for (const date of dates) {
                const dataFromQrSave = await fetchQrDataByDate(date);
                qrData[date] = dataFromQrSave;
                totalPrice[date] = calculateTotalPrice(dataFromQrSave);
            }

            setQrDataByDate(qrData);
            setTotalPriceByDate(totalPrice);
        } catch (error: any) {
            console.error('Ошибка при получении данных QR:', error);
            message.error(`Ошибка при получении данных QR: ${error.message}`);
        }
    };

    const fetchQrDataByDate = async (date: string): Promise<QRData[]> => {
        const response = await fetch(`http://127.0.0.1:5000/get_all_qr_data?date=${date}`);
        if (!response.ok) {
            throw new Error('Не удалось получить данные QR');
        }
        return response.json();
    };

    const updateStatus = async (date: string, index: number) => {
        try {
            const updatedQrData = [...qrDataByDate[date]];
            updatedQrData[index].status = 'Заказ выдан';
    
            const response = await fetch(`http://127.0.0.1:5000/get_all_qr_data`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    date: date,
                    recipient_phone_number: updatedQrData[index].recipient_phone_number,
                    recipient_name: updatedQrData[index].recipient_name,
                    loading: updatedQrData[index].loading,
                    status: 'Заказ выдан',
                }),
            });
    
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Не удалось обновить статус заказа');
            }
    
            const updatedQrDataByDate = { ...qrDataByDate, [date]: updatedQrData };
            setQrDataByDate(updatedQrDataByDate);
            message.success('Статус заказа успешно обновлен');
        } catch (error: any) {
            console.error('Ошибка при обновлении статуса заказа:', error);
            message.error(`Ошибка при обновлении статуса заказа: ${error.message}`);
        }
    };
    

    const formatDate = (date: Date) => {
        return date.toISOString().split('T')[0];
    };

    const columns = [
        {
            title: 'Имя заказчика',
            dataIndex: 'recipient_name',
            key: 'recipient_name',
        },
        {
            title: 'Номер телефона заказчика',
            dataIndex: 'recipient_phone_number',
            key: 'recipient_phone_number',
        },
        {
            title: 'Погрузка',
            dataIndex: 'loading',
            key: 'loading',
        },
        {
            title: 'Цена',
            dataIndex: 'price',
            key: 'price',
            render: (price: number | null) => <span>{price !== null ? price.toFixed(2) : 'N/A'}</span>,
        },
        {
            title: 'Статус оплаты',
            dataIndex: 'payment_state',
            key: 'payment_state',
        },
        {
            title: 'Статус заказа',
            dataIndex: 'status',
            key: 'status',
            render: (text: string, record: QRData, index: number) => (
                <div>
                    <span>{text}</span>
                    <Button 
                        type="primary" 
                        style={{ marginLeft: '10px' }}
                        onClick={() => updateStatus(record.date, index)}
                        disabled={text === 'Заказ выдан'}
                    >
                        Выдан
                    </Button>
                </div>
            ),
        },
    ];

    const calculateTotalPrice = (data: QRData[]) => {
        return data.reduce((total, entry) => total + (entry.price ?? 0), 0);
    };

    const exportToExcel = (date: string) => {
        const wb = XLSX.utils.book_new();
        
        // Define the mapping from original field names to Russian titles
        const fieldMap: { [key in keyof QRData]: string } = {
            recipient_name: 'Имя заказчика',
            recipient_phone_number: 'Номер телефона заказчика',
            loading: 'Погрузка',
            price: 'Цена',
            payment_state: 'Статус оплаты',
            status: 'Статус заказа',
            date: 'Дата'
        };

        // Transform the data to use the Russian titles
        const transformedData = qrDataByDate[date].map((item) => {
            const newItem: { [key: string]: any } = {};
            Object.keys(item).forEach((key) => {
                const newKey = fieldMap[key as keyof typeof fieldMap] || key;
                newItem[newKey] = item[key as keyof QRData];
            });
            return newItem;
        });

        const ws = XLSX.utils.json_to_sheet(transformedData);
        XLSX.utils.book_append_sheet(wb, ws, date);
        XLSX.writeFile(wb, `Данные за ${date}.xlsx`);
    };

    const handleDateChange = (date: any) => {
        setSelectedDate(date.format('YYYY-MM-DD'));
    };

    const handleSearch = async () => {
        if (selectedDate) {
            try {
                const dataFromQrSave = await fetchQrDataByDate(selectedDate);
                setQrDataByDate({ [selectedDate]: dataFromQrSave });
                setTotalPriceByDate({ [selectedDate]: calculateTotalPrice(dataFromQrSave) });
            } catch (error: any) {
                console.error('Ошибка при получении данных QR:', error);
                message.error(`Ошибка при получении данных QR: ${error.message}`);
            }
        }
    };

    return (
        <div>
            <DatePicker onChange={handleDateChange} />
            <Button type="primary" onClick={handleSearch}>Поиск</Button>
            {Object.entries(qrDataByDate).map(([date, qrData]) => {
                return (
                    <div key={date}>
                        <h1>Таблица данных за {date}</h1>
                        <Table
                            dataSource={qrData.map((item, idx) => ({ ...item, key: idx, date }))}
                            columns={columns}
                            pagination={false}
                            footer={() => (
                                <div>
                                    <p className="total-price">Общая цена: {totalPriceByDate[date]?.toFixed(2)}</p>
                                    <Button type="primary" onClick={() => exportToExcel(date)}>Экспорт в Excel</Button>
                                </div>
                            )}
                        />
                    </div>
                );
            })}
        </div>
    );
};

export default UsersPage;
