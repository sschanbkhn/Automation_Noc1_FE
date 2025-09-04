import { faDeleteLeft, faEdit, faKey } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useEffect, useMemo, useState } from "react";
import { Button, Card, Col, Row, Table } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import ExportExcel from "../../components/Export/UserExportExcel";
import {
  createRequestSortFunction,
  filterData,
  getClassNamesFor,
  sortData,
} from "../../utils/tableUtils";
import {
  fetchUsers,
  selectUser,
  toggleChangePasswordModal,
  toggleModalCreate,
  toggleModalDelete,
  toggleModalUpdate,
} from "./../../redux/User/userSlice";

// ===== Hằng số bất biến để selector không trả về {} / [] mới mỗi lần
const EMPTY_OBJ = Object.freeze({});
const EMPTY_ARR = Object.freeze([]);

const selectUserState = function (s) {
  return s.userState || s.user || s.users || EMPTY_OBJ;
};
const selectGroupState = function (s) {
  return s.group || EMPTY_OBJ;
};
const selectDeptState = function (s) {
  return s.department || EMPTY_OBJ;
};

function UserTable() {
  const dispatch = useDispatch();

  // ===== State từ Redux (an toàn, tránh new ref mỗi lần)
  const userState = useSelector(selectUserState);
  const users = Array.isArray(userState.users) ? userState.users : EMPTY_ARR;
  console.log("users", users);
  const status = userState.status || "idle";
  const error = "error" in userState ? userState.error : null;
  const errorFetchUser =
    "errorFetchUser" in userState ? userState.errorFetchUser : null;
  const refresh = userState.refresh || 0;

  const refreshGroup = useSelector(function (s) {
    var g = selectGroupState(s);
    return g && typeof g.refreshGroup !== "undefined" ? g.refreshGroup : 0;
  });
  const refreshDepart = useSelector(function (s) {
    var d = selectDeptState(s);
    return d && typeof d.refreshDepart !== "undefined" ? d.refreshDepart : 0;
  });

  // ===== Handlers
  const handleUpdate = function (user) {
    dispatch(selectUser(user));
    dispatch(toggleModalUpdate());
  };
  const handleDelete = function (user) {
    dispatch(selectUser(user));
    dispatch(toggleModalDelete());
  };
  const handleChangePassword = function (user) {
    dispatch(selectUser(user));
    dispatch(toggleChangePasswordModal());
  };

  // ===== Load users khi refresh/dep/group thay đổi
  useEffect(
    function () {
      dispatch(fetchUsers(refreshGroup));
    },
    [refresh, refreshDepart, refreshGroup, dispatch]
  );

  // ===== Format helpers
  const formatBoolean = function (value) {
    return value ? "True" : "False";
  };

  const formatDate = function (dateString) {
    if (!dateString) return "";
    var d = new Date(dateString);
    if (isNaN(d.getTime())) return String(dateString);
    var options = {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    };
    return d.toLocaleString("en-GB", options).replace(",", "");
  };

  // ===== Cột loại trừ / hiển thị
  const excludedFields = ["id", "noc", "depart"];

  const toFriendlyName = function (key) {
    var modifiedKey = key;
    if (key === "is_superuser") {
      modifiedKey = "super";
    } else if (key === "username") {
      modifiedKey = "name";
    } else if (key.indexOf("is_") === 0) {
      modifiedKey = key.replace("is_", "");
    }
    return modifiedKey.toUpperCase();
  };

  const renderCell = function (data /* , key */) {
    if (typeof data === "object" && data !== null) {
      return data.name ? data.name : JSON.stringify(data);
    }
    return data;
  };

  // ===== Search
  const [searchTerm, setSearchTerm] = useState("");
  const handleSearchChange = function (e) {
    setSearchTerm(e.target.value);
  };
  const filteredData = useMemo(
    function () {
      return filterData(users, searchTerm, ["date"]); // loại trừ field có 'date' khỏi search nếu util của bạn hỗ trợ
    },
    [users, searchTerm]
  );

  // ===== Sort (an toàn với key thiếu)
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
      if (availableSortKeys.indexOf("username") !== -1) return "username";
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

  // ===== Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const totalPages = Math.max(1, Math.ceil(sortedData.length / itemsPerPage));
  const currentData = useMemo(
    function () {
      var start = (currentPage - 1) * itemsPerPage;
      var end = currentPage * itemsPerPage;
      return sortedData.slice(start, end);
    },
    [sortedData, currentPage]
  );
  const handlePageChange = function (page) {
    setCurrentPage(page);
  };

  // ===== Columns của trang hiện tại (header/body nhất quán)
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
      {status === "loading" && <div>Loading...</div>}
      {status === "failed" && errorFetchUser && (
        <div className="text-danger">
          {typeof errorFetchUser === "string"
            ? errorFetchUser
            : JSON.stringify(error)}
        </div>
      )}

      <Row>
        <Col>
          <Card>
            <div className="d-flex bd-highlight ">
              <div className="p-0 flex-grow-1 bd-highlight ">
                <span>Admin User </span>
              </div>

              <div className="p-0 bd-highlight">
                <ExportExcel
                  sortedData={sortedData}
                  excludedFields={excludedFields}
                  toFriendlyName={toFriendlyName}
                  renderCell={renderCell}
                  formatDate={formatDate}
                  fileName={"User"}
                />
              </div>

              <div className="p-0 bd-highlight">
                <Button
                  variant="primary"
                  className="btn-ct"
                  onClick={function () {
                    dispatch(toggleModalCreate());
                  }}
                >
                  <i className="feather icon-user-plus auth-icon mx-1"></i>
                  add user
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

            <Table className="table-custom1 ">
              {currentData.length > 0 && currentColumns.length > 0 ? (
                <>
                  <thead className="table-primary table-custom1">
                    <tr>
                      {currentColumns.map(function (key) {
                        return (
                          <th
                            key={key}
                            onClick={function () {
                              requestSort(key);
                            }}
                            className={getClassNamesFor(key)}
                          >
                            {toFriendlyName(key)}
                          </th>
                        );
                      })}
                      <th>Delete</th>
                      <th>Update</th>
                      <th>Change password</th>
                    </tr>
                  </thead>

                  <tbody>
                    {currentData.map(function (value, index) {
                      return (
                        <tr key={index}>
                          {currentColumns.map(function (key) {
                            var cellValue = value[key];
                            var lower = key.toLowerCase();
                            return (
                              <td key={key}>
                                {typeof cellValue === "boolean"
                                  ? formatBoolean(cellValue)
                                  : lower.indexOf("date") !== -1 ||
                                    lower.indexOf("time") !== -1
                                  ? formatDate(cellValue)
                                  : renderCell(cellValue, key)}
                              </td>
                            );
                          })}
                          <td>
                            <FontAwesomeIcon
                              icon={faDeleteLeft}
                              className="icon-pointer"
                              onClick={function () {
                                handleDelete(value);
                              }}
                            />
                          </td>
                          <td>
                            <FontAwesomeIcon
                              icon={faEdit}
                              className="icon-pointer"
                              onClick={function () {
                                handleUpdate(value);
                              }}
                            />
                          </td>
                          <td>
                            <FontAwesomeIcon
                              icon={faKey}
                              className="icon-pointer"
                              onClick={function () {
                                handleChangePassword(value);
                              }}
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

            {/* Modals */}
            {/* <CreateUserModal />
            <DeleteUserModal />
            <UpdateUserModal />
            <ChangePasswordModal /> */}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination">
                {Array.from({ length: totalPages }, function (_, i) {
                  return i + 1;
                }).map(function (page) {
                  return (
                    <button
                      key={page}
                      onClick={function () {
                        handlePageChange(page);
                      }}
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

export default UserTable;
