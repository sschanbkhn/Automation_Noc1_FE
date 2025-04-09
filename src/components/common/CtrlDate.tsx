import { DatePicker, Input } from 'element-react';
import React, { useEffect, useState } from 'react'
import { connect } from "react-redux";
interface Props {
    key?: any,
    value: any,   
    onChange: Function,   
    placeholder?: any,
}

const CtrlDate = (props: Props) => {          
    return (
        <DatePicker
          value={props.value? new Date(props.value):null}
          placeholder={props.placeholder} 
          onChange={(e) => { props.onChange(e); }}
          format={"dd/MM/yyyy"}
          />
    )
}
const mapState = ({ ...state }) => ({
    
});
const mapDispatchToProps = {
    
};

export default connect(mapState, mapDispatchToProps)(CtrlDate);