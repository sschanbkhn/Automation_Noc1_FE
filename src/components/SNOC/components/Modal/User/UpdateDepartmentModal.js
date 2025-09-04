// updateDepartmentModal.js
import { ErrorMessage, Field, Formik, Form as FormikForm } from "formik";
import React from "react";
import { Button, Form, Modal } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import * as Yup from "yup";
import {
  toggleModalUpdateDepartment,
  updateDepartment,
} from "./../../../redux/User/departmentSlice";

const EMPTY_OBJ = Object.freeze({});
const selectDeptState = (s) => s.department || s.departments || EMPTY_OBJ;

const UpdateDepartmentModal = () => {
  const dispatch = useDispatch();

  const deptState = useSelector(selectDeptState);
  const showModalUpdateDepartment = !!deptState.showModalUpdateDepartment;
  const selectedDepartment = deptState.selectedDepartment || null;
  const statusDepartment = deptState.statusDepartment || "idle";
  const errorDepartment =
    "errorDepartment" in deptState ? deptState.errorDepartment : null;

  const handleClose = () => dispatch(toggleModalUpdateDepartment());

  const initialValues = {
    name:
      selectedDepartment && selectedDepartment.name
        ? selectedDepartment.name
        : "",
  };

  const validationSchema = Yup.object({
    name: Yup.string().required("Name is required"),
  });

  const handleSubmit = (values, { setSubmitting, resetForm }) => {
    if (!(selectedDepartment && selectedDepartment.id)) {
      setSubmitting(false);
      return;
    }
    const p = dispatch(
      updateDepartment({
        departmentId: selectedDepartment.id,
        departmentData: values,
      })
    );

    if (p && typeof p.unwrap === "function") {
      p.unwrap()
        .then(function () {
          setSubmitting(false);
          resetForm();
          handleClose();
        })
        .catch(function () {
          setSubmitting(false);
        });
    } else {
      p.finally(function () {
        setSubmitting(false);
        handleClose();
      });
    }
  };

  const updating = statusDepartment === "loading";
  const disableSubmit =
    updating || !(selectedDepartment && selectedDepartment.id);

  return (
    <Modal show={showModalUpdateDepartment} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>
          Edit Department{" "}
          <span style={{ color: "red" }}>
            {selectedDepartment && selectedDepartment.name
              ? selectedDepartment.name
              : ""}
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
          {({ isSubmitting }) => (
            <FormikForm>
              <Form.Group controlId="formName" className="mb-3">
                <Form.Label>Name</Form.Label>
                <Field type="text" name="name" className="form-control" />
                <ErrorMessage
                  name="name"
                  component="div"
                  className="text-danger"
                />
              </Form.Group>

              {statusDepartment === "failed" && errorDepartment && (
                <div className="text-danger mb-3">
                  {typeof errorDepartment === "string"
                    ? errorDepartment
                    : JSON.stringify(errorDepartment)}
                </div>
              )}

              <Button
                variant="primary"
                type="submit"
                disabled={isSubmitting || disableSubmit}
              >
                {isSubmitting || updating ? "Updating…" : "Update Department"}
              </Button>
            </FormikForm>
          )}
        </Formik>
      </Modal.Body>
    </Modal>
  );
};

export default UpdateDepartmentModal;
