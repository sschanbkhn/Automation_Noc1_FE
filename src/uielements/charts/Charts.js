import React from "react";

import {
  Col,
  Row,
} from "reactstrap";
import Widget from "../../DashboardJS/Widget/Widget";
import ApexRadarChart from "../../uielements/charts/components/ApexRadarChart";
// import RechartsPieChart from ".../../uielements/charts/components/RechartsPieChart";
import ApexLineChart from "../../uielements/charts/components/ApexLineChart";
import ApexColumnAreaChart from "../../uielements/charts/components/ApexColumnAreaChart";
import ApexLineColumnChart from "../../uielements/charts/components/ApexLineColumnChart";
import RechartsPieChart from 'uielements/charts/components/RechartsPieChart';  // This should work if the alias is correct

const Charts = () => {
  return (
    <div>
      <Row>
        <Col className="pr-grid-col" xs={12} lg={6}>
          <Row className="gutter mb-4">
            <Col>
              <Widget className="widget-p-md">
                <div className="headline-2 mb-3">Lưu lượng di động toàn mạng</div>
                <ApexLineColumnChart/>
              </Widget>
            </Col>
          </Row>
          <Row className="gutter mb-4">
            <Col>
              <Widget className="widget-p-md">
                <div className="headline-2 mb-3">Lưu lượng theo ngày</div>
                <ApexColumnAreaChart/>
              </Widget>
            </Col>
          </Row>
        </Col>
        <Col className="pl-grid-col pr-grid-col" xs={12} lg={6}>
          <Row className="gutter mb-4 pl-grid-row pr-grid-row">
            <Col xs={12} xl={6}>
              <Widget className="widget-p-md">
                <div className="headline-2 mb-3">Các loại cảnh báo</div>
                <RechartsPieChart/>
              </Widget>
            </Col>
            <Col className="mt-4 mt-xl-0" xs={12} xl={6}>
              <Widget className="widget-p-md">
                <div className="headline-2">Các cuộc tấn công mạng</div>
                <ApexRadarChart/>
              </Widget>
            </Col>
          </Row>
          <Row>
            <Col>
              <Widget className="widget-p-md">
                <div className="headline-2 mb-3">Lưu lượng Down/Up</div>
                <ApexLineChart/>
              </Widget>
            </Col>
          </Row>
        </Col>
      </Row>
    </div>
  );
}

export default Charts;
