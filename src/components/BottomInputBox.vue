<template>
  <div class="bottom-input-box" :class="{ 'hyper-time-mode': isHyperTimeExpanded }">
    <div class="input-container">
      <!-- 语音按钮 -->
      <div class="voice-actions">
        <button 
          class="voice-button"
          :class="{ 'listening': isListening }"
          @mousedown="startLongPress"
          @mouseup="endLongPress"
          @mouseleave="endLongPress"
          @touchstart="startLongPress"
          @touchend="endLongPress"
          @touchcancel="endLongPress"
        >
          <Mic :size="18" v-if="!isListening" />
          <MicOff :size="18" v-else />
          
          <!-- 语音波纹动画 -->
          <div v-if="isListening" class="voice-ripple">
            <div class="ripple"></div>
            <div class="ripple"></div>
            <div class="ripple"></div>
          </div>
        </button>
      </div>
      
      <!-- 输入框 -->
      <div class="input-area">
        <input
          ref="textInput"
          v-model="inputText"
          type="text"
          placeholder="输入指令或问题..."
          @keyup.enter="handleSubmit"
          @focus="handleInputFocus"
          @blur="handleInputBlur"
          class="input-field"
        />
      </div>
      
      <!-- 右侧发送按钮 -->
      <div class="right-actions">
        <button 
          class="send-button"
          @click="handleSubmit"
          :disabled="!canSubmit"
          :class="{ 'has-content': canSubmit }"
        >
          <Send :size="18" />
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, nextTick, onMounted, onUnmounted } from 'vue'
import { Mic, MicOff, Send } from 'lucide-vue-next'

export default {
  name: 'BottomInputBox',
  components: {
    Mic,
    MicOff,
    Send
  },
  props: {
    isHyperTimeExpanded: {
      type: Boolean,
      default: false
    }
  },
  emits: ['voice-command', 'text-command', 'input-focus', 'input-blur'],
  setup(props, { emit }) {
    const inputText = ref('')
    const isListening = ref(false)
    const isFocused = ref(false)
    const textInput = ref(null)
    
    // 语音识别相关
    let recognition = null
    let recognitionTimeout = null
    let isLongPressing = ref(false)
    
    // 快捷指令
    const suggestions = ref([
      { id: 1, text: '把闹钟改成7:50', icon: 'icon-clock' },
      { id: 2, text: '今天天气怎么样', icon: 'icon-cloud' },
      { id: 3, text: '添加新的梦想', icon: 'icon-plus' },
      { id: 4, text: '查看学习进度', icon: 'icon-book' },
      { id: 5, text: '设置提醒事项', icon: 'icon-bell' }
    ])
    
    const canSubmit = computed(() => {
      return inputText.value.trim().length > 0
    })
    
    // 初始化语音识别
    const initSpeechRecognition = () => {
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
        recognition = new SpeechRecognition()
        recognition.continuous = false
        recognition.interimResults = true
        recognition.lang = 'zh-CN'
        
        recognition.onstart = () => {
          isListening.value = true
        }
        
        recognition.onresult = (event) => {
          let interimTranscript = ''
          let finalTranscript = ''
          
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript
            if (event.results[i].isFinal) {
              finalTranscript += transcript
            } else {
              interimTranscript += transcript
            }
          }
          
          // 实时显示识别的文字到输入框
          if (finalTranscript) {
            inputText.value = finalTranscript
          } else if (interimTranscript) {
            inputText.value = interimTranscript
          }
        }
        
        recognition.onerror = (event) => {
          console.error('语音识别错误:', event.error)
          isListening.value = false
        }
        
        recognition.onend = () => {
          isListening.value = false
          isLongPressing.value = false
        }
      }
    }
    
    // 开始长按录音
    const startLongPress = (e) => {
      e.preventDefault()
      
      // 防止重复触发
      if (isLongPressing.value || isListening.value) {
        return
      }
      
      isLongPressing.value = true
      inputText.value = '' // 清空输入框
      startListening()
    }
    
    // 结束长按录音
    const endLongPress = (e) => {
      e.preventDefault()
      if (isLongPressing.value) {
        isLongPressing.value = false
        stopListening()
        // 长按结束后自动发送语音识别的内容
        setTimeout(() => {
          if (inputText.value.trim()) {
            handleSubmit()
          }
        }, 100) // 稍微延迟以确保语音识别结果已更新
      }
    }
    
    // 开始语音识别
    const startListening = () => {
      if (!recognition) {
        console.warn('浏览器不支持语音识别')
        return
      }
      
      // 如果已经在监听，先停止
      if (isListening.value) {
        recognition.stop()
        return
      }
      
      try {
        recognition.start()
      } catch (error) {
        console.error('启动语音识别失败:', error)
        isListening.value = false
      }
    }
    
    // 停止语音识别
    const stopListening = () => {
      if (recognition && isListening.value) {
        recognition.stop()
      }
    }
    
    // 处理语音结果 - 不再需要单独的语音结果处理，直接通过handleSubmit发送
    
    // 处理提交
    const handleSubmit = () => {
      const text = inputText.value.trim()
      if (!text) return
      
      // 根据来源发送不同的事件
      if (isLongPressing.value || isListening.value) {
        emit('voice-command', text)
      } else {
        emit('text-command', text)
      }
      inputText.value = ''
    }
    
    // 输入框焦点事件
    const handleInputFocus = () => {
      isFocused.value = true
      emit('input-focus')
    }
    
    const handleInputBlur = () => {
      isFocused.value = false
      emit('input-blur')
    }
    
    
    onMounted(() => {
      initSpeechRecognition()
    })
    
    onUnmounted(() => {
      if (recognition) {
        recognition.stop()
      }
      if (recognitionTimeout) {
        clearTimeout(recognitionTimeout)
      }
    })
    
    return {
      inputText,
      isListening,
      isFocused,
      textInput,
      canSubmit,
      startLongPress,
      endLongPress,
      handleSubmit,
      handleInputFocus,
      handleInputBlur
    }
  }
}
</script>

<style lang="scss" scoped>
.bottom-input-box {
  position: relative;
  width: 100%;
  
  // 主输入容器
  .input-container {
    display: flex;
    align-items: center;
    padding: 0.75rem 1rem;
    gap: 0.75rem;
    background: #fff;
    transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
    
    .voice-actions {
      .voice-button {
        width: 2.5rem;
        height: 2.5rem;
        border: none;
        border-radius: 50%;
        background: #f0f0f0;
        color: #666;
        cursor: pointer;
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
        
        &:hover {
          background: #e8e8e8;
          transform: translateY(-1px);
        }
        
        &.listening {
          background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
          color: white;
          animation: pulse 2s infinite;
          
          .voice-ripple {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            
            .ripple {
              position: absolute;
              border: 2px solid rgba(255, 255, 255, 0.3);
              border-radius: 50%;
              animation: ripple 1.5s infinite;
              
              &:nth-child(1) {
                width: 3rem;
                height: 3rem;
                margin: -1.5rem;
              }
              
              &:nth-child(2) {
                width: 3.5rem;
                height: 3.5rem;
                margin: -1.75rem;
                animation-delay: 0.3s;
              }
              
              &:nth-child(3) {
                width: 4rem;
                height: 4rem;
                margin: -2rem;
                animation-delay: 0.6s;
              }
            }
          }
        }
      }
    }
    
    .input-area {
      flex: 1;
      
      .input-field {
        width: 100%;
        padding: 0.75rem 1rem;
        border: none;
        border-radius: 1.5rem;
        background: #f8f9fa;
        font-size: 1rem;
        outline: none;
        transition: all 0.3s ease;
        
        &:focus {
          background: #fff;
        }
        
        &::placeholder {
          color: #999;
        }
      }
    }
    
    .right-actions {
      .send-button {
        width: 2.5rem;
        height: 2.5rem;
        border: none;
        border-radius: 50%;
        background: #e0e0e0;
        color: #999;
        cursor: pointer;
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        
        &.has-content {
          background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
          color: white;
          
          &:hover {
            transform: translateY(-1px);
          }
        }
        
        &:disabled {
          cursor: not-allowed;
          opacity: 0.5;
        }
      }
    }
  }
  
  // 超时间模式样式
  &.hyper-time-mode {
    .input-container {
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      
      .voice-actions .voice-button {
        background: rgba(255, 255, 255, 0.1);
        color: #e0e0e0;
        
        &:hover {
          background: rgba(255, 255, 255, 0.15);
        }
        
        &.listening {
          background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
          color: white;
        }
      }
      
      .input-area .input-field {
        background: rgba(255, 255, 255, 0.1);
        color: #e0e0e0;
        border: 1px solid rgba(255, 255, 255, 0.1);
        
        &:focus {
          background: rgba(255, 255, 255, 0.15);
          border-color: rgba(255, 255, 255, 0.2);
        }
        
        &::placeholder {
          color: rgba(224, 224, 224, 0.6);
        }
      }
      
      .right-actions .send-button {
        background: rgba(255, 255, 255, 0.1);
        color: rgba(224, 224, 224, 0.6);
        
        &.has-content {
          background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
          color: white;
        }
      }
    }
  }
}

// 动画关键帧
@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

@keyframes ripple {
  0% {
    opacity: 1;
    transform: scale(0);
  }
  100% {
    opacity: 0;
    transform: scale(1);
  }
}

// 响应式调整
@media (max-width: 375px) {
  .bottom-input-box {
    .input-container {
      padding: 0.5rem 0.75rem;
      gap: 0.5rem;
      
      .voice-actions .voice-button {
        width: 2rem;
        height: 2rem;
      }
      
      .right-actions .send-button {
        width: 2rem;
        height: 2rem;
      }
    }
  }
}
</style>