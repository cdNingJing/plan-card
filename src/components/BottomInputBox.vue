<template>
  <div class="bottom-input-box">
    <div class="input-container">
      <!-- 左侧功能按钮 -->
      <div class="left-actions">
        <button 
          class="action-button"
          @click="toggleVoiceInput"
          :class="{ 'active': isVoiceMode }"
        >
          <i :class="isVoiceMode ? 'icon-mic-off' : 'icon-mic'"></i>
        </button>
      </div>
      
      <!-- 输入区域 -->
      <div class="input-area">
        <div v-if="isVoiceMode" class="voice-input">
          <div class="voice-indicator" :class="{ 'listening': isListening }">
            <div class="voice-waves">
              <span v-for="i in 4" :key="i" class="wave"></span>
            </div>
            <div class="voice-text">
              {{ isListening ? '正在聆听...' : '点击开始语音输入' }}
            </div>
          </div>
        </div>
        
        <div v-else class="text-input">
          <input
            ref="textInput"
            v-model="inputText"
            type="text"
            :placeholder="placeholder"
            @keyup.enter="handleSubmit"
            @focus="handleInputFocus"
            @blur="handleInputBlur"
            class="input-field"
          />
        </div>
      </div>
      
      <!-- 右侧功能按钮 -->
      <div class="right-actions">
        <button 
          class="action-button send-button"
          @click="handleSubmit"
          :disabled="!canSubmit"
          :class="{ 'has-content': canSubmit }"
        >
          <i class="icon-send"></i>
        </button>
        
        <button 
          class="action-button"
          @click="toggleInputMode"
        >
          <i :class="isVoiceMode ? 'icon-keyboard' : 'icon-mic'"></i>
        </button>
      </div>
    </div>
    
    <!-- 快捷指令提示 -->
    <div v-if="showSuggestions" class="suggestions-panel">
      <div class="suggestions-content">
        <div class="suggestion-title">常用指令</div>
        <div class="suggestion-list">
          <button
            v-for="suggestion in suggestions"
            :key="suggestion.id"
            class="suggestion-item"
            @click="selectSuggestion(suggestion)"
          >
            <i :class="suggestion.icon"></i>
            <span>{{ suggestion.text }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, nextTick, onMounted, onUnmounted } from 'vue'

export default {
  name: 'BottomInputBox',
  emits: ['voice-command', 'text-command', 'input-focus', 'input-blur'],
  setup(props, { emit }) {
    const inputText = ref('')
    const isVoiceMode = ref(false)
    const isListening = ref(false)
    const isFocused = ref(false)
    const showSuggestions = ref(false)
    const textInput = ref(null)
    
    // 语音识别相关
    let recognition = null
    let recognitionTimeout = null
    
    // 快捷指令
    const suggestions = ref([
      { id: 1, text: '把闹钟改成7:50', icon: 'icon-clock' },
      { id: 2, text: '今天天气怎么样', icon: 'icon-cloud' },
      { id: 3, text: '添加新的梦想', icon: 'icon-plus' },
      { id: 4, text: '查看学习进度', icon: 'icon-book' },
      { id: 5, text: '设置提醒事项', icon: 'icon-bell' }
    ])
    
    const placeholder = computed(() => {
      return isVoiceMode.value ? '点击麦克风开始语音输入...' : '输入指令或问题...'
    })
    
    const canSubmit = computed(() => {
      return inputText.value.trim().length > 0 || (isVoiceMode.value && isListening.value)
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
          
          if (finalTranscript) {
            inputText.value = finalTranscript
            handleVoiceResult(finalTranscript)
          }
        }
        
        recognition.onerror = (event) => {
          console.error('语音识别错误:', event.error)
          isListening.value = false
        }
        
        recognition.onend = () => {
          isListening.value = false
        }
      }
    }
    
    // 切换语音输入模式
    const toggleVoiceInput = () => {
      if (!recognition) {
        console.warn('浏览器不支持语音识别')
        return
      }
      
      if (isListening.value) {
        recognition.stop()
      } else {
        recognition.start()
      }
    }
    
    // 切换输入模式
    const toggleInputMode = () => {
      isVoiceMode.value = !isVoiceMode.value
      if (!isVoiceMode.value && isListening.value) {
        recognition?.stop()
      }
      
      if (!isVoiceMode.value) {
        nextTick(() => {
          textInput.value?.focus()
        })
      }
    }
    
    // 处理语音结果
    const handleVoiceResult = (transcript) => {
      emit('voice-command', transcript)
      inputText.value = ''
      isVoiceMode.value = false
    }
    
    // 处理提交
    const handleSubmit = () => {
      const text = inputText.value.trim()
      if (!text) return
      
      if (isVoiceMode.value) {
        emit('voice-command', text)
      } else {
        emit('text-command', text)
      }
      
      inputText.value = ''
      showSuggestions.value = false
    }
    
    // 输入框焦点事件
    const handleInputFocus = () => {
      isFocused.value = true
      showSuggestions.value = true
      emit('input-focus')
    }
    
    const handleInputBlur = () => {
      isFocused.value = false
      // 延迟隐藏建议，允许点击建议项
      setTimeout(() => {
        showSuggestions.value = false
      }, 200)
      emit('input-blur')
    }
    
    // 选择建议
    const selectSuggestion = (suggestion) => {
      inputText.value = suggestion.text
      showSuggestions.value = false
      handleSubmit()
    }
    
    // 键盘事件处理
    const handleKeydown = (event) => {
      if (event.key === 'Escape') {
        showSuggestions.value = false
        textInput.value?.blur()
      }
    }
    
    onMounted(() => {
      initSpeechRecognition()
      document.addEventListener('keydown', handleKeydown)
    })
    
    onUnmounted(() => {
      if (recognition) {
        recognition.stop()
      }
      if (recognitionTimeout) {
        clearTimeout(recognitionTimeout)
      }
      document.removeEventListener('keydown', handleKeydown)
    })
    
    return {
      inputText,
      isVoiceMode,
      isListening,
      isFocused,
      showSuggestions,
      textInput,
      suggestions,
      placeholder,
      canSubmit,
      toggleVoiceInput,
      toggleInputMode,
      handleSubmit,
      handleInputFocus,
      handleInputBlur,
      selectSuggestion
    }
  }
}
</script>

<style lang="scss" scoped>
.bottom-input-box {
  position: relative;
  width: 100%;
  background: #fff;
  border-top: 1px solid #e0e0e0;
  
  .input-container {
    display: flex;
    align-items: center;
    padding: 0.75rem 1rem;
    gap: 0.75rem;
    
    .left-actions,
    .right-actions {
      display: flex;
      gap: 0.5rem;
      
      .action-button {
        width: 2.5rem;
        height: 2.5rem;
        border: none;
        border-radius: 50%;
        background: #f5f5f5;
        color: #666;
        cursor: pointer;
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        
        &:hover {
          background: #e0e0e0;
          color: #333;
        }
        
        &.active {
          background: #667eea;
          color: white;
        }
        
        &.send-button {
          background: #e0e0e0;
          color: #999;
          
          &.has-content {
            background: #667eea;
            color: white;
            
            &:hover {
              background: #5a6fd8;
            }
          }
          
          &:disabled {
            cursor: not-allowed;
            opacity: 0.5;
          }
        }
        
        i {
          font-size: 1.125rem;
        }
      }
    }
    
    .input-area {
      flex: 1;
      
      .text-input {
        .input-field {
          width: 100%;
          padding: 0.75rem 1rem;
          border: 1px solid #e0e0e0;
          border-radius: 1.5rem;
          background: #f8f9fa;
          font-size: 1rem;
          outline: none;
          transition: all 0.3s ease;
          
          &:focus {
            border-color: #667eea;
            background: #fff;
            box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
          }
          
          &::placeholder {
            color: #999;
          }
        }
      }
      
      .voice-input {
        .voice-indicator {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 1rem;
          background: #f8f9fa;
          border-radius: 1.5rem;
          border: 1px solid #e0e0e0;
          cursor: pointer;
          transition: all 0.3s ease;
          
          &.listening {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border-color: #667eea;
            
            .voice-waves .wave {
              background: white;
            }
          }
          
          .voice-waves {
            display: flex;
            gap: 0.25rem;
            margin-bottom: 0.5rem;
            
            .wave {
              width: 0.25rem;
              height: 1rem;
              background: #667eea;
              border-radius: 0.125rem;
              animation: wave 1.2s infinite ease-in-out;
              
              &:nth-child(2) { animation-delay: 0.1s; }
              &:nth-child(3) { animation-delay: 0.2s; }
              &:nth-child(4) { animation-delay: 0.3s; }
            }
          }
          
          .voice-text {
            font-size: 0.875rem;
            opacity: 0.8;
          }
        }
      }
    }
  }
  
  .suggestions-panel {
    position: absolute;
    bottom: 100%;
    left: 0;
    right: 0;
    background: white;
    border: 1px solid #e0e0e0;
    border-bottom: none;
    border-radius: 0.75rem 0.75rem 0 0;
    box-shadow: 0 -0.25rem 1rem rgba(0, 0, 0, 0.1);
    max-height: 12rem;
    overflow-y: auto;
    
    .suggestions-content {
      padding: 1rem;
      
      .suggestion-title {
        font-size: 0.75rem;
        color: #666;
        margin-bottom: 0.75rem;
        font-weight: 600;
      }
      
      .suggestion-list {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        
        .suggestion-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem;
          background: #f8f9fa;
          border: none;
          border-radius: 0.5rem;
          cursor: pointer;
          transition: all 0.3s ease;
          text-align: left;
          
          &:hover {
            background: #e9ecef;
            transform: translateY(-1px);
          }
          
          i {
            font-size: 1rem;
            color: #667eea;
            width: 1.25rem;
            text-align: center;
          }
          
          span {
            font-size: 0.875rem;
            color: #333;
          }
        }
      }
    }
  }
}

@keyframes wave {
  0%, 40%, 100% {
    transform: scaleY(0.4);
  }
  20% {
    transform: scaleY(1);
  }
}

// 响应式调整
@media (max-width: 375px) {
  .bottom-input-box .input-container {
    padding: 0.5rem 0.75rem;
    gap: 0.5rem;
    
    .left-actions,
    .right-actions {
      .action-button {
        width: 2rem;
        height: 2rem;
        
        i {
          font-size: 1rem;
        }
      }
    }
  }
}
</style>