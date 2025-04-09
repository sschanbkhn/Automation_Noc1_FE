import React, { useEffect, useRef, useState } from 'react'
import { connect } from "react-redux";


interface Props {
    Apps: any
}

const Home = (props: Props) => {
    return(
        <></>
    )
}
const mapState = ({ ...state }) => ({
    Apps: state.apps
});
const mapDispatchToProps = {

};

export default connect(mapState, mapDispatchToProps)(Home);