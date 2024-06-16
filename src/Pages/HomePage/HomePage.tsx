import { Button, Col, Row, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';
import './HomePage.css';

const { Title } = Typography;

export function HomePage() {
    const navigate = useNavigate();
    return (
        <div className="home-page-container">
            <div className="background-image"></div>
            <div className="content">
                <Row gutter={[16, 16]} justify="center">
                    <Col xs={24} sm={12} md={10} lg={8} xl={6}>
                        <div className="section-container">
                            <Title level={2} className="responsive-title">ПОГРУЗКА</Title>
                            <Button
                                className="responsive-button"
                                size="large"
                                block
                                onClick={() => navigate('/shipment')}
                            >
                                Алматы - Караганда
                            </Button>
                            <Button
                                className="responsive-button"
                                size="large"
                                block
                                onClick={() => navigate('/shipment-pages')}
                            >
                                Караганда - Алматы
                            </Button>
                        </div>
                    </Col>
                    <Col xs={24} sm={12} md={10} lg={8} xl={6}>
                        <div className="section-container">
                            <Title level={2} className="responsive-title">ВЫГРУЗКА</Title>
                            <Button
                                className="responsive-button"
                                size="large"
                                block
                                onClick={() => navigate('/unloading')}
                            >
                                Караганда
                            </Button>
                            <Button
                                className="responsive-button"
                                size="large"
                                block
                                onClick={() => navigate('/unloading-pages')}
                            >
                                Алматы
                            </Button>
                        </div>
                    </Col>
                </Row>
            </div>
        </div>
    );
}
