import React, { useEffect, useState, useCallback } from "react";
import {
    Row,
    Col,
    Card,
    Input,
    DatePicker,
    Spin,
    message,
    Typography,
    Space,
    Button,
    Tooltip,
} from "antd";
import {
    SearchOutlined,
    DashboardOutlined,
    ReloadOutlined,
} from "@ant-design/icons";

// Dung dayjs thay moment - du an da bo moment (khong co trong package.json/node_modules),
// antd v5 DatePicker cung chi nhan dayjs cho prop value/onChange nen bat buoc doi, khong phai tuy chon
import dayjs, { Dayjs } from "dayjs";
// index.css khong duoc copy sang - la CSS global chung chung copy nham tu module S005-USSD, khong dung o day
import BadCellTable from "./BadCellTable";
import BadCellDetail from "./BadCellDetail";
import { getBadCellSummary } from "./badCellApi";
import { CloseOutlined } from "@ant-design/icons";
// Dong bo mau accent voi cac tab con lai cua R012 - dung token co san thay vi hex rieng cua module goc
import { R012_COLORS } from "../theme";


const { Title } = Typography;

interface BadCell {
    cellname: string;
    bad_days?: number;
    [key: string]: any;
}

const BadCellDashboard: React.FC = () => {

    const [loading, setLoading] = useState(false);
    const [badCells, setBadCells] = useState<BadCell[]>([]);
    const [selectedCell, setSelectedCell] = useState<string | null>(null);
    const [shutdownCell, setShutdownCell] = useState("");
    const [keyword, setKeyword] = useState("");
    const [selectedDate, setSelectedDate] =
        useState<Dayjs | null>(dayjs());
    const loadData = useCallback(async (dateStr: string | null = null) => {
        try {
            setLoading(true);
            const res = await getBadCellSummary(dateStr);
            console.log("API DATA:", res);
            const data = res?.data || [];
            setBadCells(data);
            // Không tự động hiển thị chi tiết
            setSelectedCell(null);
        } catch (err) {
            console.log(err);
            message.error("Không lấy được dữ liệu");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData(dayjs().format("YYYYMMDD"));
    }, [loadData]);
    const handleDateChange = (date: Dayjs | null) => {
        setSelectedDate(date);
        if (!date) {
            loadData(null);
            return;
        }
        loadData(date.format("YYYYMMDD"));
    };
    const filteredCells = badCells.filter((item) =>
        item.cellname
            ?.toLowerCase()
            .includes(keyword.toLowerCase())
    );
    return (
<div
    style={{
        padding: 24,
        background: "#f5f7fa",
        minHeight: "100vh",
    }}
>
    {/* ===== HEADER ===== */}
    <Card
        style={{
            marginBottom: 20,
            borderRadius: 12,
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        }}
        bodyStyle={{
            padding: "18px 24px",
        }}
    >
        <Row
            justify="space-between"
            align="middle"
        >

            <Col>
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                    }}
                >

                    <DashboardOutlined
                        style={{
                            fontSize: 36,
                            color: R012_COLORS.primary,
                        }}
                    />
                    <Title
                        level={2}
                        style={{
                            margin: 0,
                            color: R012_COLORS.primary,
                            fontWeight: 700,
                            lineHeight: 1,
                        }}
                    >
                        GIÁM SÁT BADCELL CỦA TRẠM TẮT/ HUỶ
                    </Title>
                </div>
            </Col>
                <Col
                style={{
                    display: "flex",
                    justifyContent: "flex-end",
                }}
            >
                <Tooltip title="Làm mới">
                    <Button
                        icon={<ReloadOutlined />}
                        loading={loading}
                        onClick={() =>
                            loadData(
                                selectedDate
                                    ? selectedDate.format("YYYYMMDD")
                                    : null
                            )
                        }
                    >
                        Làm mới
                    </Button>
                </Tooltip>
            </Col>

        </Row>

    </Card>



    {/* ===== CONTENT ===== */}
    <Row
        gutter={16}
        align="stretch"
    >

        <Col span={10}>
            <Card
                title={
                    <span
                        style={{
                            fontSize: 18,
                            fontWeight: 700,
                            color: R012_COLORS.primary,
                        }}
                    >
                        DANH SÁCH BADCELL
                    </span>
                }
                style={{
                    height: "100%",
                    borderRadius: 12,
                }}
            >
                <Space
                    direction="vertical"
                    style={{
                        width: "100%",
                    }}
                >
                    <Input
                        placeholder="Tìm Cell..."
                        value={keyword}
                        onChange={(e) =>
                            setKeyword(e.target.value)
                        }
                        prefix={<SearchOutlined />}
                    />
                    <DatePicker
                        style={{
                            width: "100%",
                        }}
                        value={selectedDate}
                        format="DD/MM/YYYY"
                        onChange={handleDateChange}
                        allowClear
                    />
                </Space>
                <div
                    style={{
                        marginTop: 15,
                    }}
                >
                    <Spin spinning={loading}>

                        <BadCellTable
                            data={filteredCells}
                            onSelect={setSelectedCell}
                        />
                    </Spin>
                </div>
            </Card>
        </Col>
        <Col span={14}>
            {selectedCell ? (
                <Card
                    title={
                        <Row justify="space-between" align="middle" wrap={false}>
                            <Col flex="auto">
                                <span
                                    style={{
                                        fontSize: 18,
                                        fontWeight: 700,
                                        color: R012_COLORS.primary,
                                        whiteSpace: "nowrap",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                    }}
                                >
                                    THÔNG TIN CHI TIẾT: {selectedCell}
                                </span>
                            </Col>

                            <Col flex="none">
                                <Button
                                    icon={<CloseOutlined />}
                                    danger
                                    size="small"
                                    onClick={() => setSelectedCell(null)}
                                >
                                    Đóng
                                </Button>
                            </Col>
                        </Row>
                    }
                    style={{
                        height: "100%",
                        borderRadius: 12,
                    }}
                >
                    <BadCellDetail cellname={selectedCell} />
                </Card>
            ) : (
                <Card
                    title="Chi tiết Bad Cell"
                    style={{
                        height: "100%",
                        borderRadius: 12,
                    }}
                >
                    <div
                        style={{
                            height: 350,
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            color: "#999",
                            fontSize: 16,
                        }}
                    >
                        Chọn một Cell và nhấn nút 
                        <b>&nbsp;Chi tiết&nbsp;</b>
                    </div>
                </Card>
            )}
        </Col>
    </Row>
</div>

    );
};
export default BadCellDashboard;