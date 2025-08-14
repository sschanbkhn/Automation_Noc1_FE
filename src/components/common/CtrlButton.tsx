import { Button, Input, Tooltip } from 'element-react';
import React, { useEffect, useState } from 'react'
import { connect } from "react-redux";
interface Props {
    title?: string,
    titleTooltip?: string,
    onClick?: any,
    size?: any,
    type?: any,
    icon?: any,
    isFullWidth?: boolean,
    isDisabled?: boolean,
    className?: any,
    style?: any
}

const CtrlButton = (props: Props) => {  
    const [delayClick, setDelayClick] = useState(false);
    const ButtonRender = () => {
        return  <Button               
                    disabled={(props.isDisabled == true ? true : false)}       
                    style={props.style ? props.style : ""}          
                    size={props.size ? props.size : 'small'} 
                    className= {(props.isFullWidth == true ? "w-100":"") + " " + props.className + " "} 
                    type={props.type ? props.type : 'primary'}
                    icon={props.icon ? props.icon: ''}
                    loading={delayClick}
                    onClick={() => { 
                        props.onClick(); 
                        setDelayClick(true);
                        setTimeout(
                            () => { setDelayClick(false); }, 
                            500
                        );
                    }}>{" " + props.title}</Button>   
    }
    const WrapperButtonRender = (titleTooltip: string) => {
        if(titleTooltip)
        {
            return <Tooltip className="item" effect="dark" content={props.titleTooltip} placement="top">{ButtonRender()}</Tooltip>   
        }
        return <>{ButtonRender()}</>;
    }
    return <>{WrapperButtonRender(props.titleTooltip)}</>
}
const mapState = ({ ...state }) => ({
    
});
const mapDispatchToProps = {
    
};

export default connect(mapState, mapDispatchToProps)(CtrlButton);