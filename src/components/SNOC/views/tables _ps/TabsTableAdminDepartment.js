import React from 'react';
import { Row, Col } from 'react-bootstrap';
import DepartmentTable from './DepartmentTable';
import { NavLink } from 'react-router-dom';
const TabsTableAdminUser = () => {
    return (
        <React.Fragment>
            <Row>
                <Col>
                    <div className="btn-group" size="sm" role="group" aria-label="Basic example">
                        <NavLink to="/tables/tabstableadminuser" className="btn btn-sm btn-light py-0" activeClassName="active">
                            User
                        </NavLink>
                        <NavLink to="/tables/tabstableadmingroup" className="btn btn-sm btn-light py-0" activeClassName="active">
                            Group
                        </NavLink>
                        <NavLink to="/tables/tabstableadmindepartment" className="btn btn-sm btn-light py-0" activeClassName="active">
                            Department
                        </NavLink>
                    </div>

                    <DepartmentTable />


                </Col>
            </Row>
        </React.Fragment>
    );
};

export default TabsTableAdminUser;
