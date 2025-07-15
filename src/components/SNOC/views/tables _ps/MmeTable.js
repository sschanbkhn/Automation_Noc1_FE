import { Row, Col, Card, Table, Button } from 'react-bootstrap';
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { faDeleteLeft, faEdit, faKey } from '@fortawesome/free-solid-svg-icons';
import { fetchUsers, selectUser, toggleModalCreate, toggleModalUpdate, toggleModalDelete, toggleChangePasswordModal } from '../../redux/User/userSlice';
// import { fetchUsers, selectUser, toggleModalCreate, toggleModalUpdate, toggleModalDelete, toggleChangePasswordModal } from '../../redux/User/userSlice';

import CreateUserModal from '../../components/Modal/User/CreateUserModal';
import DeleteUserModal from '../../components/Modal/User/DeleteUserModal';
import UpdateUserModal from '../../components/Modal/User/UpdateUserModal';
import ChangePasswordModal from '../../components/Modal/User/ChangePasswordModal';
import ExportExcel from '../../components/Export/UserExportExcel';
import { sortData, createRequestSortFunction, getClassNamesFor, filterData } from '../../utils/tableUtils'; // Import the sorting function
// import JobStatus from './JobStatus';
// import { jwtDecode } from 'jwt-decode';

import { postGetInfoSub } from '../../redux/Sub/subSlice';

function MmeTable() {
    const dispatch = useDispatch();
    // const token = useSelector((state) => state.account.token);
    // console.log(token)
    // // const token = state.account.token;
    // // const decodedToken = jwtDecode(token);
    // // console.log(decodedToken.exp);
    // // const now = Date.now().valueOf() / 1000;
    // // console.log(now);
    // // console.log(decodedToken.exp < now)
    // const tokenFromLocalStorage = localStorage.getItem('tokenKey'); // Replace 'tokenKey' with your actual key

    // console.log('Token from localStorage:', tokenFromLocalStorage);
    const subs = useSelector((state) => state.sub.subs);
    console.log(subs)
    const status = useSelector((state) => state.sub.status);
    const error = useSelector((state) => state.sub.error);
    const errorPostGetInfoSub = useSelector((state) => state.sub.errorPostGetInfoSub);
    const refresh = useSelector((state) => state.sub.refresh);
    // console.log(refreshDepart)


    // useEffect(() => {
    //     dispatch();
    // }, [refresh, dispatch]); // Trigger useEffect on refresh change

    useEffect(() => {
        if (refresh) {
            dispatch(postGetInfoSub([])); // Example: Refresh logic
        }
    }, [refresh, dispatch]);

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
        if (key === "is_superuser") {
            modifiedKey = "super";
        } else if (key === "username") {
            modifiedKey = "name";
        } else if (key.includes("is_")) {
            modifiedKey = key.replace("is_", "");
        }
        return modifiedKey.toUpperCase();
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
    const excludedFieldsFilter = []; // Fields to exclude from search
    const filteredData = filterData(subs, searchTerm, excludedFieldsFilter);
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

    // const jobId = '12345'; // Replace with actual job ID



    return (
        <React.Fragment>
            {status === 'loading' && <div>Loading...</div>}
            {status === 'failed' && errorPostGetInfoSub && < div className="text-danger">
                {typeof errorPostGetInfoSub === 'string' ? errorPostGetInfoSub : JSON.stringify(error)}
            </div>}
            <Row >
                <Col >
                    <Card >
                        <div className="d-flex bd-highlight ">
                            <div className="p-0 flex-grow-1 bd-highlight "><span >Sub Info </span></div>


                            {/* <div className="p-0 bd-highlight"><ExportExcel sortedData={sortedData} excludedFields={excludedFields} toFriendlyName={toFriendlyName} renderCell={renderCell} formatDate={formatDate} fileName={'User'} /></div>
                            <div className="p-0 bd-highlight"><Button variant="primary" className='btn-ct' onClick={() => dispatch(toggleModalCreate())}>
                                <i className="feather icon-user-plus auth-icon mx-1" ></i>
                                add user
                            </Button></div> */}
                            {/* <div className="p-0 bd-highlight ">
                                <span > <input
                                    type="text"
                                    placeholder="Search..."
                                    value={searchTerm}
                                    onChange={handleSearchChange}
                                    className=" form-control  custom-input-height"
                                /></span>


                            </div> */}
                        </div>
                        <Table className="table-custom1 ">
                            {subs.length > 0 && Object.keys(subs[0]).length > 0 && (
                                <>
                                    <thead className="table-primary table-custom1">
                                        <tr>
                                            {Object.keys(subs[0])
                                                .filter((key) => !excludedFields.includes(key))
                                                .map((key) => (
                                                    <th key={key}
                                                        onClick={() => requestSort(key)} className={getClassNamesFor(key)}
                                                    >{toFriendlyName(key)}</th>
                                                ))}
                                            {/* <th>Delete</th>
                                            <th>Update</th>
                                            <th>Change password</th> */}
                                        </tr>
                                    </thead >
                                    <tbody>
                                        {subs.map((value, index) => (
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
                                                {/* <td>
                                                    <FontAwesomeIcon icon={faDeleteLeft} className="icon-pointer" onClick={() => handleDelete(value)} />
                                                </td>
                                                <td>
                                                    <FontAwesomeIcon icon={faEdit} className="icon-pointer" onClick={() => handleUpdate(value)} />
                                                </td>
                                                <td>
                                                    <FontAwesomeIcon icon={faKey} className="icon-pointer" onClick={() => handleChangePassword(value)} />
                                                </td> */}
                                            </tr>
                                        ))}
                                    </tbody>
                                </>
                            )}
                        </Table>
                        {/* <CreateUserModal />
                        <DeleteUserModal />
                        <UpdateUserModal /> */}
                        {/* <ChangePasswordModal /> */}
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


            {/* <JobStatus jobId={jobId} /> */}
        </React.Fragment>

    );
}

export default MmeTable;
