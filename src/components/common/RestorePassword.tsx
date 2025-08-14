import React, { useEffect, useRef, useState } from 'react'
import { Actions } from 'store/app/Action';
import { connect } from "react-redux";
import { useSearchParams } from "react-router-dom";
import CtrlButton from './CtrlButton';
import CtrlInput from './CtrlInput';
import CtrlNotification from './CtrlNotification';
import { IResponseMessage } from 'models/Apps';
import { Message } from 'models/Enums';

interface Props {
    ChangePasswordNew?: Function,
}

const RestorePassword = (props: Props) => {  
    const [searchParams] = useSearchParams();
    const code = searchParams.get('code'); 
    const refNotification = useRef<any>();
    const [Password_RestorePassword, setPassword_RestorePassword] = useState(""); 
    const OkRestorePassword = async () => {        
        var inputRequest = { Code: code, PasswordNew: Password_RestorePassword }
        props.ChangePasswordNew(inputRequest);
        refNotification.current.showNotification("success", Message.Response_Success);
    }
    return(
        <>
            <CtrlNotification ref={refNotification} />   
            <section className="section register min-vh-100 d-flex flex-column align-items-center justify-content-center py-4">
                <div className="container">
                    <div className="row justify-content-center">
                    <div className="col-lg-4 col-md-6 d-flex flex-column align-items-center justify-content-center">
                        <div className="card mb-3">
                        <div className="card-body">
                            <div className="pt-4 pb-2">
                            <h5 className="card-signup-title text-center pb-0 fs-4">
                                <span className="title-underline">Thay đổi mật khẩu </span> 
                                <span> mới</span>
                            </h5>                    
                            </div>
                            <div className="row g-3 needs-validation form-register">
                            <div className="col-12">                      
                                <CtrlInput key="password" placeholder='Mật khẩu mới' type='password' value={Password_RestorePassword} onChange={(e:any) => {setPassword_RestorePassword(e)}} /> 
                            </div>                                        
                            <div className="col-12">                                
                                <CtrlButton title='Đồng ý' onClick={OkRestorePassword} isFullWidth={true} />
                            </div>
                            </div>
                        </div>
                        </div>
                    </div>
                    </div>
                </div>
            </section>
        </>
    )
}
const mapState = ({ ...state }) => ({
    
});
const mapDispatchToProps = {
    ChangePasswordNew: Actions.ChangePasswordNew,
};

export default connect(mapState, mapDispatchToProps)(RestorePassword);