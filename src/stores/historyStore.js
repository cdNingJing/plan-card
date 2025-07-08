import { defineStore } from 'pinia'

export const useHistoryStore = defineStore('history', {
  state: () => ({
    messages: [],
    currentCardIndex: 0 // 添加当前卡片索引
  }),
  actions: {
    addMessage(msg) {
      this.messages.push(msg)
      // 保存到本地存储
      this.saveMessages()
    },
    
    // 保存消息到本地存储
    saveMessages() {
      try {
        localStorage.setItem('chat_history', JSON.stringify(this.messages))
      } catch (error) {
        console.error('保存聊天历史失败:', error)
      }
    },
    
    // 从本地存储加载消息
    loadMessages() {
      try {
        const saved = localStorage.getItem('chat_history')
        if (saved) {
          this.messages = JSON.parse(saved)
        }
      } catch (error) {
        console.error('加载聊天历史失败:', error)
        this.messages = []
      }
    },
    
    // 清空消息
    clearMessages() {
      this.messages = []
      localStorage.removeItem('chat_history')
    },
    
    // 设置当前卡片索引
    setCurrentCardIndex(index) {
      this.currentCardIndex = index
      this.saveCurrentCardIndex()
    },
    
    // 保存当前卡片索引到本地存储
    saveCurrentCardIndex() {
      try {
        localStorage.setItem('current_card_index', JSON.stringify(this.currentCardIndex))
      } catch (error) {
        console.error('保存当前卡片索引失败:', error)
      }
    },
    
    // 从本地存储加载当前卡片索引
    loadCurrentCardIndex() {
      try {
        const saved = localStorage.getItem('current_card_index')
        if (saved !== null) {
          this.currentCardIndex = JSON.parse(saved)
        }
      } catch (error) {
        console.error('加载当前卡片索引失败:', error)
        this.currentCardIndex = 0
      }
    }
  }
}) 