import { Tree } from 'element-react';
import { Guid } from 'models/Enums';
import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { connect } from "react-redux";
interface Props {
    data: any,
    options?: any,
    onNodeClicked?: Function,
    nodeKey?:any,
    defaultExpandedKeys?:any,
    isShowCheckbox?:any,
    getCheckedKeys?:any,
    defaultCheckedKeys?:any,
    defaultExpandAll?:any
}

const CtrlTree = forwardRef((props: Props, ref) => {      
    const refTree = useRef<any>();
    const getCheckedKeys = (leafOnly:any) => {
        return refTree.current.getCheckedKeys(leafOnly);
    }
    useImperativeHandle(ref, () => ({
        getCheckedKeys: (leafOnly:any) => { return getCheckedKeys(leafOnly) },
    }));
    return (
        <Tree      
            ref={refTree}
            isShowCheckbox={props.isShowCheckbox == true?true:false}
            defaultExpandAll={props.defaultExpandAll==true?true:false}
            data={props.data}
            options={props.options}        
            highlightCurrent={true}   
            onNodeClicked={(data, node) => {
                if(props.onNodeClicked) {
                    props.onNodeClicked(data, node)
                }            
            }}    
            nodeKey={props.nodeKey}            
            defaultCheckedKeys={props.defaultCheckedKeys}
            defaultExpandedKeys={[Guid.Empty]}/>
    )
})
const mapState = ({ ...state }) => ({
    
});
const mapDispatchToProps = {
    
};

export default connect(mapState, mapDispatchToProps, null, { forwardRef: true })(CtrlTree);