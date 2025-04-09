
import React, { useEffect, useState } from 'react'
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'assets/css/mystyle.css';
import 'assets/scss/mystyle.scss';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { connect } from "react-redux";

import Header from './layouts/Header';
import Sidebar from './layouts/Sidebar';
import Main from './layouts/Main';
import Footer from './layouts/Footer';
import { BrowserRouter as Router, Route, Routes} from "react-router-dom";
import FullPageRoute from 'routes/FullPageRoute';
import { Cookie } from 'helpers/cookie';
import Loading from 'components/common/Loading';
interface Props {
    Apps: any
}

const App = (props: Props) => {    
    return (         
        <>
            {
                props.Apps.IsLoading ?
                <Loading /> :
                    <Router>    
                    {
                        (Cookie.getCookie("Token") || props.Apps.IsAuthenticated) ?                  
                        <>
                            <Header />            
                            <Sidebar />          
                            <Main />          
                            <Footer />
                        </>:
                        <FullPageRoute />
                    }                                      
                </Router> 
            } 
        </>
    )
}
const mapState = ({ ...state }) => ({
    Apps: state.apps
});
const mapDispatchToProps = {
    
};

export default connect(mapState, mapDispatchToProps)(App);