import { Select } from 'element-react';
import React, { useEffect, useState } from 'react'
import { connect } from "react-redux";
interface Props {
    key?: any,
    value: any,
    options: any,
    keyOptions?: any,
    size?: any,
    placeholder?: string,
    onChange: Function,
    filterable: any,
    multiple: any,
    disabled?: boolean
    clearable?: boolean
}

const CtrlSelect = (props: Props) => {         
    const SelectOptionRender = () => {
        let options = [];
        let propLabel = "label";
        let propValue = "value";
        if(props.options == null || props.options.length == 0) return<></>;        
        if(props.keyOptions)
        {            
            propLabel = props.keyOptions.label;
            propValue = props.keyOptions.value;                        
        }        
        for(let i = 0;i < props.options.length;i++)
        {
            options.push(<Select.Option key={i} label={props.options[i][propLabel]} value={props.options[i][propValue]} />)
        }
        return options;
    }     
    return (
        <Select key={props.key}
                disabled={props.disabled == true ? true : false}
                multiple={props.multiple}
                filterable={props.filterable}
                value={props.value} 
                style={{width:"100%"}}
                size={props.size ? props.size : 'small'}
                placeholder={props.placeholder} 
                onChange={(e) => {props.onChange(e)}}                
                clearable={props.clearable == false ? false : true}>
            {SelectOptionRender()}            
        </Select>
    )
}
const mapState = ({ ...state }) => ({
    
});
const mapDispatchToProps = {
    
};

export default connect(mapState, mapDispatchToProps)(CtrlSelect);