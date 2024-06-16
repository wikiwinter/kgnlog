CREATE DATABASE bd_1;
USE bd_1;
CREATE TABLE user (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(100) NOT NULL,
    phone_number VARCHAR(20),
    email VARCHAR(100),
    cargo_number VARCHAR(20)
);

CREATE TABLE sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    token VARCHAR(100) UNIQUE NOT NULL,
    FOREIGN KEY (user_id) REFERENCES user(id)
);

CREATE TABLE qr_save (
    id INT AUTO_INCREMENT PRIMARY KEY,
    recipient_phone_number VARCHAR(20),
    recipient_name VARCHAR(50),
    cargo_description VARCHAR(200),
    check_number INT,
    truck_type VARCHAR(50),
    payment_state VARCHAR(50),
    status VARCHAR(50),
    cargo_col INT,
    price INT,
    comment VARCHAR(200),
    fill_date DATETIME,
    driver_username VARCHAR(50),
    driver_phone_number VARCHAR(20),
    car_number VARCHAR(20),
    sms_sent_counter INT DEFAULT 0
);

CREATE TABLE qr_save_new (
    id INT AUTO_INCREMENT PRIMARY KEY,
    recipient_phone_number VARCHAR(20),
    recipient_name VARCHAR(50),
    cargo_description VARCHAR(200),
    check_number INT,
    truck_type VARCHAR(50),
    payment_state VARCHAR(50),
    status VARCHAR(50),
    cargo_col INT,
    price INT,
    comment VARCHAR(200),
    fill_date DATETIME,
    driver_username VARCHAR(50),
    driver_phone_number VARCHAR(20),
    car_number VARCHAR(20),
    sms_sent_counter INT DEFAULT 0
);






select * from user;
select * from sessions;
drop database bd_1