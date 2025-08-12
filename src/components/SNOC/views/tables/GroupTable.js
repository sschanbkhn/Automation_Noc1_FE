import { Row, Col, Card, Table, Button } from 'react-bootstrap';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDeleteLeft, faEdit } from '@fortawesome/free-solid-svg-icons';
import { fetchGroups, selectGroup, toggleModalCreateGroup, toggleModalUpdateGroup, toggleModalDeleteGroup } from './../../redux/User/groupSlice';
import DeleteGroupModal from '../../components/Modal/User/DeleteGroupModal';
import UpdateGroupModal from '../../components/Modal/User/UpdateGroupModal';
import CreateGroupModal from '../../components/Modal/User/CreateGroupModal';
import { sortData, createRequestSortFunction, getClassNamesFor, filterData } from '../../utils/tableUtils'; // Import the sorting function
import ExportExcel from '../../components/Export/UserExportExcel';

function GroupTable() {

    const dispatch = useDispatch();
    const groups = useSelector((state) => state.group.groups);
    const statusGroup = useSelector((state) => state.group.statusGroup);
    // const errorGroup = useSelector((state) => state.group.errorGroup);
    const errorGroupFetchgroup = useSelector((state) => state.group.errorGroupFetchgroup);
    const refreshGroup = useSelector((state) => state.group.refreshGroup);
    const refreshDepart = useSelector((state) => state.department.refreshDepart);
    // console.log(groups)
    const handleUpdate = (group) => {
        // console.log(group)
        dispatch(selectGroup(group));
        dispatch(toggleModalUpdateGroup());
    };
    const handleDelete = (group) => {
        dispatch(selectGroup(group));
        dispatch(toggleModalDeleteGroup());
    };

    useEffect(() => {
        dispatch(fetchGroups(refreshGroup));
    }, [refreshGroup, refreshDepart, dispatch]); // Trigger useEffect on refreshGroup change

    const formatBoolean = (value) => {
        return value ? 'True' : 'False';
    };

    // const formatDate = (dateString) => {
    //     const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    //     return new Date(dateString).toLocaleDateString(undefined, options);
    // };

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
        if (key === "is_supergroup") {
            modifiedKey = "super";
        } else if (key === "groupname") {
            modifiedKey = "name";
        } else if (key.includes("is_")) {
            modifiedKey = key.replace("is_", "");
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
    const filteredData = filterData(groups, searchTerm, excludedFieldsFilter);
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
    const itemsPerPage = 10; // Adjust this value as needed
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
            {statusGroup === 'loading' && <div>Loading...</div>}
            {statusGroup === 'failed' && errorGroupFetchgroup && < div className="text-danger">
                {typeof errorGroupFetchgroup === 'string' ? errorGroupFetchgroup : JSON.stringify(errorGroupFetchgroup)}
            </div>}
            <Row >
                <Col >
                    <Card >
                        <div className="d-flex bd-highlight my-0">
                            <div className="p-0 flex-grow-1 bd-highlight "><span >Admin group </span></div>
                            <div className="p-0 bd-highlight"><ExportExcel sortedData={sortedData} excludedFields={excludedFields} toFriendlyName={toFriendlyName} renderCell={renderCell} formatDate={formatDate} fileName={'Group'} /></div>
                            <div className="p-0 bd-highlight "><Button variant="primary" className='btn-ct' onClick={() => dispatch(toggleModalCreateGroup())}>
                                <i className="feather icon-group-plus auth-icon mx-1" ></i>
                                add group
                            </Button>
                            </div>
                            <div className="p-0  bd-highlight ">
                                <span > <input
                                    type="text"
                                    placeholder="Search..."
                                    value={searchTerm}
                                    onChange={handleSearchChange}
                                    className=" form-control custom-input-height"
                                /></span>
                            </div>
                        </div>
                        <Table className="table-custom1 ">
                            {currentData.length > 0 && Object.keys(currentData[0]).length > 0 && (
                                <>
                                    <thead className="table-primary table-custom1">
                                        <tr>
                                            {Object.keys(currentData[0])
                                                .filter((key) => !excludedFields.includes(key))
                                                .map((key) => (
                                                    <th key={key} onClick={() => requestSort(key)} className={getClassNamesFor(sortConfig, key)}>{toFriendlyName(key)}</th>
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
                        <CreateGroupModal />
                        <DeleteGroupModal />
                        <UpdateGroupModal />

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

export default GroupTable;
