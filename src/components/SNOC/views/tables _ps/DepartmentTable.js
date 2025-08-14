
import { Row, Col, Card, Table, Button } from 'react-bootstrap';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDeleteLeft, faEdit } from '@fortawesome/free-solid-svg-icons';
import { fetchDepartments, selectDepartment, toggleModalCreateDepartment, toggleModalUpdateDepartment, toggleModalDeleteDepartment } from '../../redux/User/departmentSlice';
import CreateDepartmentModal from '../../components/Modal/User/CreateDepartmentModal';
import DeleteDepartmentModal from '../../components/Modal/User/DeleteDepartmentModal';
import UpdateDepartmentModal from '../../components/Modal/User/UpdateDepartmentModal';
import { sortData, createRequestSortFunction, getClassNamesFor, filterData } from '../../utils/tableUtils'; // Import the sorting function
import ExportExcel from '../../components/Export/UserExportExcel';
function DepartmentTable() {
    const dispatch = useDispatch();


    const departments = useSelector((state) => state.department.departments);
    const statusDepartment = useSelector((state) => state.department.statusDepartment);
    const errorDepartment = useSelector((state) => state.department.errorDepartment);
    const refreshDepart = useSelector((state) => state.department.refreshDepart);
    const handleUpdate = (department) => {
        // console.log(department)
        dispatch(selectDepartment(department));
        dispatch(toggleModalUpdateDepartment());
    };
    const handleDelete = (department) => {
        dispatch(selectDepartment(department));
        dispatch(toggleModalDeleteDepartment());
    };
    useEffect((department) => {
        dispatch(fetchDepartments(department));
    }, [refreshDepart, dispatch]); // Trigger useEffect on refresh change

    const formatBoolean = (value) => {
        return value ? 'True' : 'False';
    };


    const formatDate = (dateString) => {
        if (!dateString) return '';
        const options = {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false, // Use 24-hour format
        };

        return new Date(dateString).toLocaleString('en-GB', options).replace(',', '');
    };

    // Define fields to be excluded
    const excludedFields = [];

    const toFriendlyName = (key) => {
        let modifiedKey = key;
        if (key === "department") {
            modifiedKey = "depart";
        }
        return modifiedKey.toUpperCase()
    };

    const renderCell = (data, key) => {
        if (typeof data === 'object' && data !== null) {
            // Adjust this to display the desired field from the nested object
            return data.name ? data.name : JSON.stringify(data);
        }
        return data;
    };


    // search function start
    const [searchTerm, setSearchTerm] = useState('');
    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };
    const excludedFieldsFilter = ['date']; // Fields to exclude from search
    const filteredData = filterData(departments, searchTerm, excludedFieldsFilter);
    // search function end



    // sorting function start
    const defaultSortColumn = 'name'
    const defaultSortDirection = 'asc'

    const [sortConfig, setSortConfig] = useState({ key: defaultSortColumn, direction: defaultSortDirection });
    const requestSort = createRequestSortFunction(setSortConfig, sortConfig);
    const sortedData = React.useMemo(() => {
        return sortData(filteredData, sortConfig.key, sortConfig.direction);
    }, [filteredData, sortConfig]);
    // sorting function end

    // Pagination  function start
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5; // Adjust this value as needed
    const totalPages = Math.ceil(sortedData.length / itemsPerPage);
    const currentData = sortedData.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );
    const handlePageChange = (page) => {
        setCurrentPage(page);
    };
    // Pagination   function end



    return (
        <React.Fragment>
            {statusDepartment === 'loading' && <div>Loading...</div>}
            {statusDepartment === 'failed' && errorDepartment && < div className="text-danger">
                {typeof errorDepartment === 'string' ? errorDepartment : JSON.stringify(errorDepartment)}
            </div>}
            <Row >
                <Col >
                    <Card >
                        <div className="d-flex bd-highlight my-0">
                            <div className="p-0 flex-grow-1 bd-highlight "><span >Admin Departments </span></div>
                            <div className="p-0 bd-highlight"><ExportExcel sortedData={sortedData} excludedFields={excludedFields} toFriendlyName={toFriendlyName} renderCell={renderCell} formatDate={formatDate} fileName={'Department'} /></div>
                            <div className="p-0 bd-highlight "><Button variant="primary" className='btn-ct' onClick={() => dispatch(toggleModalCreateDepartment())}>
                                <i className="feather icon-user-plus auth-icon mx-1" ></i>
                                add depart
                            </Button></div>
                            <div className="p-0 bd-highlight ">
                                <span > <input
                                    type="text"
                                    placeholder="Search..."
                                    value={searchTerm}
                                    onChange={handleSearchChange}
                                    className=" form-control  custom-input-height"
                                /></span>
                            </div>
                        </div>
                        <Table className="table-custom1">
                            {currentData.length > 0 && Object.keys(currentData[0]).length > 0 && (
                                <>
                                    <thead className="table-primary table-custom1">
                                        <tr>
                                            {Object.keys(currentData[0])
                                                .filter((key) => !excludedFields.includes(key))
                                                .map((key) => (
                                                    <th key={key} onClick={() => requestSort(key)} className={getClassNamesFor(key)}>
                                                        {toFriendlyName(key)}
                                                    </th>
                                                ))}
                                            <th>Delete</th>
                                            <th>Update</th>
                                        </tr>
                                    </thead >
                                    <tbody>
                                        {currentData.map((value, index) => (
                                            <tr key={index}>
                                                {Object.keys(value)
                                                    .filter((key) => !excludedFields.includes(key))
                                                    .map((key) => (
                                                        <td key={key}>
                                                            {typeof value[key] === 'boolean'
                                                                ? formatBoolean(value[key])
                                                                : key.includes('date') || key.includes('time')
                                                                    ? formatDate(value[key])
                                                                    : renderCell(value[key], key)}
                                                        </td>
                                                    ))}

                                                <td>
                                                    <FontAwesomeIcon icon={faDeleteLeft} className="icon-pointer" onClick={() => handleDelete(value)} />
                                                </td>
                                                <td>
                                                    <FontAwesomeIcon icon={faEdit} className="icon-pointer" onClick={() => handleUpdate(value)} />
                                                </td>

                                            </tr>
                                        ))}
                                    </tbody>
                                </>
                            )}
                        </Table>
                        <CreateDepartmentModal />
                        <DeleteDepartmentModal />
                        <UpdateDepartmentModal />
                        {/* Pagination controls */}
                        {totalPages > 1 && (
                            <div className="pagination">
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                    <button
                                        key={page}
                                        onClick={() => handlePageChange(page)}
                                        className={page === currentPage ? 'active' : ''}
                                    >
                                        {page}
                                    </button>
                                ))}
                            </div>
                        )}
                    </Card>
                </Col>
            </Row>
        </React.Fragment>

    );
}
export default DepartmentTable;
