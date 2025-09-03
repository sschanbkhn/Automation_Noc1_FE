// // // src/components/FileUpload.js

// // import React, { useState } from 'react';
// // import { useDispatch, useSelector } from 'react-redux';
// // import { uploadFile } from '../../redux/User/uploadSlice';

// // const FileUploadUser = () => {
// //   const [file, setFile] = useState(null);
// //   const dispatch = useDispatch();
// //   const { status, error, success } = useSelector((state) => state.upload);

// //   const handleFileChange = (e) => {
// //     setFile(e.target.files[0]);
// //   };

// //   const handleUpload = () => {
// //     if (file) {
// //       dispatch(uploadFile(file));
// //     } else {
// //       alert('Please select a file to upload');
// //     }
// //   };

// //   return (
// //     <div>
// //       <input type="file" onChange={handleFileChange} />
// //       <button onClick={handleUpload}>Upload</button>
// //       {status === 'loading' && <p>Uploading...</p>}
// //       {status === 'succeeded' && <p>File uploaded successfully!</p>}
// //       {status === 'failed' && <p>Error: {error}</p>}
// //     </div>
// //   );
// // };

// // export default FileUploadUser;


// // src/components/FileUploadForm.js

// import React from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { Formik, Form, Field, ErrorMessage } from 'formik';
// import * as Yup from 'yup';
// import { uploadFile } from '../../redux/User/uploadSlice';
// import { Form as BootstrapForm, InputGroup, Button } from 'react-bootstrap';

// const FileUploadForm = () => {
//   const dispatch = useDispatch();
//   const { status, error, success } = useSelector((state) => state.upload);

//   const initialValues = {
//     file: null,
//   };

//   const validationSchema = Yup.object().shape({
//     file: Yup.mixed().required('A file is required'),
//   });

//   const handleSubmit = (values, { setSubmitting }) => {
//     dispatch(uploadFile(values.file)).finally(() => setSubmitting(false));
//   };

//   return (
//     <Formik
//       initialValues={initialValues}
//       validationSchema={validationSchema}
//       onSubmit={handleSubmit}
//     >
//       {({ setFieldValue, isSubmitting }) => (
//         <Form>
//           <InputGroup className="mb-3">
//             <InputGroup.Prepend>
//               {/* <InputGroup.Text id="custom-addons5">Upload</InputGroup.Text> */}
//               <Button type="submit" disabled={isSubmitting}>
//                 Upload
//               </Button>
//             </InputGroup.Prepend>
//             <div className="custom-file">
//               <Field
//                 name="file"
//                 type="file"
//                 className="custom-file-input"
//                 id="validatedCustomFile1"
//                 onChange={(event) => {
//                   setFieldValue("file", event.currentTarget.files[0]);
//                 }}
//               />
//               <BootstrapForm.Label className="custom-file-label" htmlFor="validatedCustomFile1">
//                 Choose file
//               </BootstrapForm.Label>
//             </div>
//           </InputGroup>
//           <ErrorMessage name="file" component="div" className="text-danger" />

//           {status === 'loading' && <p>Uploading...</p>}
//           {status === 'succeeded' && <p>File uploaded successfully!</p>}
//           {status === 'failed' && <p>Error: {error}</p>}
//         </Form>
//       )}
//     </Formik>
//   );
// };

// export default FileUploadForm;



import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import Papa from 'papaparse';
import { uploadFile } from '../../redux/User/uploadSlice';
import { Form as BootstrapForm, InputGroup, Button } from 'react-bootstrap';

const FileUploadUser = () => {
  const dispatch = useDispatch();
  const { status, error } = useSelector((state) => state.upload);

  const initialValues = {
    file: null,
  };

  const validationSchema = Yup.object().shape({
    file: Yup.mixed().required('A file is required'),
  });

  const handleFileUpload = (file) => {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        complete: (result) => {
          resolve(result.data);
        },
        error: (error) => {
          reject(error);
        },
      });
    });
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const data = await handleFileUpload(values.file);
      // Send data to the backend
      dispatch(uploadFile(data));
    } catch (error) {
      console.error("Error parsing file", error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
    >
      {({ setFieldValue, isSubmitting }) => (
        <Form>
          <InputGroup className="mb-3">
            <div className="custom-file">
              <Field
                name="file"
                type="file"
                className="custom-file-input"
                id="validatedCustomFile1"
                onChange={(event) => {
                  setFieldValue('file', event.currentTarget.files[0]);
                }}
              />
              <BootstrapForm.Label className="custom-file-label" htmlFor="validatedCustomFile1">
                Choose file
              </BootstrapForm.Label>
            </div>
            <InputGroup.Append>
              <Button type="submit" disabled={isSubmitting}>
                Upload
              </Button>
            </InputGroup.Append>
          </InputGroup>
          <ErrorMessage name="file" component="div" className="text-danger" />
          {status === 'loading' && <p>Uploading...</p>}
          {status === 'succeeded' && <p>File uploaded successfully!</p>}
          {status === 'failed' && <p>
            Error: {typeof error === 'string' ? error : JSON.stringify(error)}
          </p>}
        </Form>
      )}
    </Formik>
  );
};

export default FileUploadUser;

