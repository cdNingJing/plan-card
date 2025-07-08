import { defineStore } from 'pinia'

export const useHistoryStore = defineStore('history', {
  state: () => ({
    messages: []
  }),
  actions: {
    addMessage(msg) {
      this.messages.push(msg)
    }
  }
}) 