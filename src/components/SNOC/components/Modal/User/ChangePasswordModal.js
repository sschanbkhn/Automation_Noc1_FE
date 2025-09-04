// ChangePasswordModal.js
import { ErrorMessage, Field, Formik, Form as FormikForm } from "formik";
import React from "react";
import { Button, Form, Modal } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import * as Yup from "yup";
import {
  changePassword,
  toggleChangePasswordModal,
} from "../../../redux/User/userSlice";

const EMPTY_OBJ = Object.freeze({});
const selectUserState = (s) => s.userState || s.user || s.users || EMPTY_OBJ;

const ChangePasswordModal = () => {
  const dispatch = useDispatch();

  const userState = useSelector(selectUserState);
  const showChangePasswordModal = !!userState.showChangePasswordModal;
  const selectedUser = userState.selectedUser || null;
  const changingPassword = !!userState.changingPassword;

  const initialValues = {
    id: selectedUser && selectedUser.id ? selectedUser.id : "",
    password: "",
  };

  const validationSchema = Yup.object({
    password: Yup.string()
      .min(4, "Password must be at least 4 characters")
      .required("Password is required"),
  });

  const handleSubmit = (values, { setSubmitting, resetForm }) => {
    if (!values.id) {
      setSubmitting(false);
      return;
    }
    const p = dispatch(changePassword(values));
    if (p && typeof p.unwrap === "function") {
      p.unwrap()
        .then(function () {
          setSubmitting(false);
          resetForm();
          dispatch(toggleChangePasswordModal());
        })
        .catch(function () {
          setSubmitting(false);
        });
    } else {
      p.finally(function () {
        setSubmitting(false);
        dispatch(toggleChangePasswordModal());
      });
    }
  };

  const handleClose = () => dispatch(toggleChangePasswordModal());

  return (
    <Modal show={showChangePasswordModal} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>
          Change Password for user:{" "}
          <span style={{ color: "red" }}>
            {selectedUser && selectedUser.username ? selectedUser.username : ""}
          </span>
        </Modal.Title>
      </Modal.Header>

      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {({ isSubmitting }) => (
          <FormikForm>
            <Modal.Body>
              <Form.Group controlId="formId" className="mb-3">
                <Form.Label>ID</Form.Label>
                <Field name="id" type="text" readOnly as={Form.Control} />
                <ErrorMessage
                  name="id"
                  component="div"
                  className="text-danger"
                />
              </Form.Group>

              <Form.Group controlId="formPassword">
                <Form.Label>New Password</Form.Label>
                <Field name="password" type="password" as={Form.Control} />
                <ErrorMessage
                  name="password"
                  component="div"
                  className="text-danger"
                />
              </Form.Group>
            </Modal.Body>

            <Modal.Footer>
              <Button variant="secondary" onClick={handleClose}>
                Close
              </Button>
              <Button
                variant="primary"
                type="submit"
                disabled={
                  isSubmitting ||
                  changingPassword ||
                  !(selectedUser && selectedUser.id)
                }
              >
                {isSubmitting || changingPassword
                  ? "Changing…"
                  : "Change Password"}
              </Button>
            </Modal.Footer>
          </FormikForm>
        )}
      </Formik>
    </Modal>
  );
};

export default ChangePasswordModal;
