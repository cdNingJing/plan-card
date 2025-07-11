import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useRestaurantStore = defineStore('restaurant', () => {
  // 选中的餐厅
  const selectedRestaurant = ref(null)
  
  // 预订信息
  const bookingInfo = ref({
    location: 'Italian Trattoria',
    date: '7月1日',
    time: '19:00',
    guests: '2人',
    notes: '靠窗位置，妈妈喜欢的意式风情',
    image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&h=300&fit=crop'
  })

  // 设置选中的餐厅
  const setSelectedRestaurant = (restaurant) => {
    selectedRestaurant.value = restaurant
    // 同时更新预订信息
    updateBookingInfo(restaurant)
  }

  // 更新预订信息
  const updateBookingInfo = (restaurant) => {
    if (restaurant) {
      bookingInfo.value = {
        location: restaurant.name,
        date: '7月1日',
        time: '19:00',
        guests: '2人',
        notes: `靠窗位置，${restaurant.tags[0]}`,
        image: restaurant.image
      }
    }
  }

  // 获取选中的餐厅
  const getSelectedRestaurant = () => {
    return selectedRestaurant.value
  }

  // 获取预订信息
  const getBookingInfo = () => {
    return bookingInfo.value
  }

  return {
    selectedRestaurant,
    bookingInfo,
    setSelectedRestaurant,
    updateBookingInfo,
    getSelectedRestaurant,
    getBookingInfo
  }
}) 