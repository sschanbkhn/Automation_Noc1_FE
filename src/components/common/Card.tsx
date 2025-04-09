import { Button, Input } from 'element-react';
import React, { useEffect, useState } from 'react'
import { connect } from "react-redux";
import CtrlButton from './CtrlButton';
interface Props {
    key: string,
    title: string,
    children?: React.ReactNode,
    buttonGroups?: React.ReactNode
}

const Card = (props: Props) => {  

    return (
        <div key={props.key} className="card">
            <div className="card-header">{props.title}
                <div className="button-groups">
                    {props.buttonGroups?props.buttonGroups:<></>}
                </div>
            </div>
            <div className="card-body">
                {props.children}
            </div>
        </div>    
    )
}
const mapState = ({ ...state }) => ({
    
});
const mapDispatchToProps = {
    
};

export default connect(mapState, mapDispatchToProps)(Card);