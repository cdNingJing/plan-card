// 预订记录存储服务
class BookingStorage {
  constructor() {
    this.storageKey = 'flight_bookings'
  }

  // 获取所有预订记录
  getAllBookings() {
    try {
      const data = localStorage.getItem(this.storageKey)
      return data ? JSON.parse(data) : []
    } catch (error) {
      console.error('[BookingStorage] 获取预订记录失败:', error)
      return []
    }
  }

  // 添加新预订记录
  addBooking(bookingData) {
    try {
      const bookings = this.getAllBookings()
      const newBooking = {
        id: this.generateBookingId(),
        ...bookingData,
        createdAt: new Date().toISOString(),
        status: 'confirmed'
      }
      
      bookings.unshift(newBooking) // 添加到开头
      localStorage.setItem(this.storageKey, JSON.stringify(bookings))
      
      console.log('[BookingStorage] 预订记录已保存:', newBooking)
      return newBooking
    } catch (error) {
      console.error('[BookingStorage] 保存预订记录失败:', error)
      return null
    }
  }

  // 生成预订ID
  generateBookingId() {
    const timestamp = Date.now()
    const random = Math.floor(Math.random() * 1000)
    return `BK${timestamp}${random}`
  }

  // 获取最近的预订记录
  getRecentBookings(limit = 5) {
    const bookings = this.getAllBookings()
    return bookings.slice(0, limit)
  }

  // 根据ID获取预订记录
  getBookingById(id) {
    const bookings = this.getAllBookings()
    return bookings.find(booking => booking.id === id)
  }

  // 删除预订记录
  deleteBooking(id) {
    try {
      const bookings = this.getAllBookings()
      const filteredBookings = bookings.filter(booking => booking.id !== id)
      localStorage.setItem(this.storageKey, JSON.stringify(filteredBookings))
      return true
    } catch (error) {
      console.error('[BookingStorage] 删除预订记录失败:', error)
      return false
    }
  }

  // 清空所有预订记录
  clearAllBookings() {
    try {
      localStorage.removeItem(this.storageKey)
      return true
    } catch (error) {
      console.error('[BookingStorage] 清空预订记录失败:', error)
      return false
    }
  }
}

export const bookingStorage = new BookingStorage() 