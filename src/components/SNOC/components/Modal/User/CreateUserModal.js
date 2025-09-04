// src/components/UserModal.js
import { ErrorMessage, Field, Formik, Form as FormikForm } from "formik";
import React, { useEffect, useMemo, useState } from "react";
import { Button, Form, Modal } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import * as Yup from "yup";
import { fetchDepartments } from "../../../redux/User/departmentSlice";
import { fetchGroups } from "../../../redux/User/groupSlice";
import { createUser, toggleModalCreate } from "../../../redux/User/userSlice";

// Hằng số bất biến để tránh selector trả về {} / [] mới mỗi lần
const EMPTY_OBJ = Object.freeze({});
const EMPTY_ARR = Object.freeze([]);

const selectUserState = (s) => s.userState || s.user || s.users || EMPTY_OBJ;
const selectDeptState = (s) => s.department || EMPTY_OBJ;
const selectGroupState = (s) => s.group || EMPTY_OBJ;

const CreateUserModal = () => {
  const dispatch = useDispatch();

  const userState = useSelector(selectUserState);
  const showModalCreate = !!userState.showModalCreate;
  const status = userState.status || "idle";
  const errorCreateUser =
    "errorCreateUser" in userState ? userState.errorCreateUser : null;

  const departments = useSelector(
    (s) => selectDeptState(s).departments || EMPTY_ARR
  );
  const groups = useSelector((s) => selectGroupState(s).groups || EMPTY_ARR);

  useEffect(() => {
    dispatch(fetchDepartments());
    dispatch(fetchGroups());
  }, [dispatch]);

  const initialValues = {
    username: "",
    email: "",
    password: "",
    group_id: "",
    department_id: "",
  };

  const validationSchema = Yup.object({
    username: Yup.string().required("Name is required"),
    email: Yup.string()
      .email("Invalid email address")
      .required("Email is required"),
    password: Yup.string().required("Password is required"),
    group_id: Yup.string().required("Group is required"),
    department_id: Yup.string().required("Department is required"),
  });

  const handleSubmit = (values, { setSubmitting, resetForm }) => {
    const p = dispatch(createUser(values));
    if (p && typeof p.unwrap === "function") {
      p.unwrap()
        .then(function () {
          setSubmitting(false);
          resetForm();
          dispatch(toggleModalCreate());
        })
        .catch(function () {
          setSubmitting(false);
        });
    } else {
      p.finally(function () {
        setSubmitting(false);
        dispatch(toggleModalCreate());
      });
    }
  };

  // ===== Select dependency =====
  const [selectedDepartment, setSelectedDepartment] = useState("");

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
      var depId = parseInt(String(selectedDepartment), 10);
      return list.filter(function (g) {
        var d = g && g.department;
        var gDepId = typeof d === "object" && d !== null ? d.id : d;
        return Number(gDepId) === depId;
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
      var d = selectedGroup.department;
      var departmentId = typeof d === "object" && d !== null ? d.id : d;
      setSelectedDepartment(String(departmentId || ""));
      setFieldValue("department_id", String(departmentId || ""));
    }
    setFieldValue("group_id", groupId);
  };

  const handleClose = () => dispatch(toggleModalCreate());

  return (
    <Modal show={showModalCreate} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Create User</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting, setFieldValue }) => (
            <FormikForm>
              <Form.Group controlId="formName">
                <Form.Label>UserName</Form.Label>
                <Field type="text" name="username" className="form-control" />
                <ErrorMessage
                  name="username"
                  component="div"
                  className="text-danger"
                />
              </Form.Group>

              <Form.Group controlId="formEmail">
                <Form.Label>Email address</Form.Label>
                <Field type="email" name="email" className="form-control" />
                <ErrorMessage
                  name="email"
                  component="div"
                  className="text-danger"
                />
              </Form.Group>

              <Form.Group controlId="formPassword">
                <Form.Label>Password</Form.Label>
                <Field
                  type="password"
                  name="password"
                  className="form-control"
                />
                <ErrorMessage
                  name="password"
                  component="div"
                  className="text-danger"
                />
              </Form.Group>

              <Form.Group controlId="formDepartment">
                <Form.Label>Department</Form.Label>
                <Field
                  as="select"
                  name="department_id"
                  onChange={function (e) {
                    handleDepartmentChange(e, setFieldValue);
                  }}
                  className="form-control"
                >
                  <option key="dep_null" value="">
                    Select Department
                  </option>
                  {(departments || []).map(function (value) {
                    return (
                      <option key={value && value.id} value={value && value.id}>
                        {(value && value.name) || ""}
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

              <Form.Group controlId="formGroup">
                <Form.Label>Group</Form.Label>
                <Field
                  as="select"
                  name="group_id"
                  onChange={function (e) {
                    handleGroupChange(e, setFieldValue);
                  }}
                  className="form-control"
                >
                  <option key="grp_null" value="">
                    Select Group
                  </option>
                  {(filteredGroups || []).map(function (value) {
                    return (
                      <option key={value && value.id} value={value && value.id}>
                        {(value && value.name) || ""}
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

              {status === "failed" && errorCreateUser && (
                <div className="text-danger">
                  {typeof errorCreateUser === "string"
                    ? errorCreateUser
                    : JSON.stringify(errorCreateUser)}
                </div>
              )}

              <Button
                variant="primary"
                type="submit"
                disabled={isSubmitting || status === "loading"}
              >
                {isSubmitting || status === "loading"
                  ? "Creating..."
                  : "Create User"}
              </Button>
            </FormikForm>
          )}
        </Formik>
      </Modal.Body>
    </Modal>
  );
};

export default CreateUserModal;
