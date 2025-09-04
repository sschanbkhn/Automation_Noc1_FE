import { ErrorMessage, Field, Formik, Form as FormikForm } from "formik";
import React, { useEffect } from "react";
import { Button, Form, Modal } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import * as Yup from "yup";
import { fetchDepartments } from "../../../redux/User/departmentSlice";
import {
  createGroup,
  toggleModalCreateGroup,
} from "../../../redux/User/groupSlice";

const EMPTY_OBJ = Object.freeze({});
const EMPTY_ARR = Object.freeze([]);
const selectGroupState = (s) => s.group || s.groups || EMPTY_OBJ;
const selectDeptState = (s) => s.department || s.departments || EMPTY_OBJ;

const CreateGroupModal = () => {
  const dispatch = useDispatch();

  const groupState = useSelector(selectGroupState);
  const showModalCreateGroup = !!groupState.showModalCreateGroup;
  const creating = !!groupState.creating;

  const departments = useSelector(
    (s) => selectDeptState(s).departments || EMPTY_ARR
  );

  useEffect(() => {
    dispatch(fetchDepartments());
  }, [dispatch]);

  const initialValues = { name: "", department_id: "" };

  const validationSchema = Yup.object().shape({
    name: Yup.string().required("Group name is required"),
    department_id: Yup.string().required("Department is required"),
  });

  const handleSubmit = (values, { setSubmitting, resetForm }) => {
    const p = dispatch(createGroup(values));
    if (p && typeof p.unwrap === "function") {
      p.unwrap()
        .then(function () {
          setSubmitting(false);
          resetForm();
          dispatch(toggleModalCreateGroup());
        })
        .catch(function () {
          setSubmitting(false);
        });
    } else {
      p.finally(function () {
        setSubmitting(false);
        dispatch(toggleModalCreateGroup());
      });
    }
  };

  const handleClose = () => dispatch(toggleModalCreateGroup());

  return (
    <Modal show={showModalCreateGroup} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Create Group</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting }) => (
            <FormikForm>
              <Form.Group controlId="formGroupName">
                <Form.Label>Group Name</Form.Label>
                <Field type="text" name="name" className="form-control" />
                <ErrorMessage
                  name="name"
                  component="div"
                  className="text-danger"
                />
              </Form.Group>

              <Form.Group controlId="formDepartment">
                <Form.Label>Department</Form.Label>
                <Field
                  as="select"
                  name="department_id"
                  className="form-control"
                >
                  <option value="">Select Department</option>
                  {(departments || []).map(function (d) {
                    return (
                      <option key={d && d.id} value={d && d.id}>
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

              <Button
                variant="primary"
                type="submit"
                disabled={isSubmitting || creating}
              >
                {isSubmitting || creating ? "Creating…" : "Create Group"}
              </Button>
            </FormikForm>
          )}
        </Formik>
      </Modal.Body>
    </Modal>
  );
};

export default CreateGroupModal;
