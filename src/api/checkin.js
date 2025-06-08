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
