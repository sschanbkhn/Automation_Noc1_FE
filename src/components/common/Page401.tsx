import React, { useEffect, useState } from 'react'
import { connect } from "react-redux";
interface Props {
       
}

const Page401 = (props: Props) => {  
    return(
        <section className="section error-404 min-vh-100 d-flex flex-column align-items-center justify-content-center">
            <h1>401</h1>
            <h2>Trang bạn truy cập không hợp lệ.</h2>            
        </section>
    )
}
const mapState = ({ ...state }) => ({
    
});
const mapDispatchToProps = {
    
};

export default connect(mapState, mapDispatchToProps)(Page401);