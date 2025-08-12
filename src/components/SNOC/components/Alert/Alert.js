import React from 'react';
// import { useSelector } from 'react-redux';
import { useSelector, useDispatch } from 'react-redux';
import { Toast } from 'react-bootstrap';
import { hideAlert } from '../../redux/Alert/alertSlice'; // Adjust the import path based on your project structure

// const Alert = () => {
//   const { message, type, visible } = useSelector((state) => state.alert);

//   if (!visible) return null;

//   return (
//     <div className="toast-container">
//       <Toast className={`toast-${type}`} onClose={() => {}} show={visible} delay={3000} autohide>
//         <Toast.Body>
//           {message}
//         </Toast.Body>
//       </Toast>
//     </div>
//   );
// };

// export default Alert;


const Alert = () => {
    const dispatch = useDispatch();
    const alerts = useSelector((state) => state.alert.alerts); // Get the array of alerts

    if (!alerts.length) return null;

    return (
        <div className="toast-container position-fixed top-0 end-0 p-3" style={{ zIndex: 1050 }}>
            {alerts.map((alert) => (
                <Toast
                    key={alert.id}
                    className={`toast-${alert.type}`}
                    onClose={() => dispatch(hideAlert(alert.id))}
                    show={true}
                    delay={1000}
                    autohide
                >
                    <Toast.Body>
                        {alert.message}
                    </Toast.Body>
                </Toast>
            ))}
        </div>
    );
};

export default Alert;