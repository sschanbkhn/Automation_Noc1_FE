import { Button, Input } from 'element-react';
import React from 'react'
import { connect } from "react-redux";

interface Props {
    title?: string,
    children?: React.ReactNode,
    buttonGroups?: React.ReactNode,
    className?: string,
    icon?: string
}

const Card = (props: Props) => {
    const { title, children, buttonGroups, className, icon } = props;
    return (
        <div className={`card ${className ? className : ''}`.trim()}>
            {title && (
                <div className="card-header">
                    {icon ? <i className={`${icon} me-2`}></i> : null}
                    {title}
                    <div className="button-groups">
                        {buttonGroups ? buttonGroups : <></>}
                    </div>
                </div>
            )}
            <div className="card-body">
                {children}
            </div>
        </div>
    )
}
const mapState = ({ ...state }) => ({

});
const mapDispatchToProps = {

};

export default connect(mapState, mapDispatchToProps)(Card);
