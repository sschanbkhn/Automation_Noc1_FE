import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'
import 'datatables.net-select/js/dataTables.select'
import "datatables.net-dt/js/dataTables.dataTables"
import "datatables.net-dt/css/jquery.dataTables.min.css"
import $ from 'jquery'; 
import { connect } from "react-redux";
import { IColumnDefs } from 'models/Apps';
interface Props {
    id: any,
    columnDefs: any,
    dataItems: any,
    onRowClick?: any
    totalItems?: any
}

const CtrlDynamicTable = forwardRef((props: Props, ref) => {      
    useEffect(() => {        
        let classNameDataTable = document.getElementById(props.id) ? document.getElementById(props.id).className:"";               
        if(classNameDataTable == "dataTableCustom")
        {
            initDataTable();
        }           
        else
        {
            reInitDataTable();
        }        
    }, [props.dataItems])    
    useImperativeHandle(ref, () => ({
        getRowId: () => { return getRowId() },
        getRowSelected: () => { return getRowSelected() }
    }));
    const option_orders = () => {
        let columnDefs:IColumnDefs[] = props.columnDefs;
        let orders = [];
        for(let i = 0;i < columnDefs.length;i++)
        {
            if(columnDefs[i].hasOwnProperty("OrderBy"))
            {
                let order = [i, columnDefs[i].OrderBy];
                orders.push(order);
            }
        }
        return orders;
    }
    const options_columnDefs = () => {
        let columnDefs:IColumnDefs[] = props.columnDefs;
        let optionsColumnDefs:any = [];
        for(let i = 0;i < columnDefs.length;i++)
        {
            let obj:any = { target: i };
            let flag = false;
            if(columnDefs[i].hasOwnProperty("Hidden"))
            {
                obj.visible = !columnDefs[i].Hidden;
                flag = true;
            }
            if(columnDefs[i].hasOwnProperty("Width"))
            {                
                obj.width = columnDefs[i].Width;
                flag = true;
            }
            if(flag)
            {                
                optionsColumnDefs.push(obj);
            }
        }
        return optionsColumnDefs;
    }
    const options_group_index = () => {
        let columnDefs:IColumnDefs[] = props.columnDefs;
        for(let i = 0;i < columnDefs.length;i++)
        {
            if(columnDefs[i].hasOwnProperty("Group"))
            {
                if(columnDefs[i].Group)
                {
                    return [i, columnDefs[i].Title];
                }
            }
        }
        return [-1, ""];
    }
    const options = () => {
        let group_index:any = options_group_index();
        let options:any = {        
            select: {
                style: 'single',
            },           
            order: option_orders(),     
            responsive: true,
            lengthMenu: [10, 25, 50, 100, 200, 500],
            pagingType: 'full_numbers',
            language: {
                decimal:        "",
                emptyTable:     "Không có dữ liệu trong bảng",
                info:           "Hiển thị từ _START_ đến _END_ của _TOTAL_ bản ghi",
                infoEmpty:      "Hiển thị từ 0 đến 0 của 0 bản ghi",
                infoFiltered:   "(Đã lọc từ tổng _MAX_ bản ghi)",
                infoPostFix:    "",
                thousands:      ",",
                lengthMenu:     "Hiển thị _MENU_ bản ghi",                
                processing:     "",
                search:         "Tìm kiếm:",
                zeroRecords:    "Không tìm thấy kết quả",
                paginate: {
                    first:      "<span class=\"bi bi-chevron-double-left\"></span>",
                    last:       "<span class=\"bi bi-chevron-double-right\"></span>",
                    next:       "<span class=\"bi bi-chevron-right\"></span>",
                    previous:   "<span class=\"bi bi-chevron-left\"></span>"
                },
                select: {
                    rows: "Đã chọn %d bản ghi"
                },
                aria: {
                    sortAscending:  ": Kích hoạt để sắp xếp cột tăng dần",
                    sortDescending: ": Kích hoạt để sắp xếp cột giảm dần"
                }
            },
            columnDefs: options_columnDefs(),
            drawCallback: function (settings:any) {
                if(group_index[0] !== -1)
                {
                    var api = this.api();      
                    var rows = api.rows({ page: 'current' }).nodes();  
                    var group_last:any = null;          
                    api.rows( {page:'current'} ).data().each(function (row:any, rowindex:any) {  
                        let group = row[group_index[0]];
                        if (group_last !== group) {                            
                            $(rows).eq(rowindex).before('<tr class="group"><td colspan="'+ row.length +'"><b>' + group_index[1] + ': ' + group + '</b></td></tr>');
                            group_last = group;
                        }                        
                    });
                }
            }
        }
        return options;
    }
    const initDataTable = () => {               
        let $dt: JQuery &  {DataTable?: any} = $('#' + props.id); 
        let bodyStr:any = TBodyContentRender();        
        $('#' + props.id + ' tbody').html(bodyStr)      
        $dt.DataTable(options());
    }
    const reInitDataTable = () => {        
        let $dt: JQuery &  {DataTable?: any} = $('#' + props.id);              
        $dt.DataTable().clear().destroy();
        let bodyStr:any = TBodyContentRender();        
        $('#' + props.id + ' tbody').html(bodyStr) 
        $dt.DataTable(options());
    }
    const getRowId = () => {        
        let rowId = null;                
        for(let i = 0;i < $("#" + props.id + " .selected").length;i++)
        {            
            rowId = $("#" + props.id + " .selected").get(i).getAttribute("row-id");                        
        }        
        return rowId;
    }
    const getRowSelected = () => {        
        let $dt: JQuery &  {DataTable?: any} = $('#' + props.id);              
        return $dt.DataTable().rows('.selected').data();
    }
    const THeadContentRender = () => {
        let tHs = [], columnDefs:IColumnDefs[] = props.columnDefs;
        if (!Array.isArray(columnDefs) || columnDefs.length === 0) {
            return <tr><th className={'text-center'}>Không có cột dữ liệu</th></tr>;
        }
        for(let i = 0;i < columnDefs.length;i++)
        {            
            tHs.push(<th style={{ width: "300px" }} className={'text-center'} key={i}>{columnDefs[i].Title}</th>);
        }                
        return <tr>{tHs}</tr>;
    }
    const MappingValueToOptions = (value:any, options:any) => {
        let refValue = "";
        for(let i = 0;i < options.length;i++)
        {
            if(options[i].value == value)
            {
                refValue = options[i].label;
            }
        }
        return refValue;
    }
    const OnRowClick = () => {    
        let id = getRowId();
        if(props.onRowClick)
        {
            props.onRowClick(id);
        }        
    }
    const TBodyContentRender = () => {        
        let columnDefs:IColumnDefs[] = props.columnDefs, dataItems = props.dataItems;        
        let tRsStr = '', tDsStr = '';      
        if(dataItems == null) return null;        
        for(let i = 0;i < dataItems.length;i++)
        {            
            tDsStr = '';
            for(let j = 0;j < columnDefs.length;j++)
            {           
                let value = dataItems[i][columnDefs[j].Key];  
                if(columnDefs[j].Options)
                {
                    value = MappingValueToOptions(value, columnDefs[j].Options);
                }
                if(columnDefs[j].Format)
                {
                    if(columnDefs[j].Format == "dd/MM/yyyy")
                    {
                        let valueDate = "";
                        try
                        {
                            let date = new Date(value);
                            valueDate = date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear(); 
                        }
                        catch {}
                        value = valueDate;
                    }
                    else if(columnDefs[j].Format == "dd/MM/yyyy HH:mm")
                    {
                        let valueDateTime = "";
                        try
                        {
                            let date = new Date(value);
                            let day = date.getDate().toString().padStart(2, '0');
                            let month = (date.getMonth() + 1).toString().padStart(2, '0');
                            let year = date.getFullYear();
                            let hours = date.getHours().toString().padStart(2, '0');
                            let minutes = date.getMinutes().toString().padStart(2, '0');
                            valueDateTime = `${day}/${month}/${year} ${hours}:${minutes}`;
                        }
                        catch {}
                        value = valueDateTime;
                    }
                }
                if(columnDefs[j].Key == "#")
                {
                    tDsStr += '<td class=' + (columnDefs[j].Align ? ('text-' + columnDefs[j].Align) : 'text-center') + '>' + 
                        (i + 1)
                    + '</td>';
                }
                else if(columnDefs[j].Key == "Checkbox")
                {
                    tDsStr += '<td class=' + (columnDefs[j].Align ? ('text-' + columnDefs[j].Align) : 'text-center') + '>' + 
                        (i + 1)
                    + '</td>';
                }
                else
                {
                    tDsStr += '<td class=' + (columnDefs[j].Align ? ('text-' + columnDefs[j].Align) : 'text-center') + '>' + 
                        (typeof value !== 'undefined' ? value:'')
                    + '</td>';
                }
            }            
            tRsStr += '<tr row-id=' + (dataItems[i].Id + '') +'>'+ tDsStr +'</tr>';
        }        
        return tRsStr;
    }
    return (
        <>
            <table id={props.id} className="dataTableCustom" style={{"width":"100%"}}>
                <thead>
                    {THeadContentRender()}
                </thead>          
                <tbody onClick={() => {OnRowClick()}}>                                
                </tbody>
                {
                    props.totalItems ?
                    <span style={{position: "absolute", marginTop: 12, marginLeft: 600}}>Tổng số bản ghi: {props.totalItems}</span>:
                    <></>
                }              
            </table>
        </>
    )
})
const mapState = ({ ...state }) => ({
    
});
const mapDispatchToProps = {
    
};

export default connect(mapState, mapDispatchToProps, null, { forwardRef: true })(CtrlDynamicTable);