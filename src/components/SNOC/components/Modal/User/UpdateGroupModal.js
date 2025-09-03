// UpdateGroupModal.js
import { ErrorMessage, Field, Formik, Form as FormikForm } from "formik";
import React from "react";
import { Button, Form, Modal } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import * as Yup from "yup";
import {
  toggleModalUpdateGroup,
  updateGroup,
} from "./../../../redux/User/groupSlice";

const EMPTY_OBJ = Object.freeze({});
const EMPTY_ARR = Object.freeze([]);

const selectGroupState = (s) => s.group || s.groups || EMPTY_OBJ;
const selectDeptState = (s) => s.department || s.departments || EMPTY_OBJ;

function getId(maybeObj) {
  return typeof maybeObj === "object" && maybeObj !== null
    ? maybeObj.id
    : maybeObj;
}

const UpdateGroupModal = () => {
  const dispatch = useDispatch();

  const groupState = useSelector(selectGroupState);
  const showModalUpdateGroup = !!groupState.showModalUpdateGroup;
  const selectedGroup = groupState.selectedGroup || null;
  const statusGroup = groupState.statusGroup || "idle";
  const errorGroup = "errorGroup" in groupState ? groupState.errorGroup : null;
  const updating =
    statusGroup === "loading" ||
    !!groupState.updating ||
    !!groupState.updatingGroup;

  const departments = useSelector(
    (s) => selectDeptState(s).departments || EMPTY_ARR
  );

  const handleClose = () => dispatch(toggleModalUpdateGroup());

  var currentDepObj = selectedGroup ? selectedGroup.department : null;
  var currentDepId = getId(currentDepObj) || "";

  const initialValues = {
    name: selectedGroup && selectedGroup.name ? selectedGroup.name : "",
    department_id: String(currentDepId || ""),
  };

  const validationSchema = Yup.object({
    name: Yup.string().required("Group is required"),
    department_id: Yup.string().required("Department is required"),
  });

  const handleSubmit = (values, { setSubmitting, resetForm }) => {
    if (!(selectedGroup && selectedGroup.id)) {
      setSubmitting(false);
      return;
    }

    const p = dispatch(
      updateGroup({
        groupId: selectedGroup.id,
        groupData: values,
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

  const disableSubmit = updating || !(selectedGroup && selectedGroup.id);

  return (
    <Modal show={showModalUpdateGroup} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>
          Edit Group{" "}
          <span style={{ color: "red" }}>
            {(selectedGroup && selectedGroup.name) || ""}
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
                <Form.Label>Group</Form.Label>
                <Field type="text" name="name" className="form-control" />
                <ErrorMessage
                  name="name"
                  component="div"
                  className="text-danger"
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="formDepartment">
                <Form.Label>Department</Form.Label>
                <Field
                  as="select"
                  name="department_id"
                  className="form-control"
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

              {statusGroup === "failed" && errorGroup && (
                <div className="text-danger mb-3">
                  {typeof errorGroup === "string"
                    ? errorGroup
                    : JSON.stringify(errorGroup)}
                </div>
              )}

              <Button
                type="submit"
                variant="primary"
                disabled={isSubmitting || disableSubmit}
              >
                {isSubmitting || updating ? "Updating…" : "Update Group"}
              </Button>
            </FormikForm>
          )}
        </Formik>
      </Modal.Body>
    </Modal>
  );
};

export default UpdateGroupModal;
