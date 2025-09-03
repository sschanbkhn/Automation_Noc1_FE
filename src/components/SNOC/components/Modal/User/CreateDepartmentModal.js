import { ErrorMessage, Field, Formik, Form as FormikForm } from "formik";
import React from "react";
import { Button, Form, Modal } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import * as Yup from "yup";
import {
  createDepartment,
  toggleModalCreateDepartment,
} from "../../../redux/User/departmentSlice";

const EMPTY_OBJ = Object.freeze({});
const selectDeptState = (s) => s.department || s.departments || EMPTY_OBJ;

const CreateDepartmentModal = () => {
  const dispatch = useDispatch();

  const deptState = useSelector(selectDeptState);
  const showModalCreateDepartment = !!deptState.showModalCreateDepartment;
  const statusDepartment = deptState.statusDepartment || "idle";
  const errorDepartment =
    "errorDepartment" in deptState ? deptState.errorDepartment : null;

  const initialValues = { name: "" };

  const validationSchema = Yup.object().shape({
    name: Yup.string().required("Department name is required"),
  });

  const handleSubmit = (values, { setSubmitting, resetForm }) => {
    const p = dispatch(createDepartment(values));
    if (p && typeof p.unwrap === "function") {
      p.unwrap()
        .then(function () {
          setSubmitting(false);
          resetForm();
          dispatch(toggleModalCreateDepartment());
        })
        .catch(function () {
          setSubmitting(false);
        });
    } else {
      p.finally(function () {
        setSubmitting(false);
        dispatch(toggleModalCreateDepartment());
      });
    }
  };

  const handleClose = () => dispatch(toggleModalCreateDepartment());

  return (
    <Modal show={showModalCreateDepartment} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Create Department</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting }) => (
            <FormikForm>
              <Form.Group controlId="formDepartmentName">
                <Form.Label>Department Name</Form.Label>
                <Field type="text" name="name" className="form-control" />
                <ErrorMessage
                  name="name"
                  component="div"
                  className="text-danger"
                />
              </Form.Group>

              {statusDepartment === "failed" && errorDepartment && (
                <div className="text-danger mt-2">
                  {typeof errorDepartment === "string"
                    ? errorDepartment
                    : JSON.stringify(errorDepartment)}
                </div>
              )}

              <Button
                variant="primary"
                type="submit"
                disabled={isSubmitting || statusDepartment === "loading"}
              >
                {isSubmitting || statusDepartment === "loading"
                  ? "Creating..."
                  : "Create Department"}
              </Button>
            </FormikForm>
          )}
        </Formik>
      </Modal.Body>
    </Modal>
  );
};

export default CreateDepartmentModal;
