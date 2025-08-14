import React, { useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { connect } from "react-redux";
import Login from 'components/common/Login';
import Register from 'components/common/Signup';
import Page404 from 'components/common/Page404';
import RestorePassword from 'components/common/RestorePassword';
interface Props {
       
}

const FullPageRoute = (props: Props) => {  
    return(
        <Routes>
            <Route key="Login" path="/" element={<Login />} />
            <Route key="Register" path="/register" element={<Register />} />
            <Route key="404" path="*" element={<Page404 />} />
            <Route key="RestorePassword" path='/restore-password' element={<RestorePassword />}/>
        </Routes>
    )
}
const mapState = ({ ...state }) => ({
    
});
const mapDispatchToProps = {
    
};

export default connect(mapState, mapDispatchToProps)(FullPageRoute);