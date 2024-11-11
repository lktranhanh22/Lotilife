import axios from "axios";

// Cấu hình axios
const affApi = axios.create({
    baseURL:
        window.RV_CONFIGS?.ajax_url ||
        "https://lotilife.com/wp-admin/admin-ajax.php", // URL mặc định
    headers: {
        "Content-Type": "application/x-www-form-urlencoded",
    },
    withCredentials: true,
});
// Hàm chuyển đổi JSON thành FormData
function jsonToFormData(json) {
    const formData = new FormData();
    for (const key in json) {
        if (Array.isArray(json[key])) {
            json[key].forEach((value, index) => {
                formData.append(`${key}[${index}]`, value);
            });
        } else {
            formData.append(key, json[key]);
        }
    }
    return formData;
}

export function login(parameters) {
    return affApi.post(
        "",
        jsonToFormData(
            Object.assign({ action: "aff_user_login" }, parameters)
        )
    );
}
export function logout(parameters) {
    return affApi.post(
        "",
        jsonToFormData(
            Object.assign({ action: "aff_user_logout" }, parameters)
        )
    );
}

export function register(parameters) {
    return affApi.post(
        "",
        jsonToFormData(
            Object.assign({ action: "aff_register_user" }, parameters)
        )
    );
}

export function getUserDetail(parameters) {
    return affApi.post(
        "",
        jsonToFormData(
            Object.assign({ action: "aff_get_user_details" }, parameters)
        )
    );
}
// get_list_user_details_by_id
export function getListUserDetailByID(parameters) {
    return affApi.post(
        "",
        jsonToFormData(
            Object.assign({ action: "aff_get_list_user_details_by_id" }, parameters)
        )
    );
}
export function getProductSales(parameters) {
    return affApi.post(
        "",
        jsonToFormData(
            Object.assign({ action: "aff_get_product_sales_data" }, parameters)
        )
    );
}
export function getTopMemberSales(parameters) {
    return affApi.post(
        "",
        jsonToFormData(
            Object.assign({ action: "aff_get_top_members_sales" }, parameters)
        )
    );
}
export function getOrders(parameters) {
    return affApi.post(
        "",
        jsonToFormData(
            Object.assign({ action: "aff_get_orders" }, parameters)
        )
    );
}
export function getOrderStactics(parameters) {
    return affApi.post(
        "",
        jsonToFormData(
            Object.assign({ action: "aff_get_order_statistics" }, parameters)
        )
    );
}
export function haschild(parameters) {
    return affApi.post(
        "",
        jsonToFormData(
            Object.assign({ action: "aff_check_child" }, parameters)
        )
    );
}
export function requestEdit(parameters) {
    return affApi.post(
        "",
        jsonToFormData(
            Object.assign({ action: "handle_edit_request" }, parameters)
        )
    );
}

export const forgotPassword = async (email) => {
  try {
    const response = await axios.post('/auth/forgot-password', { email });
    return response;
  } catch (error) {
    throw error;
  }
};

// Verify token reset password
export const verifyResetToken = async (token) => {
  try {
    const response = await axios.post('/auth/verify-reset-token', { token });
    return response;
  } catch (error) {
    throw error;
  }
};

// Reset password với token
export const resetPassword = async (data) => {
  try {
    const response = await axios.post('/auth/reset-password', data);
    return response;
  } catch (error) {
    throw error;
  }
};