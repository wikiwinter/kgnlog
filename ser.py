from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager, jwt_required, create_access_token, create_refresh_token, get_jwt_identity
from flask_cors import CORS
import flask
import bcrypt
import os
import qrcode
from flask_mysqldb import MySQL
from datetime import datetime, timedelta
from flask import send_file
import tempfile
from sqlalchemy import or_


import requests

app = flask.Flask(__name__)

# Параметры для подключения к базе данных MySQL
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql://root:rihiho089!A@127.0.0.1/bd_1'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Настройка для Flask-JWT-Extended
app.config['JWT_SECRET_KEY'] = 'secret_key'  # Замените на секретный ключ
app.config['JWT_TOKEN_LOCATION'] = ['cookies', 'headers']
app.config['JWT_REFRESH_COOKIE_NAME'] = 'refresh_token'
app.config['JWT_COOKIE_CSRF_PROTECT'] = False
jwt = JWTManager(app)

db = SQLAlchemy(app)
CORS(app, origins=['http://localhost:5173'], supports_credentials=True)

# Модели для SQLAlchemy
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    password = db.Column(db.String(100), nullable=False)
    phone_number = db.Column(db.String(20))
    email = db.Column(db.String(100))
    cargo_number = db.Column(db.String(20))

class Qr_save(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    recipient_phone_number = db.Column(db.String(20))
    recipient_name = db.Column(db.String(50))
    cargo_description = db.Column(db.String(200))
    check_number = db.Column(db.Integer)
    truck_type = db.Column(db.String(50))
    cargo_col = db.Column(db.Integer)
    fill_date = db.Column(db.DateTime)
    driver_phone_number = db.Column(db.String(20))
    driver_username = db.Column(db.String(50))
    car_number = db.Column(db.String(20))
    price = db.Column(db.Float)
    comment = db.Column(db.String(200))
    sms_sent_counter = db.Column(db.Integer, default=0)
    payment_state = db.Column(db.String(50))  # Новое поле
    status = db.Column(db.String(50))

class Qr_save_new(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    recipient_phone_number = db.Column(db.String(20))
    recipient_name = db.Column(db.String(50))
    cargo_description = db.Column(db.String(200))
    check_number = db.Column(db.Integer)
    truck_type = db.Column(db.String(50))
    cargo_col = db.Column(db.Integer)
    fill_date = db.Column(db.DateTime)
    driver_phone_number = db.Column(db.String(20))
    driver_username = db.Column(db.String(50))
    car_number = db.Column(db.String(20))
    price = db.Column(db.Float)
    comment = db.Column(db.String(200))
    sms_sent_counter = db.Column(db.Integer, default=0)
    payment_state = db.Column(db.String(50))  # Новое поле
    status = db.Column(db.String(50))
    
@app.route('/update_status_new', methods=['PUT'])
@jwt_required()
def update_status_new():
    try:
        data = request.json
        recipient_phone_number = data.get('recipient_phone_number')
        recipient_name = data.get('recipient_name')
        cargo_description = data.get('cargo_description')
        check_number = data.get('check_number')
        truck_type = data.get('truck_type')
        cargo_col = data.get('cargo_col')
        status = data.get('status')
        
        if not status:
            return jsonify({'error': 'Статус обязателен'}), 400

        # Constructing the query
        query_params = {'recipient_phone_number': recipient_phone_number}
        if all((recipient_name, cargo_description, check_number, truck_type, cargo_col)):
            query_params.update({
                'recipient_name': recipient_name,
                'cargo_description': cargo_description,
                'check_number': check_number,
                'truck_type': truck_type,
                'cargo_col': cargo_col
            })

        # Querying the database
        qr_record = Qr_save_new.query.filter_by(**query_params).first()
        
        if qr_record:
            qr_record.status = status
            db.session.commit()  # Сохраняем изменения в базе данных
            return jsonify({'message': 'Статус успешно обновлен'}), 200
        else:
            return jsonify({'error': 'Запись не найдена'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500




# Обновление статуса заказа только в таблице qr_save
@app.route('/update_status', methods=['PUT'])
@jwt_required()
def update_status():
    try:
        data = request.json
        recipient_phone_number = data.get('recipient_phone_number')
        recipient_name = data.get('recipient_name')
        cargo_description = data.get('cargo_description')
        check_number = data.get('check_number')
        truck_type = data.get('truck_type')
        cargo_col = data.get('cargo_col')
        status = data.get('status')
        
        if not status:
            return jsonify({'error': 'Статус обязателен'}), 400

        # Constructing the query
        query_params = {'recipient_phone_number': recipient_phone_number}
        if all((recipient_name, cargo_description, check_number, truck_type, cargo_col)):
            query_params.update({
                'recipient_name': recipient_name,
                'cargo_description': cargo_description,
                'check_number': check_number,
                'truck_type': truck_type,
                'cargo_col': cargo_col
            })

        # Querying the database
        qr_record = Qr_save.query.filter_by(**query_params).first()
        
        if qr_record:
            qr_record.status = status
            db.session.commit()  # Сохраняем изменения в базе данных
            return jsonify({'message': 'Статус успешно обновлен'}), 200
        else:
            return jsonify({'error': 'Запись не найдена'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/get_all_qr_data', methods=['GET', 'POST'])
def get_or_update_qr_data():
    if request.method == 'GET':
        try:
            date_str = request.args.get('date')
            if date_str:
                date = datetime.strptime(date_str, '%Y-%m-%d').date()
            else:
                date = datetime.now().date()

            today_data = Qr_save.query.filter(db.func.DATE(Qr_save.fill_date) == date).all()
            today_data_new = Qr_save_new.query.filter(db.func.DATE(Qr_save_new.fill_date) == date).all()

            qr_data_list = []

            for entry_today in today_data:
                qr_entry_dict_today = {
                    'recipient_name': entry_today.recipient_name,
                    'recipient_phone_number': entry_today.recipient_phone_number,
                    'loading': 'Алматы - Караганда',
                    'price': entry_today.price,
                    'payment_state': entry_today.payment_state,
                    'status': entry_today.status
                }
                qr_data_list.append(qr_entry_dict_today)

            for entry_today_new in today_data_new:
                qr_entry_dict_today_new = {
                    'recipient_name': entry_today_new.recipient_name,
                    'recipient_phone_number': entry_today_new.recipient_phone_number,
                    'loading': 'Караганда - Алматы',
                    'price': entry_today_new.price,
                    'payment_state': entry_today_new.payment_state,
                    'status': entry_today_new.status
                }
                qr_data_list.append(qr_entry_dict_today_new)

            if not date_str:
                previous_dates_data = []
                for delta in range(1, 7):
                    previous_date = date - timedelta(days=delta)
                    for model in [Qr_save, Qr_save_new]:
                        previous_dates_data.extend(model.query.filter(db.func.DATE(model.fill_date) == previous_date).all())

                for entry in previous_dates_data:
                    qr_entry_dict = {
                        'recipient_name': entry.recipient_name,
                        'recipient_phone_number': entry.recipient_phone_number,
                        'loading': 'Алматы - Караганда' if isinstance(entry, Qr_save) else 'Караганда - Алматы',
                        'price': entry.price,
                        'payment_state': entry.payment_state,
                        'status': entry.status
                    }
                    qr_data_list.append(qr_entry_dict)

            return jsonify(qr_data_list)
        except Exception as e:
            return jsonify({'error': str(e)}), 500

    elif request.method == 'POST':
        try:
            data = request.get_json()
            date_str = data.get('date')
            recipient_phone_number = data.get('recipient_phone_number')
            new_status = data.get('status')

            date = datetime.strptime(date_str, '%Y-%m-%d').date()

            # Печать для отладки
            print(f"Updating status to '{new_status}' for recipient phone number '{recipient_phone_number}' on date '{date}'")

            entry = Qr_save.query.filter(db.func.DATE(Qr_save.fill_date) == date, Qr_save.recipient_phone_number == recipient_phone_number).first()
            if not entry:
                entry = Qr_save_new.query.filter(db.func.DATE(Qr_save_new.fill_date) == date, Qr_save_new.recipient_phone_number == recipient_phone_number).first()

            if entry:
                entry.status = new_status
                db.session.commit()
                print(f"Updated entry in {'Qr_save' if isinstance(entry, Qr_save) else 'Qr_save_new'}")
                return jsonify({'message': 'Статус успешно обновлен'})
            else:
                print("Entry not found")
                return jsonify({'message': 'Запись не найдена'}), 404
        except Exception as e:
            print(f"Error updating status: {e}")
            return jsonify({'error': str(e)}), 500


#-------------------------------------------------------------------------------------------------------------------------------------
# Роут для регистрации пользователя
@app.route('/register', methods=['POST'])
def register():
    data = request.json
    username = data.get('username')
    password = data.get('password')
    email = data.get('email')
    phone_number = data.get('phone_number')
    cargo_number = data.get('cargo_number')

    if not username or not password or not email or not phone_number:
        return jsonify({'error': 'Требуется имя пользователя, пароль, адрес электронной почты и номер телефона'}), 400

    # Проверка, что пользователь с таким именем или email не существует
    existing_user = User.query.filter(db.or_(User.username == username, User.email == email)).first()
    if existing_user:
        return jsonify({'error': 'Пользователь с таким именем или адресом электронной почты уже существует'}), 409

    # Хэширование пароля
    hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

    # Добавление пользователя в базу данных
    new_user = User(username=username, password=hashed_password, email=email, phone_number=phone_number, cargo_number=cargo_number)
    db.session.add(new_user)
    db.session.commit()

    # Создание и возврат access_token
    access_token = create_access_token(identity=username)
    refresh_token = create_refresh_token(identity=username)
    response = jsonify({'message': 'Пользователь успешно зарегистрирован', 'user_id': new_user.id, 'access_token': access_token})
    response.set_cookie('refresh_token', refresh_token, httponly=True)
    return response, 200

#-------------------------------------------------------------------------------------------------------------------------------------
# Роут для авторизации и получения токена
@app.route('/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({'error': 'Требуется имя пользователя и пароль'}), 400

    # Проверка, существует ли пользователь с указанным именем пользователя
    user = User.query.filter_by(username=username).first()

    if user:
        # Проверка соответствия пароля
        if bcrypt.checkpw(password.encode('utf-8'), user.password.encode('utf-8')):
            # Создание токенов доступа
            access_token = create_access_token(identity=username)
            refresh_token = create_refresh_token(identity=username)
            # Возвращение токенов доступа
            response = jsonify({'access_token': access_token})
            response.set_cookie('access_token', access_token, httponly=True, max_age=30 * 24 * 60 * 60 * 1000) 
            response.set_cookie('refresh_token', refresh_token, httponly=True)
            return response, 200
        else:
            return jsonify({'error': 'Неправильный пароль'}), 401
    else:
        return jsonify({'error': 'Пользователь не найден'}), 404

#-------------------------------------------------------------------------------------------------------------------------------------
# QR С ИНФОРМАЦИЕЙ НА ЧЕКЕ/ИНФОРМАЦИЕЙ О ВОДИТЕЛЕ
@app.route('/generate_qr', methods=['POST'])
@jwt_required()
def generate_qr():
    data = request.get_json()

    # Извлечение данных о чеке
    cargo_description = data.get('cargo_description')
    check_number = data.get('check_number')
    truck_type = data.get('truck_type')
    cargo_col = data.get('cargo_col')
    recipient_phone_number = data.get('recipient_phone_number')
    recipient_name = data.get('recipient_name')
    price = data.get('price')  
    comment = data.get('comment')  

    # Получение информации о водителе из токена доступа
    username = get_jwt_identity()
    user = User.query.filter_by(username=username).first()

    if not user:
        return jsonify({'error': 'Пользователь не найден'}), 404

    qr_data = Qr_save(recipient_phone_number=recipient_phone_number,
                      cargo_description=cargo_description,
                      check_number=check_number,
                      truck_type=truck_type,
                      cargo_col=cargo_col,
                      fill_date=datetime.now(),
                      driver_phone_number=user.phone_number,
                      recipient_name=recipient_name,
                      driver_username=user.username,
                      car_number=user.cargo_number,
                      price=price,
                      comment=comment)
    db.session.add(qr_data)
    db.session.commit()

    # Составление строки с информацией для QR кода
    qr_data_string = f"Номер телефона получателя: {recipient_phone_number}\n" \
                     f"Имя получателя: {recipient_name}\n" \
                     f"Количество груза: {cargo_col}\n" \
                     f"Описание груза: {cargo_description}\n" \
                     f"Количество чеков: {check_number}\n" \
                     f"Дата заполнения: {datetime.now().strftime('%d.%m.%Y %H:%M:%S')}\n" \
                     f"Выбор кузова: {truck_type}\n" \
                     f"Цена: {price}\n" \
                     f"Комментарий: {comment}\n" \
                     f"Имя водителя: {user.username}\n" \
                     f"Номер телефона водителя: {user.phone_number}\n" \
                     f"Номер фуры: {user.cargo_number}\n" 

    # Создание QR кода
    qr = qrcode.make(qr_data_string)

    # Создание временного файла для QR кода
    with tempfile.NamedTemporaryFile(delete=False) as temp_file:
        file_path = temp_file.name
        qr.save(file_path)

    # Возвращение QR кода как ответа
    return send_file(file_path, mimetype='image/png')

@app.route('/generate_qr_new', methods=['POST'])
@jwt_required()
def generate_qr_new():
    data = request.get_json()

    # Извлечение данных о чеке
    cargo_description = data.get('cargo_description')
    check_number = data.get('check_number')
    truck_type = data.get('truck_type')
    cargo_col = data.get('cargo_col')
    recipient_phone_number = data.get('recipient_phone_number')
    recipient_name = data.get('recipient_name')
    price = data.get('price')  
    comment = data.get('comment')  

    # Получение информации о водителе из токена доступа
    username = get_jwt_identity()
    user = User.query.filter_by(username=username).first()

    if not user:
        return jsonify({'error': 'Пользователь не найден'}), 404

    qr_data = Qr_save_new(recipient_phone_number=recipient_phone_number,
                      cargo_description=cargo_description,
                      check_number=check_number,
                      truck_type=truck_type,
                      cargo_col=cargo_col,
                      fill_date=datetime.now(),
                      driver_phone_number=user.phone_number,
                      recipient_name=recipient_name,
                      driver_username=user.username,
                      car_number=user.cargo_number,
                      price=price,
                      comment=comment)
    db.session.add(qr_data)
    db.session.commit()

    # Составление строки с информацией для QR кода
    qr_data_string = f"Номер телефона получателя: {recipient_phone_number}\n" \
                     f"Имя получателя: {recipient_name}\n" \
                     f"Количество груза: {cargo_col}\n" \
                     f"Описание груза: {cargo_description}\n" \
                     f"Количество чеков: {check_number}\n" \
                     f"Дата заполнения: {datetime.now().strftime('%d.%m.%Y %H:%M:%S')}\n" \
                     f"Выбор кузова: {truck_type}\n" \
                     f"Цена: {price}\n" \
                     f"Комментарий: {comment}\n" \
                     f"Имя водителя: {user.username}\n" \
                     f"Номер телефона водителя: {user.phone_number}\n" \
                     f"Номер фуры: {user.cargo_number}\n" 

    # Создание QR кода
    qr = qrcode.make(qr_data_string)

    # Создание временного файла для QR кода
    with tempfile.NamedTemporaryFile(delete=False) as temp_file:
        file_path = temp_file.name
        qr.save(file_path)

    # Возвращение QR кода как ответа
    return send_file(file_path, mimetype='image/png'), 200


#-------------------------------------------------------------------------------------------------------------------------------------
# Роут для обновления токена доступа
@app.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    current_user = get_jwt_identity()
    new_access_token = create_access_token(identity=current_user)
    return jsonify({'access_token': new_access_token}), 200

#-------------------------------------------------------------------------------------------------------------------------------------
# Роут поиска по номеру телефона в ВЫГРУЗКЕ
@app.route('/get_info_by_phone', methods=['POST'])
@jwt_required()
def get_info_by_phone():
    data = request.get_json()

    # Получение номера телефона из запроса
    phone_number = data.get('phone_number')

    # Получение информации о водителе из токена доступа
    username = get_jwt_identity()
    user = User.query.filter_by(username=username).first()

    if not user:
        return jsonify({'error': 'Пользователь не найден'}), 404

    # Поиск информации в базе данных по частичному совпадению номера телефона
    qr_data = Qr_save.query.filter(Qr_save.recipient_phone_number.like(f'%{phone_number}%')).all()
    if not qr_data:
        return jsonify({'error': 'Информация по номеру телефона не найдена'}), 404

    # Подготовка найденных данных для ответа
    info_list = []
    for qr_entry in qr_data:
        info = {
            'id': qr_entry.id,
            'recipient_name': qr_entry.recipient_name,
            'recipient_phone_number': qr_entry.recipient_phone_number,
            'cargo_description': qr_entry.cargo_description,
            'check_number': qr_entry.check_number,
            'truck_type': qr_entry.truck_type,
            'cargo_col': qr_entry.cargo_col,
            'price': qr_entry.price,
            'comment': qr_entry.comment,
            'fill_date': qr_entry.fill_date.strftime('%d.%m.%Y %H:%M:%S'),
            'driver_username': qr_entry.driver_username,
            'driver_phone_number': qr_entry.driver_phone_number,
            'car_number': qr_entry.car_number,
            'sms_sent_counter': qr_entry.sms_sent_counter,
            'payment_state': qr_entry.payment_state
        }
        info_list.append(info)

    return jsonify(info_list), 200

@app.route('/update_payment_state', methods=['POST'])
@jwt_required()
def update_payment_state():
    data = request.get_json()
    shipment_id = data.get('id')
    payment_state = data.get('payment_state')

    qr_entry = Qr_save.query.get(shipment_id)
    if not qr_entry:
        return jsonify({'error': 'Запись не найдена'}), 404

    qr_entry.payment_state = payment_state
    db.session.commit()

    return jsonify({'message': 'Статус оплаты обновлен успешно'}), 200

@app.route('/update_payment_state_new', methods=['POST'])
@jwt_required()
def update_payment_state_new():
    data = request.get_json()
    shipment_id = data.get('id')
    payment_state = data.get('payment_state')

    qr_entry = Qr_save_new.query.get(shipment_id)
    if not qr_entry:
        return jsonify({'error': 'Запись не найдена'}), 404

    qr_entry.payment_state = payment_state
    db.session.commit()

    return jsonify({'message': 'Статус оплаты обновлен успешно'}), 200



@app.route('/get_info_by_phone_new', methods=['POST'])
@jwt_required()
def get_info_by_phone_new():
    data = request.get_json()

    # Получение номера телефона из запроса
    phone_number = data.get('phone_number')

    # Получение информации о водителе из токена доступа
    username = get_jwt_identity()
    user = User.query.filter_by(username=username).first()

    if not user:
        return jsonify({'error': 'Пользователь не найден'}), 404

    # Поиск информации в базе данных по частичному совпадению номера телефона
    qr_data = Qr_save_new.query.filter(Qr_save_new.recipient_phone_number.like(f'%{phone_number}%')).all()
    if not qr_data:
        return jsonify({'error': 'Информация по номеру телефона не найдена'}), 404

    # Подготовка найденных данных для ответа
    info_list = []
    for qr_entry in qr_data:
        info = {
            'id': qr_entry.id,
            'recipient_name': qr_entry.recipient_name,
            'recipient_phone_number': qr_entry.recipient_phone_number,
            'cargo_description': qr_entry.cargo_description,
            'check_number': qr_entry.check_number,
            'truck_type': qr_entry.truck_type,
            'cargo_col': qr_entry.cargo_col,
            'price': qr_entry.price,
            'comment': qr_entry.comment,
            'fill_date': qr_entry.fill_date.strftime('%d.%m.%Y %H:%M:%S'),
            'driver_username': qr_entry.driver_username,
            'driver_phone_number': qr_entry.driver_phone_number,
            'car_number': qr_entry.car_number,
            'sms_sent_counter': qr_entry.sms_sent_counter,
            'payment_state': qr_entry.payment_state
        }
        info_list.append(info)

    return jsonify(info_list), 200


#-------------------------------------------------------------------------------------------------------------------------------------
# Роут отправки СМС по номеру телефона из ПОГРУЗКИ
@app.route('/send_sms', methods=['POST'])
@jwt_required()
def send_sms():
    try:
        # Получение данных из POST-запроса в формате JSON
        data = request.get_json()
        shipmentId = data.get('shipmentId')

        if not shipmentId or not data.get('recipient'):
            return jsonify({'error': 'Недостаточно данных для отправки СМС'}), 400

        # Параметры для запроса
        qrObject = Qr_save.query.filter_by(id=shipmentId).first()

        if qrObject is None:
            qrObject = Qr_save_new.query.filter_by(id=shipmentId).first()

        if qrObject is None:
            return jsonify({'error': 'Запись не найдена'}), 404

        payload = {
            "recipient": data['recipient'],  # Номер получателя
            "text": 'KGN_Logistics: Ваш товар прибыл на склад! Хранение платное - 500тг в сутки! Воскресенье - выходной день',  # Текст сообщения
            "params[validity]": 1440
        }
        
        # Выполнение запроса к API Mobizon
        response = requests.post(
            'https://api.mobizon.kz/service/message/sendSmsMessage',
            params={"output": "json", "api": "v1", "apiKey": "kz103a79ca3ebb545e2aef23d42f869ffca5350590ccd2ad0e4fb1a63c38474110bb39"},
            json=payload
        )

        # Проверка статуса ответа
        if response.ok:
            # В случае успеха увеличиваем счетчик и сохраняем изменения в базе данных
            qrObject.sms_sent_counter += 1
            db.session.commit()
            return jsonify({'success': True, 'message': 'СМС доставлено успешно'})
        else:
            # В случае ошибки возвращаем ошибку
            return jsonify({'success': False, 'message': 'Ошибка при отправке СМС', 'details': response.text}), 500

    except Exception as e:
        return jsonify({'error': str(e)}), 500
    

@app.route('/access', methods=['GET'])
@jwt_required()
def access():
    username = get_jwt_identity()
    userObject = User.query.filter_by(username=username).first()
    json_data = {
        'username': userObject.username,
        'phone_number': userObject.phone_number,
        'email': userObject.email,
        'cargo_number': userObject.cargo_number
    }
    return jsonify(json_data), 200


if __name__ == '__main__':
    app.run()