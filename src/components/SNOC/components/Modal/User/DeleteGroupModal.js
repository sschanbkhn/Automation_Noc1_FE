// DeleteGroupModal.js
import React from "react";
import { Button, Modal } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import {
  deleteGroup,
  toggleModalDeleteGroup,
} from "../../../redux/User/groupSlice";

const EMPTY_OBJ = Object.freeze({});
const selectGroupState = (s) => s.group || s.groups || EMPTY_OBJ;

const DeleteGroupModal = () => {
  const dispatch = useDispatch();

  const groupState = useSelector(selectGroupState);
  const showModalDeleteGroup = !!groupState.showModalDeleteGroup;
  const selectedGroup = groupState.selectedGroup || null;
  const statusGroup = groupState.statusGroup || "idle";
  const errorGroup = "errorGroup" in groupState ? groupState.errorGroup : null;

  const deleting =
    !!groupState.deleting ||
    !!groupState.deletingGroup ||
    statusGroup === "loading";

  const handleClose = () => dispatch(toggleModalDeleteGroup());

  const handleDelete = () => {
    if (!(selectedGroup && selectedGroup.id)) return;
    const p = dispatch(deleteGroup(selectedGroup.id));
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
    <Modal show={showModalDeleteGroup} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Delete Group</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {selectedGroup ? (
          <>
            Are you sure you want to delete the group:{" "}
            <span style={{ color: "red" }}>
              {(selectedGroup && selectedGroup.name) || ""}
            </span>
          </>
        ) : (
          <span className="text-muted">No group selected.</span>
        )}

        {errorGroup && (
          <div className="text-danger mt-2">
            {typeof errorGroup === "string"
              ? errorGroup
              : JSON.stringify(errorGroup)}
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
          disabled={!(selectedGroup && selectedGroup.id) || deleting}
        >
          {deleting ? "Deleting…" : "Delete"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default DeleteGroupModal;
