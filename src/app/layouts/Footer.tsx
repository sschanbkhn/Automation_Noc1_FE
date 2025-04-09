import { AppName } from 'models/Enums';
import React, { useEffect, useState } from 'react'
import { connect } from "react-redux";
interface Props {
       
}

const Footer = (props: Props) => {  
    return(
        <>
            <footer id="footer" className="footer">
                <div className="copyright">
                © Bản quyền thuộc về <strong><span>Nhà của tôi</span></strong>. 
                </div>
            </footer>
            <a href="#" className="back-to-top d-flex align-items-center justify-content-center"><i className="bi bi-arrow-up-short" /></a>
      </>
    )
}
const mapState = ({ ...state }) => ({
    
});
const mapDispatchToProps = {
    
};

export default connect(mapState, mapDispatchToProps)(Footer);