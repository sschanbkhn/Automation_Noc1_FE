import { faDeleteLeft, faEdit } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useEffect, useMemo, useState } from "react";
import { Button, Card, Col, Row, Table } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import ExportExcel from "../../components/Export/UserExportExcel";
import CreateGroupModal from "../../components/Modal/User/CreateGroupModal";
import DeleteGroupModal from "../../components/Modal/User/DeleteGroupModal";
import UpdateGroupModal from "../../components/Modal/User/UpdateGroupModal";
import {
  createRequestSortFunction,
  filterData,
  getClassNamesFor,
  sortData,
} from "../../utils/tableUtils";
import {
  fetchGroups,
  selectGroup,
  toggleModalCreateGroup,
  toggleModalDeleteGroup,
  toggleModalUpdateGroup,
} from "./../../redux/User/groupSlice";

const EMPTY_OBJ = Object.freeze({});

function GroupTable() {
  const dispatch = useDispatch();

  const groupState = useSelector(function (s) {
    return s.group || s.groups || EMPTY_OBJ;
  });
  const deptState = useSelector(function (s) {
    return s.department || s.departments || EMPTY_OBJ;
  });
  const groups = Array.isArray(groupState.groups) ? groupState.groups : [];
  const statusGroup = groupState.statusGroup || "idle";
  const errorGroupFetchgroup = groupState.errorGroupFetchgroup || null;
  const refreshGroup = groupState.refreshGroup || 0;
  const refreshDepart = deptState.refreshDepart || 0;

  const handleUpdate = (group) => {
    dispatch(selectGroup(group));
    dispatch(toggleModalUpdateGroup());
  };
  const handleDelete = (group) => {
    dispatch(selectGroup(group));
    dispatch(toggleModalDeleteGroup());
  };

  useEffect(() => {
    dispatch(fetchGroups(refreshGroup));
  }, [refreshGroup, refreshDepart, dispatch]);

  const formatBoolean = (value) => (value ? "True" : "False");

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return String(dateString);
    const opt = {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    };
    return d.toLocaleString("en-GB", opt).replace(",", "");
  };

  const excludedFields = [];
  const toFriendlyName = (key) => {
    var modifiedKey = key;
    if (key === "is_supergroup") modifiedKey = "super";
    else if (key === "groupname") modifiedKey = "name";
    else if (key.indexOf("is_") === 0) modifiedKey = key.replace("is_", "");
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
      return filterData(groups, searchTerm, ["date"]);
    },
    [groups, searchTerm]
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
      if (availableSortKeys.indexOf("groupname") !== -1) return "groupname";
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
  const itemsPerPage = 10;
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
      {statusGroup === "loading" && <div>Loading...</div>}
      {statusGroup === "failed" && errorGroupFetchgroup && (
        <div className="text-danger">
          {typeof errorGroupFetchgroup === "string"
            ? errorGroupFetchgroup
            : JSON.stringify(errorGroupFetchgroup)}
        </div>
      )}

      <Row>
        <Col>
          <Card>
            <div className="d-flex bd-highlight my-0">
              <div className="p-0 flex-grow-1 bd-highlight">
                <span>Admin group </span>
              </div>

              <div className="p-0 bd-highlight">
                <ExportExcel
                  sortedData={sortedData}
                  excludedFields={excludedFields}
                  toFriendlyName={toFriendlyName}
                  renderCell={renderCell}
                  formatDate={formatDate}
                  fileName={"Group"}
                />
              </div>

              <div className="p-0 bd-highlight ">
                <Button
                  variant="primary"
                  className="btn-ct"
                  onClick={() => dispatch(toggleModalCreateGroup())}
                >
                  <i className="feather icon-group-plus auth-icon mx-1"></i>
                  add group
                </Button>
              </div>

              <div className="p-0  bd-highlight ">
                <span>
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className=" form-control custom-input-height"
                  />
                </span>
              </div>
            </div>

            <Table className="table-custom1 ">
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

            <CreateGroupModal />
            <DeleteGroupModal />
            <UpdateGroupModal />

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

export default GroupTable;
