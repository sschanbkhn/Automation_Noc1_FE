import { Button, Input } from 'element-react';
import React, { useEffect, useState } from 'react'
import { connect } from "react-redux";
import CtrlButton from './CtrlButton';
import { IActionDefs } from 'models/Apps';
interface Props {
    actionDefs: any,
    actions: any
}

const CtrlDynamicButton = (props: Props) => {  
    const ButtonsRender = () => {
        let ActionDefs:IActionDefs[] = props.actionDefs;
        let Actions = props.actions;        
        let html = []
        const onAction = (action:string) => {            
            Actions[action]();
        }
        for(let i = 0;i < ActionDefs.length;i++)
        {
            html.push(<CtrlButton title={ActionDefs[i].Title} titleTooltip={ActionDefs[i].TitleTooltip} key={ActionDefs[i].Key} icon={ActionDefs[i].Icon} onClick={() => { onAction(ActionDefs[i].Action) }} />);
        }
        return html;
    }
    return (
        <>
            {ButtonsRender()}
        </>
    )
}
const mapState = ({ ...state }) => ({
    
});
const mapDispatchToProps = {
    
};

export default connect(mapState, mapDispatchToProps)(CtrlDynamicButton);