// deleteDepartmentModal.js
import React from "react";
import { Button, Modal } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import {
  deleteDepartment,
  toggleModalDeleteDepartment,
} from "../../../redux/User/departmentSlice";

const EMPTY_OBJ = Object.freeze({});
const selectDeptState = (s) => s.department || s.departments || EMPTY_OBJ;

const DeleteDepartmentModal = () => {
  const dispatch = useDispatch();

  const deptState = useSelector(selectDeptState);
  const showModalDeleteDepartment = !!deptState.showModalDeleteDepartment;
  const selectedDepartment = deptState.selectedDepartment || null;
  const deleting =
    !!deptState.deleting ||
    !!deptState.deletingDepartment ||
    !!deptState.deletingDepart;
  const errorDelete =
    "errorDeleteDepartment" in deptState
      ? deptState.errorDeleteDepartment
      : null;

  const handleClose = () => dispatch(toggleModalDeleteDepartment());

  const handleDelete = () => {
    if (!(selectedDepartment && selectedDepartment.id)) return;
    const p = dispatch(deleteDepartment(selectedDepartment.id));
    if (p && typeof p.unwrap === "function") {
      p.unwrap()
        .then(function () {
          handleClose();
        })
        .catch(function () {
          /* giữ modal để hiển thị lỗi */
        });
    } else {
      p.finally(function () {
        handleClose();
      });
    }
  };

  return (
    <Modal show={showModalDeleteDepartment} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Delete Department</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {selectedDepartment ? (
          <>
            Are you sure you want to delete the department:{" "}
            <span style={{ color: "red" }}>
              {(selectedDepartment && selectedDepartment.name) || ""}
            </span>
          </>
        ) : (
          <span className="text-muted">No department selected.</span>
        )}
        {errorDelete && (
          <div className="text-danger mt-2">
            {typeof errorDelete === "string"
              ? errorDelete
              : JSON.stringify(errorDelete)}
          </div>
        )}
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Cancel
        </Button>
        <Button
          variant="danger"
          onClick={handleDelete}
          disabled={!(selectedDepartment && selectedDepartment.id) || deleting}
        >
          {deleting ? "Deleting…" : "Delete"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default DeleteDepartmentModal;
