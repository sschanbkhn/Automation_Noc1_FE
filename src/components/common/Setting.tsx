import React, { useEffect, useState } from 'react'
import { connect } from "react-redux";
interface Props {
       
}

const Setting = (props: Props) => {  
    return(
        <>
            <h1>Cài đặt</h1>
        </>
    )
}
const mapState = ({ ...state }) => ({
    
});
const mapDispatchToProps = {
    
};

export default connect(mapState, mapDispatchToProps)(Setting);