import { Button, Dropdown, Input, Tooltip } from 'element-react';
import React, { useEffect, useState } from 'react'
import { connect } from "react-redux";
interface Props {
    title?: string,
    buttonItems?: any,
    size?: any,

}

const CtrlDropButton = (props: Props) => {  
    const HandleCommand = (command:any) => {
        if(props.buttonItems)
        {
            for(let i = 0;i < props.buttonItems.length;i++)
            {
                if(props.buttonItems[i].key == command)
                {
                    props.buttonItems[i].onClick();
                    break;
                }
            }
        }
    }
    const ButtonItemsRender = () => {
        let html = [];
        if(props.buttonItems)
        {
            for(let i = 0;i < props.buttonItems.length;i++)
            {
                html.push(<Dropdown.Item command={props.buttonItems[i].key}>{props.buttonItems[i].title}</Dropdown.Item>);
            }
        }
        return html;
    }
    const DropButtonRender = () => {
        return  (
            <Dropdown onCommand={HandleCommand} menu={(
                    <Dropdown.Menu>{ButtonItemsRender()}</Dropdown.Menu>
                )}>
                <Button type="primary" size={props.size ? props.size : 'small'} >{props.title}<i className="el-icon-caret-bottom el-icon--right"></i>
                </Button>
            </Dropdown>
        )
    }

    return <>{DropButtonRender()}</>
}
const mapState = ({ ...state }) => ({
    
});
const mapDispatchToProps = {
    
};

export default connect(mapState, mapDispatchToProps)(CtrlDropButton);