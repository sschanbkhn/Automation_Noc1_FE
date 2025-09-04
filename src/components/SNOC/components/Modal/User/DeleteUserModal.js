// DeleteUserModal.js
import React from "react";
import { Button, Modal } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { deleteUser, toggleModalDelete } from "../../../redux/User/userSlice";

const DeleteUserModal = () => {
  const dispatch = useDispatch();

  // ✅ Fallback: userState → user → users → {}
  const userState = useSelector((s) => s.userState ?? s.user ?? s.users ?? {});
  const showModalDelete = Boolean(userState.showModalDelete);
  const selectedUser = userState.selectedUser ?? null;

  // Gom các khả năng cờ "đang xoá"
  const deleting =
    Boolean(userState.deleting) ||
    Boolean(userState.deletingUser) ||
    userState.status === "loading";

  const errorDelete = userState.errorDeleteUser ?? userState.error ?? null;

  const handleClose = () => dispatch(toggleModalDelete());

  const handleDelete = () => {
    if (!selectedUser?.id) return;
    const p = dispatch(deleteUser(selectedUser.id));
    if (typeof p?.unwrap === "function") {
      p.unwrap()
        .then(() => handleClose())
        .catch(() => {
          // Giữ modal mở để hiển thị lỗi nếu slice có set error
        });
    } else {
      // Trường hợp không dùng createAsyncThunk
      p.finally(() => handleClose());
    }
  };

  return (
    <Modal show={showModalDelete} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Delete User</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {selectedUser ? (
          <>
            Are you sure you want to delete the user:{" "}
            <span style={{ color: "red" }}>{selectedUser.username}</span>
          </>
        ) : (
          <span className="text-muted">No user selected.</span>
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
          disabled={!selectedUser?.id || deleting}
        >
          {deleting ? "Deleting…" : "Delete"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default DeleteUserModal;
