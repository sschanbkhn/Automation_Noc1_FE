import { Input, InputNumber } from 'element-react';
import React, { useEffect, useState } from 'react'
import { connect } from "react-redux";
interface Props {
    key?: any,
    value: any,
    size?: any,
    onChange: Function
    disabled?: any
}

const CtrlInputNumber = (props: Props) => {  
    return (
        <InputNumber  key={props.key}      
                disabled={props.disabled == true ? true : false}                          
                size={props.size ? props.size : 'small'}                                
                onChange={(e) => {props.onChange(e)}}
                defaultValue={props.value}
                value={props.value} />
    )
}
const mapState = ({ ...state }) => ({
    
});
const mapDispatchToProps = {
    
};

export default connect(mapState, mapDispatchToProps)(CtrlInputNumber);