import { Input } from 'element-react';
import React, { useEffect, useState } from 'react'
import { connect } from "react-redux";
interface Props {
    key?: any,
    value: any,
    type?: string,
    size?: any,
    placeholder?: string,
    readOnly?: boolean,
    disabled?: boolean,
    autoFocus?: boolean,
    onChange: Function,
    rows?: any
}

const CtrlInput = (props: Props) => {  

    return (
        <Input  key={props.key}
                rows = {props.rows? props.rows: 4}
                autoFocus = {props.autoFocus == true ? true : false}
                readOnly={props.readOnly == true ? true : false}
                disabled={props.disabled == true ? true : false}
                size={props.size ? props.size : 'small'}
                type={props.type ? props.type : 'text'}
                placeholder={props.placeholder} 
                onChange={(e) => {props.onChange(e)}}
                value={props.value} />
    )
}
const mapState = ({ ...state }) => ({
    
});
const mapDispatchToProps = {
    
};

export default connect(mapState, mapDispatchToProps)(CtrlInput);