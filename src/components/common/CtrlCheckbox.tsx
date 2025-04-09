import { Checkbox, } from 'element-react';
import React, { useEffect, useState } from 'react'
import { connect } from "react-redux";
interface Props {
    key?: any,
    value: any,
    label: any,
    disabled?: boolean,
    onChange: Function,
    style?: any
}

const CtrlCheckbox = (props: Props) => {  

    return (
        <Checkbox style={props.style} key={props.key} checked={typeof props.value === "string" ? (props.value === "true" ? true : false ) : props.value} disabled={props.disabled} onChange={(e) => {props.onChange(e)}}><b>{props.label}</b></Checkbox>
    )
}
const mapState = ({ ...state }) => ({
    
});
const mapDispatchToProps = {
    
};

export default connect(mapState, mapDispatchToProps)(CtrlCheckbox);