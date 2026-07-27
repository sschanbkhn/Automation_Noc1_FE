import axios from "axios";
import API_URL from "./apiConfig";


// Danh sách Bad Cell
export const getBadCellSummary = async (date = null) => {

    let url = `${API_URL}/bad-cell-7day/`;

    if (date) {
        url += `?date=${date}`;
    }

    const res = await axios.get(url);

    return res.data;
};


// Chi tiết một Cell
export const getBadCellDetail = async (cellname) => {

    const res = await axios.get(
        `${API_URL}/bad-cell-detail/`,
        {
            params: {
                cellname: cellname
            }
        }
    );

    return res.data;
};