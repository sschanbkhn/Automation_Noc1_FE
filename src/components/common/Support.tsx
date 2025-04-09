import React, { useEffect, useState } from 'react'
import { connect } from "react-redux";
interface Props {
       
}

const Support = (props: Props) => {  
    return(
        <>
            <h1>Hỗ trợ</h1>
        </>
    )
}
const mapState = ({ ...state }) => ({
    
});
const mapDispatchToProps = {
    
};

export default connect(mapState, mapDispatchToProps)(Support);