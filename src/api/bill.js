
import request from '@/utils/request'

export function exportBillExcel(params) {
  return request.get('/bills/export_excel/', {
    params,
    responseType: 'blob' // 指定接收 Blob 类型
  })
}
