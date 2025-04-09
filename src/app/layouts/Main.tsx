import Breadcrumb from 'components/common/Breadcrumb';
import MainPageRoute from 'routes/MainPageRoute';
import React, { useEffect, useState } from 'react'
import { connect } from "react-redux";
interface Props {
       
}

const Main = (props: Props) => {  
    return(
      <main id="main" className="main">
        <Breadcrumb />
        <MainPageRoute />
      </main>
    )
}
const mapState = ({ ...state }) => ({
    
});
const mapDispatchToProps = {
    
};

export default connect(mapState, mapDispatchToProps)(Main);