// UpdateUserModal.js
import { ErrorMessage, Field, Formik, Form as FormikForm } from "formik";
import React, { useEffect, useMemo, useState } from "react";
import { Button, Form, Modal } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import * as Yup from "yup";
import { toggleModalUpdate, updateUser } from "./../../../redux/User/userSlice";

const EMPTY_OBJ = Object.freeze({});
const EMPTY_ARR = Object.freeze([]);

const selectUserState = (s) => s.userState || s.user || s.users || EMPTY_OBJ;
const selectDeptState = (s) => s.department || EMPTY_OBJ;
const selectGroupState = (s) => s.group || EMPTY_OBJ;

function getId(maybeObj) {
  return typeof maybeObj === "object" && maybeObj !== null
    ? maybeObj.id
    : maybeObj;
}

const UpdateUserModal = () => {
  const dispatch = useDispatch();

  const userState = useSelector(selectUserState);
  const showModalUpdate = !!userState.showModalUpdate;
  const selectedUser = userState.selectedUser || null;
  const status = userState.status || "idle";
  const error = "error" in userState ? userState.error : null;

  const roles =
    Array.isArray(userState.roles) && userState.roles.length
      ? userState.roles
      : [
          { key: "user", value: "User" },
          { key: "admin", value: "Admin" },
        ];

  const departments = useSelector(
    (s) => selectDeptState(s).departments || EMPTY_ARR
  );
  const groups = useSelector((s) => selectGroupState(s).groups || EMPTY_ARR);

  const initialValues = {
    username:
      selectedUser && selectedUser.username ? selectedUser.username : "",
    email: selectedUser && selectedUser.email ? selectedUser.email : "",
    role:
      selectedUser && selectedUser.role
        ? selectedUser.role
        : roles.length
        ? roles[0].key
        : "user",
    group_id: String(getId(selectedUser && selectedUser.group) || ""),
    department_id: String(getId(selectedUser && selectedUser.department) || ""),
  };

  const validationSchema = Yup.object({
    username: Yup.string().required("Username is required"),
    email: Yup.string()
      .email("Invalid email format")
      .required("Email is required"),
    role: Yup.string().required("Role is required"),
    group_id: Yup.string().required("Group is required"),
    department_id: Yup.string().required("Department is required"),
  });

  const handleSubmit = (values, { setSubmitting, resetForm }) => {
    if (!(selectedUser && selectedUser.id)) {
      setSubmitting(false);
      return;
    }
    const p = dispatch(
      updateUser({ userId: selectedUser.id, userData: values })
    );
    if (p && typeof p.unwrap === "function") {
      p.unwrap()
        .then(function () {
          setSubmitting(false);
          resetForm();
          dispatch(toggleModalUpdate());
        })
        .catch(function () {
          setSubmitting(false);
        });
    } else {
      p.finally(function () {
        setSubmitting(false);
        dispatch(toggleModalUpdate());
      });
    }
  };

  // ===== Select dependency =====
  const [selectedDepartment, setSelectedDepartment] = useState(
    String(getId(selectedUser && selectedUser.department) || "")
  );

  useEffect(() => {
    setSelectedDepartment(
      String(getId(selectedUser && selectedUser.department) || "")
    );
  }, [selectedUser]);

  const handleDepartmentChange = (e, setFieldValue) => {
    const departmentId = e.target.value;
    setSelectedDepartment(departmentId);
    setFieldValue("department_id", departmentId);
    setFieldValue("group_id", "");
  };

  const filteredGroups = useMemo(
    function () {
      const list = Array.isArray(groups) ? groups : [];
      if (!selectedDepartment) return list;
      var depId = Number(selectedDepartment);
      return list.filter(function (g) {
        var d = g && g.department;
        var gDepId = Number(getId(d));
        return gDepId === depId;
      });
    },
    [groups, selectedDepartment]
  );

  const handleGroupChange = (e, setFieldValue) => {
    var groupId = e.target.value;
    var selectedGroup = (groups || []).find(function (g) {
      return Number(g && g.id) === Number(groupId);
    });
    if (selectedGroup) {
      var departmentId = getId(selectedGroup.department);
      setSelectedDepartment(String(departmentId || ""));
      setFieldValue("department_id", String(departmentId || ""));
    }
    setFieldValue("group_id", groupId);
  };

  const updating = status === "loading";
  const disableSubmit = updating || !(selectedUser && selectedUser.id);

  return (
    <Modal
      show={showModalUpdate}
      onHide={() => dispatch(toggleModalUpdate())}
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title>
          Edit User{" "}
          <span style={{ color: "red" }}>
            {selectedUser && selectedUser.username ? selectedUser.username : ""}
          </span>
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({ isSubmitting, values, setFieldValue }) => (
            <FormikForm>
              <Form.Group controlId="formName" className="mb-3">
                <Form.Label>UserName</Form.Label>
                <Field type="text" name="username" className="form-control" />
                <ErrorMessage
                  name="username"
                  component="div"
                  className="text-danger"
                />
              </Form.Group>

              <Form.Group controlId="formEmail" className="mb-3">
                <Form.Label>Email address</Form.Label>
                <Field type="email" name="email" className="form-control" />
                <ErrorMessage
                  name="email"
                  component="div"
                  className="text-danger"
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Role</Form.Label>
                <Field
                  as="select"
                  name="role"
                  className="form-control"
                  value={values.role}
                >
                  {(roles || []).map(function (role) {
                    return (
                      <option
                        key={String(role && role.key)}
                        value={String(role && role.key)}
                      >
                        {role && role.value ? role.value : role && role.key}
                      </option>
                    );
                  })}
                </Field>
                <ErrorMessage
                  name="role"
                  component="div"
                  className="text-danger"
                />
              </Form.Group>

              <Form.Group controlId="formDepartment" className="mb-3">
                <Form.Label>Department</Form.Label>
                <Field
                  as="select"
                  name="department_id"
                  onChange={function (e) {
                    handleDepartmentChange(e, setFieldValue);
                  }}
                  className="form-control"
                  value={values.department_id}
                >
                  <option value="">Select Department</option>
                  {(departments || []).map(function (d) {
                    return (
                      <option key={d && d.id} value={String(d && d.id)}>
                        {(d && d.name) || ""}
                      </option>
                    );
                  })}
                </Field>
                <ErrorMessage
                  name="department_id"
                  component="div"
                  className="text-danger"
                />
              </Form.Group>

              <Form.Group controlId="formGroup" className="mb-3">
                <Form.Label>Group</Form.Label>
                <Field
                  as="select"
                  name="group_id"
                  onChange={function (e) {
                    handleGroupChange(e, setFieldValue);
                  }}
                  className="form-control"
                  value={values.group_id}
                >
                  <option value="">Select Group</option>
                  {(filteredGroups || []).map(function (g) {
                    return (
                      <option key={g && g.id} value={String(g && g.id)}>
                        {(g && g.name) || ""}
                      </option>
                    );
                  })}
                </Field>
                <ErrorMessage
                  name="group_id"
                  component="div"
                  className="text-danger"
                />
              </Form.Group>

              {status === "failed" && error && (
                <div className="text-danger mb-3">
                  {typeof error === "string" ? error : JSON.stringify(error)}
                </div>
              )}

              <Button
                variant="primary"
                type="submit"
                disabled={isSubmitting || disableSubmit}
              >
                {isSubmitting || updating ? "Updating…" : "Update User"}
              </Button>
            </FormikForm>
          )}
        </Formik>
      </Modal.Body>
    </Modal>
  );
};

export default UpdateUserModal;
