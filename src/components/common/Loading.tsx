import React, { useEffect, useState } from 'react'
import { connect } from "react-redux";
interface Props {
       
}

const Loading = (props: Props) => {  
    return(
        <div className="loading">
            <div className='uil-ring-css' style={{"transform":"scale(0.79)"}}>
                    <div></div>
            </div>
        </div>
    )
}
const mapState = ({ ...state }) => ({
    
});
const mapDispatchToProps = {
    
};

export default connect(mapState, mapDispatchToProps)(Loading);