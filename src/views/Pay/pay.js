// src/views/pay/pay.js
import request from '@/utils/request';

/**
 * 生成支付链接
 * @param {Object} formData - 包含支付信息的表单数据
 * @returns {Promise} - 返回支付链接
 */
export const generatePayUrl = (formData) => {
  return request.post('/generate_pay_url/', formData);
};
