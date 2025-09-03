import Modal from "react-bootstrap/Modal";
import RestRegister from "../../../views/auth/signup/RestRegister";
function ModalAddUser(props) {
  // const [show, setShow] = useState(false);

  // const handleClose = () => setShow(false);
  // const handleShow = () => setShow(true);
  const { show, handleClose } = props;
  // console.log(handleClose)
  return (
    <>
      {/* <Button variant="primary" onClick={handleShow}>
                Launch demo modal
            </Button> */}

      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Add User</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <RestRegister handleClose={handleClose} />
        </Modal.Body>
        {/* <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        Close
                    </Button>
                    <Button variant="primary" onClick={handleClose}>
                        Save Changes
                    </Button>
                </Modal.Footer> */}
      </Modal>
    </>
  );
}

export default ModalAddUser;
