import React from 'react';
import {
    ButtonToolbar,
    Dropdown,
    DropdownButton
} from 'react-bootstrap';


const UserDropdownButton = () => {

    const buttonOptions = [
        { variant: 'primary', icon: 'feather icon-thumbs-up mx-1' },
        // { variant: 'secondary', icon: 'feather icon-camera mx-1' },
        // { variant: 'success', icon: 'feather icon-check-circle mx-1' },
        // { variant: 'danger', icon: 'feather icon-slash mx-1' },
        // { variant: 'warning', icon: 'feather icon-alert-triangle mx-1' },
        // { variant: 'info', icon: 'feather icon-info mx-1' }
    ];

    const basicDropdownButton = buttonOptions.map((button) => {
        const title = "switch table";
        return (
            <DropdownButton
                className="text-capitalize "
                title={title}
                variant={button.variant}
                id={`dropdown-variants-${button.variant}`}
                key={button.variant}
                size="sm px-0 py-0 mx-0 mt-1-custom"
            >
                <Dropdown.Item eventKey="1" className="st-11">Users</Dropdown.Item>
                <Dropdown.Item eventKey="2" className="st-11">Groups</Dropdown.Item>
                <Dropdown.Item eventKey="3" className="st-11">Departments</Dropdown.Item>
            </DropdownButton>
        );
    });

    return (
        <ButtonToolbar>{basicDropdownButton}</ButtonToolbar>
    );
};

export default UserDropdownButton;
