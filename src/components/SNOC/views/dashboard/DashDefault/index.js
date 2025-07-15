import React from 'react';
import { Row, Col, Tabs, Tab, Nav } from 'react-bootstrap';
import ModuleNotification from '../../../components/Widgets/Statistic/Notification';
import FormsElements from '../../forms/FormsElements';
import Goicuocs from '../../forms/Goicuocs';
import Mmee from '../../forms/Mmee';
import Info from '../../forms/Info';

const DashDefault = () => {
    return (
        <React.Fragment>

            <Row>
                <Col>
                    <Tabs defaultActiveKey="check">
                        <Tab eventKey="check" title="CHECK SUB">
                            <FormsElements />
                        </Tab>
                        <Tab eventKey="package" title="Gói Cước">
                            <Goicuocs />
                        </Tab>
                        <Tab eventKey="mmee" title="Mmee">
                            <Mmee />
                        </Tab>
                        <Tab eventKey="info" title="Info">
                            <Info />
                        </Tab>
                    </Tabs>


                </Col>
            </Row>
        </React.Fragment>
    );
};

export default DashDefault;