import request from '@/utils/request'

const BASE_URL = 'http://127.0.0.1:8000/api/'

export function getAvailableRooms() {
  return request.get('rooms/available/')
}

export function calculateFee(duration_years) {
  return request.post('calculate_fee/', { duration_years })
}

export function submitCheckIn(data) {
  return request.post('checkin/', data)
}

export function getMyElders() {
  return request.get('elders/')
}

export function generatePayUrl(data) {
  return request.post('/generate_pay_url/', data)
}

export function checkoutElder(checkinId) {
  return request.post(`checkout/${checkinId}/`)
}

export function getCheckinList(isAdmin = false) {
  const url = isAdmin ? 'checkins/admin/' : 'checkins/user/'
  return request.get(url)
}

export function renewCheckIn(data) {
  return request.post('checkin/renew/', data)
}
