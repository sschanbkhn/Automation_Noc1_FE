import React, { useEffect, useState } from 'react'
import { connect } from "react-redux";
interface Props {
       
}

const Page404 = (props: Props) => {  
    return(
        <section className="section error-404 min-vh-100 d-flex flex-column align-items-center justify-content-center">
            <h1>404</h1>
            <h2>Trang bạn đang tìm kiếm không tồn tại.</h2>            
        </section>
    )
}
const mapState = ({ ...state }) => ({
    
});
const mapDispatchToProps = {
    
};

export default connect(mapState, mapDispatchToProps)(Page404);