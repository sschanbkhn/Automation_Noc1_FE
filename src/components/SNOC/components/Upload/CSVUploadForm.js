// CSVUploadForm.js
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Formik, Form } from 'formik';
import { uploadUsersCSV, resetError } from './../../redux/User/userSlice';
// import * as Yup from 'yup';
import { Button, Alert, Spinner, Form as BootstrapForm, InputGroup } from 'react-bootstrap';
const CSVUploadForm = () => {
    const dispatch = useDispatch();
    const { loading, erroruploadUsersCSV } = useSelector((state) => state.userState);
    useEffect(() => {
        dispatch(resetError());
        return () => {
            dispatch(resetError());
        };
    }, [dispatch]);

    const initialValues = {
        file: null,
    };

    // const validationSchema = Yup.object().shape({
    //     file: Yup.mixed().required('A file is required'),
    // });

    const handleSubmit = (values, { setSubmitting }) => {
        const file = values.file;
        dispatch(uploadUsersCSV(file)).finally(() => setSubmitting(false));
    };

    return (
        <Formik initialValues={initialValues} onSubmit={handleSubmit}>
            {({ setFieldValue, values }) => (
                <Form className="form-group">
                    <InputGroup className="mb-3">
                        <div className="custom-file">
                            <input
                                name="file"
                                type="file"
                                className="custom-file-input"
                                id="validatedCustomFile1"
                                onChange={(event) => {
                                    setFieldValue('file', event.currentTarget.files[0] || null);
                                }}
                            />
                            <BootstrapForm.Label className="custom-file-label" htmlFor="validatedCustomFile1">
                                {values.file ? values.file.name : 'Choose file'}
                            </BootstrapForm.Label>
                        </div>
                        <InputGroup.Append>
                            <Button variant="primary" type="submit" disabled={loading}>
                                {loading ? (
                                    <>
                                        <Spinner
                                            as="span"
                                            animation="border"
                                            size="sm"
                                            role="status"
                                            aria-hidden="true"
                                        />
                                        Uploading...
                                    </>
                                ) : (
                                    'Upload'
                                )}
                            </Button>
                        </InputGroup.Append>
                    </InputGroup>
                    {erroruploadUsersCSV && (
                        <Alert variant="danger" className="mt-3">
                            {typeof erroruploadUsersCSV === 'string' ? erroruploadUsersCSV : JSON.stringify(erroruploadUsersCSV)}
                        </Alert>
                    )}
                    {/* {usersadds.length > 0 && (
                        <div className="mt-4">
                            <h3>Uploaded Users</h3>
                            <ul className="list-group">
                                {users.map((user, index) => (
                                    <li key={index} className="list-group-item">
                                        {user.id} - {user.username} - {user.email}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )} */}
                </Form>
            )}
        </Formik>
    );
};

export default CSVUploadForm;
