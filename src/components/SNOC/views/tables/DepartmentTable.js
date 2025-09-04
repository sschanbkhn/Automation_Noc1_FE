import { faDeleteLeft, faEdit } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useEffect, useMemo, useState } from "react";
import { Button, Card, Col, Row, Table } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import ExportExcel from "../../components/Export/UserExportExcel";
import CreateDepartmentModal from "../../components/Modal/User/CreateDepartmentModal";
import DeleteDepartmentModal from "../../components/Modal/User/DeleteDepartmentModal";
import UpdateDepartmentModal from "../../components/Modal/User/UpdateDepartmentModal";
import {
  createRequestSortFunction,
  filterData,
  getClassNamesFor,
  sortData,
} from "../../utils/tableUtils";
import {
  fetchDepartments,
  selectDepartment,
  toggleModalCreateDepartment,
  toggleModalDeleteDepartment,
  toggleModalUpdateDepartment,
} from "./../../redux/User/departmentSlice";

const EMPTY_OBJ = Object.freeze({});

function DepartmentTable() {
  const dispatch = useDispatch();

  const deptState = useSelector(function (s) {
    return s.department || s.departments || EMPTY_OBJ;
  });
  const departments = Array.isArray(deptState.departments)
    ? deptState.departments
    : [];
  const statusDepartment = deptState.statusDepartment || "idle";
  const errorDepartment =
    "errorDepartment" in deptState ? deptState.errorDepartment : null;
  const refreshDepart = deptState.refreshDepart || 0;

  const handleUpdate = (department) => {
    dispatch(selectDepartment(department));
    dispatch(toggleModalUpdateDepartment());
  };
  const handleDelete = (department) => {
    dispatch(selectDepartment(department));
    dispatch(toggleModalDeleteDepartment());
  };

  useEffect(() => {
    dispatch(fetchDepartments(refreshDepart));
  }, [refreshDepart, dispatch]);

  const formatBoolean = (value) => (value ? "True" : "False");

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return String(dateString);
    const options = {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    };
    return d.toLocaleString("en-GB", options).replace(",", "");
  };

  const excludedFields = [];
  const toFriendlyName = (key) => {
    var modifiedKey = key;
    if (key === "department") modifiedKey = "depart";
    return modifiedKey.toUpperCase();
  };
  const renderCell = (data) => {
    if (typeof data === "object" && data !== null) {
      return data.name ? data.name : JSON.stringify(data);
    }
    return data;
  };

  const [searchTerm, setSearchTerm] = useState("");
  const handleSearchChange = (e) => setSearchTerm(e.target.value);
  const filteredData = useMemo(
    function () {
      return filterData(departments, searchTerm, ["date"]);
    },
    [departments, searchTerm]
  );

  const [sortConfig, setSortConfig] = useState({
    key: "name",
    direction: "asc",
  });
  const requestSort = createRequestSortFunction(setSortConfig, sortConfig);

  const availableSortKeys = useMemo(
    function () {
      if (!filteredData.length) return [];
      return Object.keys(filteredData[0]).filter(function (k) {
        return excludedFields.indexOf(k) === -1;
      });
    },
    [filteredData]
  );

  const effectiveSortKey = useMemo(
    function () {
      if (availableSortKeys.indexOf(sortConfig.key) !== -1)
        return sortConfig.key;
      if (availableSortKeys.indexOf("name") !== -1) return "name";
      return availableSortKeys[0] || null;
    },
    [availableSortKeys, sortConfig.key]
  );

  const sortedData = useMemo(
    function () {
      if (!effectiveSortKey) return filteredData;
      return sortData(filteredData, effectiveSortKey, sortConfig.direction);
    },
    [filteredData, effectiveSortKey, sortConfig.direction]
  );

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const totalPages = Math.max(1, Math.ceil(sortedData.length / itemsPerPage));
  const currentData = useMemo(
    function () {
      return sortedData.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
      );
    },
    [sortedData, currentPage]
  );
  const handlePageChange = (page) => setCurrentPage(page);

  const currentColumns = useMemo(
    function () {
      if (!currentData.length) return [];
      return Object.keys(currentData[0]).filter(function (k) {
        return excludedFields.indexOf(k) === -1;
      });
    },
    [currentData]
  );

  return (
    <React.Fragment>
      {statusDepartment === "loading" && <div>Loading...</div>}
      {statusDepartment === "failed" && errorDepartment && (
        <div className="text-danger">
          {typeof errorDepartment === "string"
            ? errorDepartment
            : JSON.stringify(errorDepartment)}
        </div>
      )}

      <Row>
        <Col>
          <Card>
            <div className="d-flex bd-highlight my-0">
              <div className="p-0 flex-grow-1 bd-highlight">
                <span>Admin Departments </span>
              </div>

              <div className="p-0 bd-highlight">
                <ExportExcel
                  sortedData={sortedData}
                  excludedFields={excludedFields}
                  toFriendlyName={toFriendlyName}
                  renderCell={renderCell}
                  formatDate={formatDate}
                  fileName={"Department"}
                />
              </div>

              <div className="p-0 bd-highlight ">
                <Button
                  variant="primary"
                  className="btn-ct"
                  onClick={() => dispatch(toggleModalCreateDepartment())}
                >
                  <i className="feather icon-user-plus auth-icon mx-1"></i>
                  add depart
                </Button>
              </div>

              <div className="p-0 bd-highlight ">
                <span>
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className=" form-control  custom-input-height"
                  />
                </span>
              </div>
            </div>

            <Table className="table-custom1">
              {currentData.length > 0 && currentColumns.length > 0 ? (
                <>
                  <thead className="table-primary table-custom1">
                    <tr>
                      {currentColumns.map(function (key) {
                        return (
                          <th
                            key={key}
                            onClick={() => requestSort(key)}
                            className={getClassNamesFor(key)}
                          >
                            {toFriendlyName(key)}
                          </th>
                        );
                      })}
                      <th>Delete</th>
                      <th>Update</th>
                    </tr>
                  </thead>

                  <tbody>
                    {currentData.map(function (value, index) {
                      return (
                        <tr key={index}>
                          {currentColumns.map(function (key) {
                            var v = value[key];
                            return (
                              <td key={key}>
                                {typeof v === "boolean"
                                  ? formatBoolean(v)
                                  : key.toLowerCase().indexOf("date") !== -1 ||
                                    key.toLowerCase().indexOf("time") !== -1
                                  ? formatDate(v)
                                  : renderCell(v, key)}
                              </td>
                            );
                          })}

                          <td>
                            <FontAwesomeIcon
                              icon={faDeleteLeft}
                              className="icon-pointer"
                              onClick={() => handleDelete(value)}
                            />
                          </td>
                          <td>
                            <FontAwesomeIcon
                              icon={faEdit}
                              className="icon-pointer"
                              onClick={() => handleUpdate(value)}
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </>
              ) : (
                <tbody>
                  <tr>
                    <td className="text-center py-3" colSpan={3}>
                      No data
                    </td>
                  </tr>
                </tbody>
              )}
            </Table>

            <CreateDepartmentModal />
            <DeleteDepartmentModal />
            <UpdateDepartmentModal />

            {totalPages > 1 && (
              <div className="pagination">
                {Array.from({ length: totalPages }, function (_, i) {
                  return i + 1;
                }).map(function (page) {
                  return (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={page === currentPage ? "active" : ""}
                    >
                      {page}
                    </button>
                  );
                })}
              </div>
            )}
          </Card>
        </Col>
      </Row>
    </React.Fragment>
  );
}
export default DepartmentTable;
