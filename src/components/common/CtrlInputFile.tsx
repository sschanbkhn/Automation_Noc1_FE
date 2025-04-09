import { Button, Input, Upload } from 'element-react';
import React, { useEffect, useState } from 'react'
import { connect } from "react-redux";
import CtrlButton from './CtrlButton';
interface Props {
    key?: any,
    id: any,
    multiple:any,
    value:any,
    onChange: any,
    disabled: any
}
export interface IInputFile {
    Id: any,
    Name: any,
    Url: any    
}
const { v4: uuidv4 } = require('uuid');
const CtrlInputFile = (props: Props) => {      
    const [fileList, setFileList] = useState<any>([]);
    useEffect(() => {             
        setFileList(props.value)
    }, [])
    useEffect(() => {             
        setFileList(props.value)
    }, [props.value])        
    const SelectFile = () => {
        let e:any = document.getElementById(props.id + "");
        e.click();
    }
    const RemoveFile = (id:any) => {
        let files:any = [...fileList];
        for(let i = 0;i < fileList.length;i++)
        {
            if(fileList[i].Id == id)
            {
                files.splice(i, 1);
                break;
            }            
        }
        props.onChange(files);
        setFileList(files);
    }
    const PreviewFile = (url:any) => {               
        window.open(process.env.ROOT_URL + url);
    }
    const FileListRender = () => {
        let btnHtml:any = []
        if(fileList)
        {                               
            for(let i = 0;i < fileList.length;i++)
            {
                btnHtml.push(
                    <div key={i} data-id={fileList[i].Id} className="alert file-list border-primary fade show" >
                        <a href="#" onClick={() => { PreviewFile(fileList[i].Url); }}>{fileList[i].Name}</a>
                        <button type="button" className="btn-close" onClick={() => {RemoveFile(fileList[i].Id)}}></button>
                    </div>
                )
            }
        }
        return btnHtml;
    }
    const onChange = (e:any) => {                     
        var splitPath = e.target.value.split("\\");        
        let file:IInputFile = {Id: uuidv4(), Name: splitPath[splitPath.length - 1], Url: e.target.files[0]};                
        let files:any = [];
        if(props.multiple && fileList)
        {            
            files = [...fileList];            
        }        
        files.push(file)
        props.onChange(files);
        setFileList(files);     
    }
    return (
        <>
            <input type="file" id={props.id} style={{display:"none"}} onChange={(e:any) => {onChange(e)}} />
            {props.disabled == true ? <></>:<CtrlButton title="Tải file lên" onClick={() => {SelectFile()}}></CtrlButton>}
            {FileListRender()}
        </>
    )
}
const mapState = ({ ...state }) => ({
    
});
const mapDispatchToProps = {
    
};

export default connect(mapState, mapDispatchToProps)(CtrlInputFile);