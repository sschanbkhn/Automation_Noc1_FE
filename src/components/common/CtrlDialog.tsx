import { Button, Dialog, Input, Tooltip } from 'element-react';
import React, { useEffect, useState } from 'react'
import { connect } from "react-redux";
interface Props {
    title: string,
    dialogVisible: boolean
    onCancel: any,
    children?: React.ReactNode,    
    size?: 'tiny'|'small'|'large'|'full',
    style?:any
}

const CtrlDialog = (props: Props) => {  
    return <Dialog
                style={props.style?props.style:''}
                title={props.title}
                size={props.size?props.size:'tiny'}
                visible={ props.dialogVisible }
                onCancel={ () => props.onCancel() }
                lockScroll={ false }>
                <Dialog.Body>{props.children}</Dialog.Body>
            </Dialog>
}
const mapState = ({ ...state }) => ({
    
});
const mapDispatchToProps = {
    
};

export default connect(mapState, mapDispatchToProps)(CtrlDialog);