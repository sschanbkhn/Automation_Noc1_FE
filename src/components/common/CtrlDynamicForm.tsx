import { IControlDefs, IControlOptions, IFormDefs } from 'models/Apps';
import { ControlType, Guid } from 'models/Enums';
import React, { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react'
import { connect } from "react-redux";
import CtrlCheckbox from './CtrlCheckbox';
import CtrlCkEditor from './CtrlCkEditor';
import CtrlDate from './CtrlDate';
import CtrlDynamicButton from './CtrlDynamicButton';
import CtrlInput from './CtrlInput';
import CtrlInputFile from './CtrlInputFile';
import CtrlInputNumber from './CtrlInputNumber';
import CtrlRadio from './CtrlRadio';
import CtrlSelect from './CtrlSelect';
import CtrlDateTime from './CtrlDateTime';
interface Props {    
    initValues:any,
    formDefs:any,    
    actionEvents?:any,
    alignLabel?:any
    options?:IControlOptions[],
    onchangeCtrl?:any
}

const CtrlDynamicForm = forwardRef((props: Props, ref) => {      
    const [InitValues, setInitValues] = useState<any>(props.initValues);    
    const [IsFirstSubmit, setIsFirstSubmit] = useState(false);    
    useEffect(() => {
        setInitValues(props.initValues)
    }, [props.initValues])
    const onChangeValue = (key: string, value: any) => {       
        setInitValues({
            ...InitValues,
            [key]: value
        })
        if(props.onchangeCtrl)
        {
            props.onchangeCtrl(key, value)
        } 
    }
    const handleKeyDown = (event:any) => {
        if(event.keyCode == 13)
        {
            let tagNameFocus = document.activeElement.tagName.toLowerCase();
            if(tagNameFocus !== 'button')
            {
                if(props.formDefs.ActionDefs)
                {
                    let actionSubmit = "";
                    for(let i = 0;i < props.formDefs.ActionDefs.length;i++)
                    {
                        if(props.formDefs.ActionDefs[i].Type == "Submit")
                        {
                            actionSubmit =props.formDefs.ActionDefs[i].Action;
                            break;
                        }
                    }
                    if(actionSubmit && props.actionEvents)
                    {
                        props.actionEvents[actionSubmit]();
                    }
                }
            } 
        }
    };
    
    React.useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
    
        // cleanup this component
        return () => {
          window.removeEventListener('keydown', handleKeyDown);
        };
    });
    useImperativeHandle(ref, () => ({
        onValidation: () => { return onValidation() },
        getStateValue: (key:any) => { return getStateValue(key) },
        setStateValue: (key:any, value:any) => { return setStateValue(key, value) },
        getStateValues: () => { return getStateValues(); }
    }));
    const onValidation = () => {     
        if(!IsFirstSubmit)
        {
            setIsFirstSubmit(true);
        }
        for(let i = 0;i < props.formDefs.Controls.length;i++)
        {
            let value = InitValues[props.formDefs.Controls[i].Key];            
            if(props.formDefs.Controls[i].IsRequired && IsValueNullOrEmpty(value))
            {                       
                return false;
            }
        }
        return true;
    }
    const getStateValues = () => {
        return InitValues;
    }
    const getStateValue = (key:any) => {
        return InitValues[key];
    }
    const setStateValue = (key:any, value:any) => {
        setInitValues({
            ...InitValues,
            [key]: value
        })
    }
    const InvalidControlRender = (Message: string) => {
        return <div className="invalid-control">{Message}</div>
    }
    const RequiredControl = (propDef:IControlDefs, value:any) => {        
        return  propDef.IsRequired == true && IsFirstSubmit == true && IsValueNullOrEmpty(value) ? 
                InvalidControlRender(propDef.Title + " bắt buộc."):<></>
    }
    const IsValueNullOrEmpty = (value:any) => {                
        if(value === null || value === "" || value === undefined || value.length === 0 || value === Guid.Empty)
        {
            return true;
        }        
        return false;
    }
    
    const TextAreaRender = (propDef:IControlDefs) => {
        let value = InitValues[propDef.Key];
        return <>
            <CtrlInput disabled={propDef.IsDisabled} key={propDef.Key} type={"textarea"} onChange={(e:any) => {onChangeValue(propDef.Key, e)}} value={value} />
            {RequiredControl(propDef, value)}
        </>
    }        
    const DateRender = (propDef:IControlDefs) => {
        let value = InitValues[propDef.Key];
        return <>
            <CtrlDate key={propDef.Key} onChange={(e:any) => {onChangeValue(propDef.Key, e)}} value={value} />
            {RequiredControl(propDef, value)}
        </>
    } 
    const DateTimeRender = (propDef:IControlDefs) => {
        let value = InitValues[propDef.Key];
        return <>
            <CtrlDateTime key={propDef.Key} onChange={(e:any) => {onChangeValue(propDef.Key, e)}} value={value} />
            {RequiredControl(propDef, value)}
        </>
    }    
    const RadioButtonRender = (propDef:IControlDefs) => {
        let value = InitValues[propDef.Key];
        let options:any = [];        
        let flag = true;
        if(props.options)
        {                   
            for(let i = 0;i < props.options.length;i++)
            {  
                if(props.options[i].Key === propDef.Key)
                {                    
                    options = props.options[i].Options;
                    flag = false;
                    break;
                }                
            }
        }
        if(flag)
        {            
            options = propDef.Options;
        }
        return <>
            <CtrlRadio key={propDef.Key} InlineBlock={propDef.InlineBlock} options={options} keyOptions={propDef.KeyOptions} onChange={(e:any) => {onChangeValue(propDef.Key, e)}} value={value} />
            {RequiredControl(propDef, value)}
        </>
    }    
    const CkEditorRender = (propDef:IControlDefs) => {
        let value = InitValues[propDef.Key];
        return <>
            <CtrlCkEditor disabled={propDef.IsDisabled} key={propDef.Key} type={propDef.IsPassword == true?"password":"text"} onChange={(e:any) => {onChangeValue(propDef.Key, e)}} value={value} />
            {RequiredControl(propDef, value)}
        </>
    }
    const InputTextRender = (propDef:IControlDefs) => {
        let value = InitValues[propDef.Key];
        return <>
            <CtrlInput disabled={propDef.IsDisabled} key={propDef.Key} type={propDef.IsPassword == true?"password":"text"} onChange={(e:any) => {onChangeValue(propDef.Key, e)}} value={value} />
            {RequiredControl(propDef, value)}
        </>
    }
    const InputNumberRender = (propDef:IControlDefs) => {
        let value = InitValues[propDef.Key];
        return <>
            <CtrlInputNumber key={propDef.Key} disabled={propDef.IsDisabled} type={"number"} onChange={(e:any) => {onChangeValue(propDef.Key, e)}} value={value} />
            {RequiredControl(propDef, value)}
        </>
    }   
    const SelectRender = (propDef:IControlDefs) => {    
        let value = InitValues[propDef.Key];        
        let options:any = [];        
        let flag = true;
        if(props.options)
        {                   
            for(let i = 0;i < props.options.length;i++)
            {  
                if(props.options[i].Key === propDef.Key)
                {                    
                    options = props.options[i].Options;
                    flag = false;
                    break;
                }                
            }
        }
        if(flag)
        {            
            options = propDef.Options;
        }
        return <>
            <CtrlSelect disabled={propDef.IsDisabled} key={propDef.Key} multiple={propDef.Multiple} filterable={propDef.Filterable} onChange={(e:any) => {onChangeValue(propDef.Key, e)}} value={value} options={options} keyOptions={propDef.KeyOptions} placeholder={propDef.Placeholder} />
            {RequiredControl(propDef, value)}
        </>
    }    
    const CheckboxRender = (propDef:IControlDefs) => {
        let value = InitValues[propDef.Key];        
        return <>
            <CtrlCheckbox key={propDef.Key} onChange={(e:any) => {onChangeValue(propDef.Key, e)}} value={value} label={propDef.CheckboxLabel} />
            {RequiredControl(propDef, value)}
        </>
    }      
    const UploadFileRender = (propDef:IControlDefs) => {
        let value = InitValues[propDef.Key];                   
        return <>
            <CtrlInputFile disabled={propDef.IsDisabled} key={propDef.Key} onChange={(e:any) => {onChangeValue(propDef.Key, e)}} id={propDef.Key} multiple={propDef.Multiple} value={value} />
            {RequiredControl(propDef, value)}
        </>
    }
    const ControlRender = (propDef:IControlDefs) => {        
        switch(propDef.Type)
        {
            case ControlType.Date:
                return DateRender(propDef);
            case ControlType.DateTime:
                return DateTimeRender(propDef);                 
            case ControlType.RadioButton:
                return RadioButtonRender(propDef);                            
            case ControlType.InputText:
                return InputTextRender(propDef);
            case ControlType.TextArea:
                return TextAreaRender(propDef);                
            case ControlType.InputNumber:
                return InputNumberRender(propDef);                
            case ControlType.Select:
                return SelectRender(propDef);    
            case ControlType.Checkbox:
                return CheckboxRender(propDef);   
            case ControlType.UploadFile:
                return UploadFileRender(propDef);                                                
            case ControlType.CkEditor:
                return CkEditorRender(propDef);                                                
            default:
                return <></>;
        }
    }
    const ColsRender = (propDefs:IControlDefs[]) => {
        let colsHtml = [];
        for(let i = 0;i < propDefs.length;i++)
        {
            colsHtml.push(
                <div key={"label-" + i} className={"col-sm-" + propDefs[i].ColLabel + " align-" + (props.alignLabel?props.alignLabel:"right")}>
                    <b>{propDefs[i].Title}</b>
                    {propDefs[i].IsRequired == true ? <span className='is-required'>*</span>:<></>}
                </div>
            )
            colsHtml.push(
                <div key={"control" + i} className={"col-sm-" + propDefs[i].ColControl}>
                    {ControlRender(propDefs[i])}
                </div>
            )
        }
        return colsHtml
    }
    const RowsRender = () => {        
        let rowsHtml = [];
        for(let i = 0;i < props.formDefs.Rows;i++)
        {
            let cols = props.formDefs.Controls.filter((e:any) => {return e.Row == (i + 1)});
            rowsHtml.push(<div key={i} className="row">{ColsRender(cols)}</div>)            
        }
        return rowsHtml;
    }    
    let ButtonGroupsRender = () => {        
        if(!props.actionEvents) return <></>
        return <CtrlDynamicButton actionDefs={props.formDefs.ActionDefs} actions={props.actionEvents} />;
    }
    return (
        <div className='dynamicForm'>
            {RowsRender()}
            <hr/>
            <div className='row'>
                <div className='col-sm-12'>
                    <div className='buttonGroups'>
                        {ButtonGroupsRender()}
                    </div>
                </div>
            </div>
        </div>
    )
})
const mapState = ({ ...state }) => ({
    
});
const mapDispatchToProps = {
    
};

export default connect(mapState, mapDispatchToProps, null, { forwardRef: true })(CtrlDynamicForm);