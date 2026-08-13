import React from "react";
import { Table, Tag, Button } from "antd";
import "./BadCellTable.css";

const BadCellTable = ({ data, onSelect }) => {
    const columns = [
        {
            title: "TÊN CELL",
            dataIndex: "cellname",
            key: "cellname",
            render: (text) => (
                <span
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        color: "#1677ff",
                        fontWeight: 600,
                    }}
                >
                    <span
                        style={{
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            background: "#52c41a",
                            display: "inline-block",
                        }}
                    />
                    {text}
                </span>
            ),
            },
             {
            title: "CEI TRUNG BÌNH (TRƯỚC)",
            dataIndex: "avg_before_7d",
            key: "avg_before_7d",
            width: 140,
            align: "center",
            render: (value) => value,
        },
        {
            title: "CEI TRUNG BÌNH (SAU)",
            dataIndex: "avg_after_7d",
            key: "avg_after_7d",
            width: 140,
            align: "center",
            render: (value) => value,
        },
        {
            title: "GIÁ TRỊ SAI LỆCH",
            dataIndex: "diff_avg",
            key: "diff_avg",
            width: 140,
            align: "center",
            render: (value) => (
                <Tag
                    style={{
                        backgroundColor: "#ff4d4f",
                        borderColor: "#ff4d4f",
                        color: "#fff",
                    }}
                >
                    {value}
                </Tag>
            ),
        },
        {
            title: "MÃ TRẠM TẮT",
            dataIndex: "cell_shutdown",
            key: "cell_shutdown",
            width: 180,
            align: "center",
            render: (value) => value,
        },
        {
            title: "ACTION",
            key: "action",
            width: 120,
            align: "center",
            render: (_, record) => (
                <Button
                    type="primary"
                    size="small"
                    onClick={() => onSelect(record.cellname)}
                >
                    Chi tiết
                </Button>
            ),
        },
    ];

    return (
        <Table
            className="badcell-table"
            rowKey="cellname"
            columns={columns}
            dataSource={data}
            bordered
            size="middle"
            pagination={{
                pageSize: 10,
                hideOnSinglePage: true,
            }}
        />
    );
};

export default BadCellTable;