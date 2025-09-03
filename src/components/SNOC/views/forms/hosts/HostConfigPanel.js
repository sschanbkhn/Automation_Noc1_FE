// import React, { useEffect, useState } from "react";
// import {
//   Button,
//   Card,
//   Col,
//   Form,
//   Modal,
//   Pagination,
//   Row,
//   Spinner,
//   Table,
// } from "react-bootstrap";
// import { Provider, useDispatch, useSelector } from "react-redux";
// import CreatableSelect from "react-select/creatable";
// import Alert from "../../../components/Alert/Alert";
// import WebSocketStatusBanner from "../../../components/WebSocketStatusBanner";
// import { fetchPlatforms } from "../../../redux/Healthcheck/platformDeviceSlice";
// import {
//   addHost,
//   deleteHost,
//   fetchHosts,
//   updateHost,
// } from "../../../redux/Hosts/hostsSlice";
// import snocStore from "../../../store/snocStore";
// import TopNavbarHealth from "../../dashboard/DashOrigin/TopNavbarHealth";

// const HostManagerContent = () => {
//   const dispatch = useDispatch();
//   const { devices = [], loading = false } = useSelector(
//     (state) => state.hosts || {}
//   );
//   const { platforms = [] } = useSelector((state) => state.platformDevice || {});

//   const [search, setSearch] = useState("");
//   const [currentPage, setCurrentPage] = useState(1);
//   const [sortConfig, setSortConfig] = useState({ key: "", direction: "asc" });
//   const [showModal, setShowModal] = useState(false);
//   const [editing, setEditing] = useState(false);
//   const [newHost, setNewHost] = useState({
//     name: "",
//     hostname: "",
//     platform: "", // ID platform nếu chọn từ dropdown
//     platformName: "", // Tên platform nếu tạo mới
//     groups: "",
//     username: "",
//     password: "",
//   });

//   const pageSize = 20;

//   useEffect(() => {
//     dispatch(fetchHosts());
//     dispatch(fetchPlatforms()); // ✅ load list platform cho dropdown
//   }, [dispatch]);

//   const handleSort = (key) => {
//     let direction = "asc";
//     if (sortConfig.key === key && sortConfig.direction === "asc") {
//       direction = "desc";
//     }
//     setSortConfig({ key, direction });
//   };

//   const filteredItems = devices.filter((item) => {
//     const q = search.toLowerCase();
//     return (
//       item.name?.toLowerCase().includes(q) ||
//       item.hostname?.toLowerCase().includes(q) ||
//       item.platform?.toLowerCase().includes(q) ||
//       item.groups?.some((g) => g.toLowerCase().includes(q))
//     );
//   });

//   const sortedItems = [...filteredItems].sort((a, b) => {
//     const valA = a[sortConfig.key];
//     const valB = b[sortConfig.key];
//     if (valA < valB) return sortConfig.direction === "asc" ? -1 : 1;
//     if (valA > valB) return sortConfig.direction === "asc" ? 1 : -1;
//     return 0;
//   });

//   const totalPages = Math.ceil(sortedItems.length / pageSize);
//   const paginatedItems = sortedItems.slice(
//     (currentPage - 1) * pageSize,
//     currentPage * pageSize
//   );

//   const handleSaveHost = () => {
//     const payload = {
//       ...newHost,
//       groups: newHost.groups
//         .split(",")
//         .map((g) => g.trim())
//         .filter((g) => g),
//     };

//     // Chuẩn hóa platform gửi lên
//     if (!payload.platform && payload.platformName) {
//       payload.platform = payload.platformName; // Gửi tên nếu là platform mới
//     }

//     if (editing) {
//       dispatch(updateHost({ name: newHost.name, data: payload }));
//     } else {
//       dispatch(addHost(payload));
//     }
//     setShowModal(false);
//     setEditing(false);
//     resetHostForm();
//   };

//   const handleEdit = (host) => {
//     setEditing(true);
//     // Map platform name → ID cho dropdown
//     const platformObj = platforms.find((p) => p.name === host.platform);
//     const platformId = platformObj ? platformObj.id : "";
//     setNewHost({
//       ...host,
//       platform: platformId,
//       platformName: platformObj ? "" : host.platform,
//       groups: host.groups?.join(", ") || "",
//       username: "",
//       password: "",
//     });
//     setShowModal(true);
//   };

//   const handleAddNew = () => {
//     setEditing(false);
//     resetHostForm();
//     setTimeout(() => setShowModal(true), 0);
//   };

//   const resetHostForm = () => {
//     setNewHost({
//       name: "",
//       hostname: "",
//       platform: "",
//       platformName: "",
//       groups: "",
//       username: "",
//       password: "",
//     });
//   };

//   const getPlatformLabel = (id) => {
//     const p = platforms.find((pl) => pl.id === id);
//     return p ? p.name : "";
//   };

//   return (
//     <>
//       <TopNavbarHealth />
//       <WebSocketStatusBanner />
//       <Alert />

//       <Row>
//         <Col md={12}>
//           <Card>
//             <Card.Header className="d-flex justify-content-between align-items-center">
//               <Card.Title as="h5">Danh sách thiết bị</Card.Title>
//               <div className="d-flex">
//                 <Form
//                   onSubmit={(e) => e.preventDefault()}
//                   className="d-flex me-2"
//                   autoComplete="off"
//                 >
//                   <Form.Control
//                     type="text"
//                     placeholder="Tìm theo tên, IP, platform, group"
//                     value={search}
//                     onChange={(e) => {
//                       setSearch(e.target.value);
//                       setCurrentPage(1);
//                     }}
//                     className="me-2"
//                   />
//                 </Form>
//                 <Button variant="success" onClick={handleAddNew}>
//                   ➕ Thêm thiết bị
//                 </Button>
//               </div>
//             </Card.Header>
//             <Card.Body>
//               {loading ? (
//                 <div className="text-center my-4">
//                   <Spinner animation="border" />
//                 </div>
//               ) : (
//                 <>
//                   <Table striped bordered hover responsive className="table-sm">
//                     <thead className="table-light">
//                       <tr>
//                         <th>STT</th>
//                         <th
//                           onClick={() => handleSort("name")}
//                           style={{ cursor: "pointer" }}
//                         >
//                           Tên
//                         </th>
//                         <th
//                           onClick={() => handleSort("hostname")}
//                           style={{ cursor: "pointer" }}
//                         >
//                           IP
//                         </th>
//                         <th
//                           onClick={() => handleSort("platform")}
//                           style={{ cursor: "pointer" }}
//                         >
//                           Platform
//                         </th>
//                         <th
//                           onClick={() => handleSort("groups")}
//                           style={{ cursor: "pointer" }}
//                         >
//                           Groups
//                         </th>
//                         <th>Hành động</th>
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {paginatedItems.map((d, i) => (
//                         <tr key={d.name}>
//                           <td>{(currentPage - 1) * pageSize + i + 1}</td>
//                           <td>{d.name}</td>
//                           <td>{d.hostname}</td>
//                           <td>{d.platform}</td>
//                           <td>{d.groups?.join(", ")}</td>
//                           <td>
//                             <Button
//                               variant="warning"
//                               size="sm"
//                               className="me-2"
//                               onClick={() => handleEdit(d)}
//                             >
//                               ✏️ Sửa
//                             </Button>
//                             <Button
//                               variant="danger"
//                               size="sm"
//                               onClick={() => {
//                                 if (
//                                   window.confirm(
//                                     `Bạn có chắc muốn xoá thiết bị "${d.name}" không?`
//                                   )
//                                 ) {
//                                   dispatch(deleteHost(d.name));
//                                 }
//                               }}
//                             >
//                               🗑️ Xoá
//                             </Button>
//                           </td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </Table>

//                   {totalPages > 1 && (
//                     <Pagination className="justify-content-center mt-3">
//                       {currentPage > 1 && (
//                         <Pagination.Prev
//                           onClick={() => setCurrentPage(currentPage - 1)}
//                         />
//                       )}
//                       {Array.from({ length: totalPages }, (_, i) => i + 1).map(
//                         (pageNum) => (
//                           <Pagination.Item
//                             key={pageNum}
//                             active={pageNum === currentPage}
//                             onClick={() => setCurrentPage(pageNum)}
//                           >
//                             {pageNum}
//                           </Pagination.Item>
//                         )
//                       )}
//                       {currentPage < totalPages && (
//                         <Pagination.Next
//                           onClick={() => setCurrentPage(currentPage + 1)}
//                         />
//                       )}
//                     </Pagination>
//                   )}
//                 </>
//               )}
//             </Card.Body>
//           </Card>
//         </Col>
//       </Row>

//       <Modal
//         show={showModal}
//         onHide={() => {
//           setShowModal(false);
//           setEditing(false);
//         }}
//       >
//         <Modal.Header closeButton>
//           <Modal.Title>
//             {editing ? "Cập nhật thiết bị" : "Thêm thiết bị mới"}
//           </Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           <Form>
//             <Form.Group className="mb-3">
//               <Form.Label>Tên</Form.Label>
//               <Form.Control
//                 type="text"
//                 value={newHost.name}
//                 onChange={(e) =>
//                   setNewHost({ ...newHost, name: e.target.value })
//                 }
//                 disabled={editing}
//               />
//             </Form.Group>
//             <Form.Group className="mb-3">
//               <Form.Label>IP</Form.Label>
//               <Form.Control
//                 type="text"
//                 value={newHost.hostname}
//                 onChange={(e) =>
//                   setNewHost({ ...newHost, hostname: e.target.value })
//                 }
//               />
//             </Form.Group>
//             <Form.Group className="mb-3">
//               <Form.Label>Platform</Form.Label>
//               <CreatableSelect
//                 isClearable
//                 placeholder="Chọn hoặc nhập platform mới..."
//                 value={
//                   newHost.platform
//                     ? {
//                         value: newHost.platform,
//                         label: getPlatformLabel(newHost.platform),
//                       }
//                     : newHost.platformName
//                     ? {
//                         value: newHost.platformName,
//                         label: newHost.platformName,
//                       }
//                     : null
//                 }
//                 options={platforms.map((p) => ({
//                   value: p.id,
//                   label: p.name,
//                 }))}
//                 onChange={(option) => {
//                   if (!option) {
//                     setNewHost({ ...newHost, platform: "", platformName: "" });
//                   } else if (option.__isNew__) {
//                     setNewHost({
//                       ...newHost,
//                       platform: "",
//                       platformName: option.label,
//                     });
//                   } else {
//                     setNewHost({
//                       ...newHost,
//                       platform: option.value,
//                       platformName: "",
//                     });
//                   }
//                 }}
//               />
//             </Form.Group>
//             <Form.Group className="mb-3">
//               <Form.Label>Groups (phân cách bằng dấu phẩy)</Form.Label>
//               <Form.Control
//                 type="text"
//                 value={newHost.groups}
//                 onChange={(e) =>
//                   setNewHost({ ...newHost, groups: e.target.value })
//                 }
//               />
//             </Form.Group>
//             <Form.Group className="mb-3">
//               <Form.Label>Username</Form.Label>
//               <Form.Control
//                 type="text"
//                 autoComplete="off"
//                 value={newHost.username}
//                 onChange={(e) =>
//                   setNewHost({ ...newHost, username: e.target.value })
//                 }
//               />
//             </Form.Group>
//             <Form.Group className="mb-3">
//               <Form.Label>Password</Form.Label>
//               <Form.Control
//                 type="password"
//                 autoComplete="new-password"
//                 value={newHost.password}
//                 onChange={(e) =>
//                   setNewHost({ ...newHost, password: e.target.value })
//                 }
//               />
//             </Form.Group>
//           </Form>
//         </Modal.Body>
//         <Modal.Footer>
//           <Button
//             variant="secondary"
//             onClick={() => {
//               setShowModal(false);
//               setEditing(false);
//             }}
//           >
//             Huỷ
//           </Button>
//           <Button variant="primary" onClick={handleSaveHost}>
//             Lưu
//           </Button>
//         </Modal.Footer>
//       </Modal>
//     </>
//   );
// };

// const HostManager = () => (
//   <Provider store={snocStore}>
//     <HostManagerContent />
//   </Provider>
// );

// export default HostManager;

import React, { useEffect, useState } from "react";
import {
  Button,
  Card,
  Col,
  Form,
  Modal,
  Pagination,
  Row,
  Spinner,
  Table,
} from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import CreatableSelect from "react-select/creatable";
import Alert from "../../../components/Alert/Alert";
import WebSocketStatusBanner from "../../../components/WebSocketStatusBanner";
import { fetchPlatforms } from "../../../redux/Healthcheck/platformDeviceSlice";
import {
  addHost,
  deleteHost,
  fetchHosts,
  updateHost,
} from "../../../redux/Hosts/hostsSlice";
import TopNavbarHealth from "../../dashboard/DashOrigin/TopNavbarHealth";

const HostManager = () => {
  const dispatch = useDispatch();
  const { devices = [], loading = false } = useSelector(
    (state) => state.hosts || {}
  );
  const { platforms = [] } = useSelector((state) => state.platformDevice || {});

  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: "", direction: "asc" });
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(false);

  // 🔹 Bổ sung các option field vào state form
  const [newHost, setNewHost] = useState({
    name: "",
    hostname: "",
    platform: "", // ID platform nếu chọn từ dropdown
    platformName: "", // Tên platform nếu tạo mới
    groups: "",
    username: "",
    password: "",
    // ---- options mới:
    port: "",
    site_code: "",
    vendor: "",
    license_throughput: "",
  });

  const pageSize = 20;

  useEffect(() => {
    dispatch(fetchHosts());
    dispatch(fetchPlatforms()); // ✅ load list platform cho dropdown
  }, [dispatch]);

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const filteredItems = devices.filter((item) => {
    const q = search.toLowerCase();
    return (
      item.name?.toLowerCase().includes(q) ||
      item.hostname?.toLowerCase().includes(q) ||
      item.platform?.toLowerCase().includes(q) ||
      item.vendor?.toLowerCase().includes(q) || // 🔹 cho phép search theo vendor
      item.site_code?.toLowerCase().includes(q) || // 🔹 cho phép search theo site_code
      item.groups?.some((g) => g.toLowerCase().includes(q))
    );
  });

  const sortedItems = [...filteredItems].sort((a, b) => {
    const { key, direction } = sortConfig;
    if (!key) return 0;

    const getVal = (obj) => {
      let v = obj[key];
      if (Array.isArray(v)) v = v.join(", "); // groups
      if (v === undefined || v === null) v = ""; // tránh undefined
      return v;
    };

    const valA = getVal(a);
    const valB = getVal(b);

    // số: port, license_throughput
    const numericKeys = new Set(["port", "license_throughput"]);
    if (numericKeys.has(key)) {
      const na = Number(valA) || 0;
      const nb = Number(valB) || 0;
      if (na < nb) return direction === "asc" ? -1 : 1;
      if (na > nb) return direction === "asc" ? 1 : -1;
      return 0;
    }

    // string compare
    if (valA < valB) return direction === "asc" ? -1 : 1;
    if (valA > valB) return direction === "asc" ? 1 : -1;
    return 0;
  });

  const totalPages = Math.ceil(sortedItems.length / pageSize);
  const paginatedItems = sortedItems.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleSaveHost = () => {
    const payload = {
      ...newHost,
      groups: newHost.groups
        .split(",")
        .map((g) => g.trim())
        .filter((g) => g),
    };

    // Chuẩn hóa platform gửi lên
    if (!payload.platform && payload.platformName) {
      payload.platform = payload.platformName; // Gửi tên nếu là platform mới
    }

    // Chuẩn hóa kiểu số cho option (UI gửi string)
    if (payload.port !== "") payload.port = Number(payload.port);
    if (payload.license_throughput !== "")
      payload.license_throughput = Number(payload.license_throughput);

    if (editing) {
      dispatch(updateHost({ name: newHost.name, data: payload }));
    } else {
      dispatch(addHost(payload));
    }
    setShowModal(false);
    setEditing(false);
    resetHostForm();
  };

  const handleEdit = (host) => {
    setEditing(true);
    // Map platform name → ID cho dropdown
    const platformObj = platforms.find((p) => p.name === host.platform);
    const platformId = platformObj ? platformObj.id : "";
    setNewHost({
      ...host,
      platform: platformId,
      platformName: platformObj ? "" : host.platform,
      groups: host.groups?.join(", ") || "",
      username: "",
      password: "",
      // 🔹 map các option vào form (nếu null thì để rỗng string cho dễ nhập)
      port: host.port ?? "",
      site_code: host.site_code ?? "",
      vendor: host.vendor ?? "",
      license_throughput: host.license_throughput ?? "",
    });
    setShowModal(true);
  };

  const handleAddNew = () => {
    setEditing(false);
    resetHostForm();
    setTimeout(() => setShowModal(true), 0);
  };

  const resetHostForm = () => {
    setNewHost({
      name: "",
      hostname: "",
      platform: "",
      platformName: "",
      groups: "",
      username: "",
      password: "",
      port: "",
      site_code: "",
      vendor: "",
      license_throughput: "",
    });
  };

  const getPlatformLabel = (id) => {
    const p = platforms.find((pl) => pl.id === id);
    return p ? p.name : "";
  };

  return (
    <>
      <TopNavbarHealth />
      <WebSocketStatusBanner />
      <Alert />

      <Row>
        <Col md={12}>
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <Card.Title as="h5">Danh sách thiết bị</Card.Title>
              <div className="d-flex">
                <Form
                  onSubmit={(e) => e.preventDefault()}
                  className="d-flex me-2"
                  autoComplete="off"
                >
                  <Form.Control
                    type="text"
                    placeholder="Tìm theo tên, IP, platform, group, vendor, site"
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="me-2"
                  />
                </Form>
                <Button variant="success" onClick={handleAddNew}>
                  ➕ Thêm thiết bị
                </Button>
              </div>
            </Card.Header>
            <Card.Body>
              {loading ? (
                <div className="text-center my-4">
                  <Spinner animation="border" />
                </div>
              ) : (
                <>
                  <Table striped bordered hover responsive className="table-sm">
                    <thead className="table-light">
                      <tr>
                        <th>STT</th>
                        <th
                          onClick={() => handleSort("name")}
                          style={{ cursor: "pointer" }}
                        >
                          Tên
                        </th>
                        <th
                          onClick={() => handleSort("hostname")}
                          style={{ cursor: "pointer" }}
                        >
                          IP
                        </th>
                        <th
                          onClick={() => handleSort("platform")}
                          style={{ cursor: "pointer" }}
                        >
                          Platform
                        </th>
                        <th
                          onClick={() => handleSort("groups")}
                          style={{ cursor: "pointer" }}
                        >
                          Groups
                        </th>
                        {/* 🔹 cột mới */}
                        <th
                          onClick={() => handleSort("port")}
                          style={{ cursor: "pointer" }}
                          title="SSH Port"
                        >
                          Port
                        </th>
                        <th
                          onClick={() => handleSort("vendor")}
                          style={{ cursor: "pointer" }}
                        >
                          Vendor
                        </th>
                        <th
                          onClick={() => handleSort("site_code")}
                          style={{ cursor: "pointer" }}
                        >
                          Site
                        </th>
                        <th
                          onClick={() => handleSort("license_throughput")}
                          style={{ cursor: "pointer" }}
                          title="Throughput license"
                        >
                          License
                        </th>
                        <th>Hành động</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedItems.map((d, i) => (
                        <tr key={d.name}>
                          <td>{(currentPage - 1) * pageSize + i + 1}</td>
                          <td>{d.name}</td>
                          <td>{d.hostname}</td>
                          <td>{d.platform}</td>
                          <td>{d.groups?.join(", ")}</td>
                          <td>{d.port ?? ""}</td>
                          <td>{d.vendor ?? ""}</td>
                          <td>{d.site_code ?? ""}</td>
                          <td>{d.license_throughput ?? ""}</td>
                          <td>
                            <Button
                              variant="warning"
                              size="sm"
                              className="me-2"
                              onClick={() => handleEdit(d)}
                            >
                              ✏️ Sửa
                            </Button>
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => {
                                if (
                                  window.confirm(
                                    `Bạn có chắc muốn xoá thiết bị "${d.name}" không?`
                                  )
                                ) {
                                  dispatch(deleteHost(d.name));
                                }
                              }}
                            >
                              🗑️ Xoá
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>

                  {totalPages > 1 && (
                    <Pagination className="justify-content-center mt-3">
                      {currentPage > 1 && (
                        <Pagination.Prev
                          onClick={() => setCurrentPage(currentPage - 1)}
                        />
                      )}
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                        (pageNum) => (
                          <Pagination.Item
                            key={pageNum}
                            active={pageNum === currentPage}
                            onClick={() => setCurrentPage(pageNum)}
                          >
                            {pageNum}
                          </Pagination.Item>
                        )
                      )}
                      {currentPage < totalPages && (
                        <Pagination.Next
                          onClick={() => setCurrentPage(currentPage + 1)}
                        />
                      )}
                    </Pagination>
                  )}
                </>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Modal
        show={showModal}
        onHide={() => {
          setShowModal(false);
          setEditing(false);
        }}
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {editing ? "Cập nhật thiết bị" : "Thêm thiết bị mới"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Tên</Form.Label>
              <Form.Control
                type="text"
                value={newHost.name}
                onChange={(e) =>
                  setNewHost({ ...newHost, name: e.target.value })
                }
                disabled={editing}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>IP</Form.Label>
              <Form.Control
                type="text"
                value={newHost.hostname}
                onChange={(e) =>
                  setNewHost({ ...newHost, hostname: e.target.value })
                }
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Platform</Form.Label>
              <CreatableSelect
                isClearable
                placeholder="Chọn hoặc nhập platform mới..."
                value={
                  newHost.platform
                    ? {
                        value: newHost.platform,
                        label: getPlatformLabel(newHost.platform),
                      }
                    : newHost.platformName
                    ? {
                        value: newHost.platformName,
                        label: newHost.platformName,
                      }
                    : null
                }
                options={platforms.map((p) => ({
                  value: p.id,
                  label: p.name,
                }))}
                onChange={(option) => {
                  if (!option) {
                    setNewHost({ ...newHost, platform: "", platformName: "" });
                  } else if (option.__isNew__) {
                    setNewHost({
                      ...newHost,
                      platform: "",
                      platformName: option.label,
                    });
                  } else {
                    setNewHost({
                      ...newHost,
                      platform: option.value,
                      platformName: "",
                    });
                  }
                }}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Groups (phân cách bằng dấu phẩy)</Form.Label>
              <Form.Control
                type="text"
                value={newHost.groups}
                onChange={(e) =>
                  setNewHost({ ...newHost, groups: e.target.value })
                }
              />
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Username</Form.Label>
                  <Form.Control
                    type="text"
                    autoComplete="off"
                    value={newHost.username}
                    onChange={(e) =>
                      setNewHost({ ...newHost, username: e.target.value })
                    }
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    autoComplete="new-password"
                    value={newHost.password}
                    onChange={(e) =>
                      setNewHost({ ...newHost, password: e.target.value })
                    }
                  />
                </Form.Group>
              </Col>
            </Row>

            {/* 🔹 Option fields mới */}
            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Port</Form.Label>
                  <Form.Control
                    type="number"
                    min={1}
                    placeholder="22"
                    value={newHost.port}
                    onChange={(e) =>
                      setNewHost({ ...newHost, port: e.target.value })
                    }
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Vendor</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Ericsson/Huawei/Nokia…"
                    value={newHost.vendor}
                    onChange={(e) =>
                      setNewHost({ ...newHost, vendor: e.target.value })
                    }
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Site code</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="VD: HNI-01"
                    value={newHost.site_code}
                    onChange={(e) =>
                      setNewHost({ ...newHost, site_code: e.target.value })
                    }
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-2">
              <Form.Label>License throughput (Mbps/Gbps)</Form.Label>
              <Form.Control
                type="number"
                step="any"
                placeholder="VD: 1000 (Mbps) hoặc 1 (Gbps tuỳ convention)"
                value={newHost.license_throughput}
                onChange={(e) =>
                  setNewHost({
                    ...newHost,
                    license_throughput: e.target.value,
                  })
                }
              />
              <Form.Text className="text-muted">
                Tuỳ convention hiển thị trong hệ thống của bạn (Mbps hay Gbps).
              </Form.Text>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => {
              setShowModal(false);
              setEditing(false);
            }}
          >
            Huỷ
          </Button>
          <Button variant="primary" onClick={handleSaveHost}>
            Lưu
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default HostManager;
