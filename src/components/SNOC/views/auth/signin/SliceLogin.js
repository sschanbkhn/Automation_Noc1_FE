import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { Button, Col, Row, Alert } from 'react-bootstrap'; // Assuming you're using react-bootstrap
import { loginUser } from './../../../redux/User/authSlice';
import useScriptRef from '../../../hooks/useScriptRef';
// const SliceLogin = ({ className, ...rest }) => {
//     const dispatch = useDispatch();
//     const authStatus = useSelector((state) => state.account.status);
//     const authError = useSelector((state) => state.account.error);

//     return (
//         <React.Fragment>
//             <Formik
//                 initialValues={{
//                     email: '',
//                     password: '',
//                     submit: null,
//                 }}
//                 validationSchema={Yup.object().shape({
//                     email: Yup.string().email('Must be a valid email').max(255).required('Email is required'),
//                     password: Yup.string().max(255).required('Password is required'),
//                 })}
//                 onSubmit={async (values, { setErrors, setStatus, setSubmitting }) => {
//                     try {
//                         const resultAction = await dispatch(loginUser(values));
//                         if (loginUser.fulfilled.match(resultAction)) {
//                             dispatch(
//                                 ACCOUNT_INITIALIZE({
//                                     isLoggedIn: true,
//                                     user: resultAction.payload.user,
//                                     token: resultAction.payload.token,
//                                 })
//                             );
//                             setStatus({ success: true });
//                             setSubmitting(false);
//                         } else {
//                             setStatus({ success: false });
//                             setErrors({ submit: resultAction.payload });
//                             setSubmitting(false);
//                         }
//                     } catch (err) {
//                         setStatus({ success: false });
//                         setErrors({ submit: err.message });
//                         setSubmitting(false);
//                     }
//                 }}
//             >
//                 {({ errors, handleBlur, handleChange, handleSubmit, isSubmitting, touched, values }) => (
//                     <form noValidate onSubmit={handleSubmit} className={className} {...rest}>
//                         <div className="form-group mb-3">
//                             <input
//                                 className="form-control"
//                                 error={touched.email && errors.email}
//                                 label="Email Address"
//                                 placeholder="Email Address"
//                                 name="email"
//                                 onBlur={handleBlur}
//                                 onChange={handleChange}
//                                 type="email"
//                                 value={values.email}
//                             />
//                             {touched.email && errors.email && <small className="text-danger form-text">{errors.email}</small>}
//                         </div>
//                         <div className="form-group mb-4">
//                             <input
//                                 className="form-control"
//                                 error={touched.password && errors.password}
//                                 label="Password"
//                                 placeholder="Password"
//                                 name="password"
//                                 onBlur={handleBlur}
//                                 onChange={handleChange}
//                                 type="password"
//                                 value={values.password}
//                             />
//                             {touched.password && errors.password && <small className="text-danger form-text">{errors.password}</small>}
//                         </div>

//                         {errors.submit || authError ? (
//                             <Col sm={12}>
//                                 <Alert variant="danger">{errors.submit || authError}</Alert>
//                             </Col>
//                         ) : null}

//                         <div className="custom-control custom-checkbox text-left mb-4 mt-2">
//                             <input type="checkbox" className="custom-control-input" id="customCheck1" />
//                             <label className="custom-control-label" htmlFor="customCheck1">
//                                 Save credentials.
//                             </label>
//                         </div>

//                         <Row>
//                             <Col mt={2}>
//                                 <Button
//                                     className="btn-block"
//                                     color="primary"
//                                     disabled={isSubmitting || authStatus === 'loading'}
//                                     size="large"
//                                     type="submit"
//                                     variant="primary"
//                                 >
//                                     Sign IN
//                                 </Button>
//                             </Col>
//                         </Row>
//                     </form>
//                 )}
//             </Formik>
//             <hr />
//         </React.Fragment>
//     );
// };

// export default SliceLogin;



const RestLogin = ({ className, ...rest }) => {
    const dispatch = useDispatch();
    const scriptedRef = useScriptRef();

    return (
        <React.Fragment>
            <Formik
                initialValues={{
                    email: '',
                    password: '',
                    submit: null
                }}
                validationSchema={Yup.object().shape({
                    email: Yup.string().email('Must be a valid email').max(255).required('Email is required'),
                    password: Yup.string().max(255).required('Password is required')
                })}
                onSubmit={async (values, { setErrors, setStatus, setSubmitting }) => {
                    try {
                        const resultAction = await dispatch(loginUser({
                            email: values.email,
                            password: values.password
                        }));

                        if (loginUser.fulfilled.match(resultAction)) {
                            // Handle success
                            if (scriptedRef.current) {
                                setStatus({ success: true });
                                setSubmitting(false);
                            }
                        } else {
                            // Handle errors
                            setStatus({ success: false });
                            setErrors({ submit: resultAction.payload });
                            setSubmitting(false);
                        }
                    } catch (err) {
                        console.error(err);
                        if (scriptedRef.current) {
                            setStatus({ success: false });
                            setErrors({ submit: err.message });
                            setSubmitting(false);
                        }
                    }
                }}
            >
                {({ errors, handleBlur, handleChange, handleSubmit, isSubmitting, touched, values }) => (
                    <form noValidate onSubmit={handleSubmit} className={className} {...rest}>
                        <div className="form-group mb-3">
                            <input
                                className="form-control"
                                error={touched.email && errors.email}
                                label="Email Address"
                                placeholder="Email Address"
                                name="email"
                                onBlur={handleBlur}
                                onChange={handleChange}
                                type="email"
                                value={values.email}
                            />
                            {touched.email && errors.email && <small className="text-danger form-text">{errors.email}</small>}
                        </div>
                        <div className="form-group mb-4">
                            <input
                                className="form-control"
                                error={touched.password && errors.password}
                                label="Password"
                                placeholder="Password"
                                name="password"
                                onBlur={handleBlur}
                                onChange={handleChange}
                                type="password"
                                value={values.password}
                            />
                            {touched.password && errors.password && <small className="text-danger form-text">{errors.password}</small>}
                        </div>

                        {errors.submit && (
                            <Col sm={12}>
                                <Alert variant="danger">{errors.submit}</Alert>
                            </Col>
                        )}

                        <div className="custom-control custom-checkbox  text-left mb-4 mt-2">
                            <input type="checkbox" className="custom-control-input" id="customCheck1" />
                            <label className="custom-control-label" htmlFor="customCheck1">
                                Save credentials.
                            </label>
                        </div>

                        <Row>
                            <Col mt={2}>
                                <Button
                                    className="btn-block"
                                    color="primary"
                                    disabled={isSubmitting}
                                    size="large"
                                    type="submit"
                                    variant="primary"
                                >
                                    Sign IN
                                </Button>
                            </Col>
                        </Row>
                    </form>
                )}
            </Formik>
            <hr />
        </React.Fragment>
    );
};

export default RestLogin;