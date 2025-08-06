<template>
  <div class="fixed-bottom-bar" :class="{ 'expanded': isExpanded, 'compact-shadow': !isExpanded }">
    <div 
      class="dynamic-title" 
      :class="{ 'show': verticalTranslateY >= containerHeight * 0.85 }"
    >
      {{ currentDreamTitle }}
    </div>
    
    <!-- 默认状态 -->
    <div class="bottom-content" v-if="!isExpanded" @click="expandBottomBar">
      <div class="bottom-text" :class="getTextColorClass()">Tap to start</div>
    </div>
    
    <!-- 展开状态 -->
    <div class="expanded-content" v-if="isExpanded">
      <!-- 对话消息区域 -->
      <div class="chat-messages" ref="messagesContainer">
        <div 
          v-for="(message, index) in chatMessages" 
          :key="index"
          class="message-item"
          :class="{ 'user-message': message.type === 'user', 'ai-message': message.type === 'ai' }"
        >
          <div class="message-content">
            {{ message.content }}
          </div>
        </div>
      </div>
      
      <!-- 输入框 -->
      <div class="input-container">
        <!-- 加号图标 -->
        <button class="icon-button add-button">
          <Plus :size="16" />
        </button>
        
        <!-- 输入框 -->
        <input 
          ref="inputRef"
          v-model="inputText"
          type="text" 
          placeholder="Ask Natural"
          class="chat-input"
          @keyup.enter="sendMessage"
          @keyup.esc="collapseBottomBar"
        />
        
        <!-- 语音图标 -->
        <button class="icon-button voice-button">
          <Mic :size="16" />
        </button>
      </div>
    </div>
    
  </div>
  
  <!-- 遮罩层 - 点击收起 -->
  <div 
    v-if="isExpanded" 
    class="overlay" 
    @click="collapseBottomBar"
  ></div>
</template>

<script setup>
import { computed, ref, nextTick } from 'vue'
import { Plus, Mic } from 'lucide-vue-next'

const props = defineProps({
  dreams: {
    type: Array,
    required: true
  },
  activeDreamIndex: {
    type: Number,
    required: true
  },
  verticalTranslateY: {
    type: Number,
    required: true
  },
  containerHeight: {
    type: Number,
    required: true
  }
})

const currentDreamTitle = computed(() => {
  return props.dreams[props.activeDreamIndex]?.title || ''
})

// 交互状态
const isExpanded = ref(false)
const inputText = ref('')
const inputRef = ref(null)
const messagesContainer = ref(null)

// 对话消息
const chatMessages = ref([
  { type: 'ai', content: 'hahaha' }
])

// 根据四象限类型获取文字颜色类
const getTextColorClass = () => {
  // 根据垂直位置判断是第一屏还是第二屏
  if (props.verticalTranslateY > 0) {
    // 第二屏 - 使用白灰
    return 'text-white-gray'
  } else {
    // 第一屏 - 使用黑灰
    return 'text-black-gray'
  }
}

// 展开底部栏
const expandBottomBar = async () => {
  isExpanded.value = true
  await nextTick()
  inputRef.value?.focus()
}

// 收起底部栏
const collapseBottomBar = () => {
  isExpanded.value = false
  inputText.value = ''
}

// 发送消息
const sendMessage = async () => {
  if (!inputText.value.trim()) return
  
  const userMessage = inputText.value.trim()
  
  // 添加用户消息
  chatMessages.value.push({
    type: 'user',
    content: userMessage
  })
  
  // 清空输入框
  inputText.value = ''
  
  // 滚动到底部
  await nextTick()
  scrollToBottom()
  
  // 模拟AI回复
  setTimeout(() => {
    chatMessages.value.push({
      type: 'ai',
      content: '返回内容。'
    })
    nextTick(() => {
      scrollToBottom()
    })
  }, 1000)
}

// 滚动到底部
const scrollToBottom = () => {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}
</script>

<style lang="scss" scoped>
.fixed-bottom-bar {
  position: fixed;
  bottom: 1rem;
  left: 0;
  right: 0;
  height: 2.5rem;
  width: max-content;
  margin: 0 auto;
  // background: url('@/assets/an.jpg') center center/cover; // 使用渐变背景图片
  background-color: rgb(255 255 255 / 30%);
  // background-position: center 50%; // 确保取图片中间部分
  border-radius: 1.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  
  // 移除默认阴影，将由独立class控制
  
  // 独立的阴影效果class（仅在默认状态使用）
  &.compact-shadow {
    box-shadow: 
      // 多层内阴影创建从白色到透明的渐变效果 (10px宽度)
      inset 0 0 1px rgba(255, 255, 255, 1.0),     // 最内层，纯白色
      inset 0 0 2px rgba(255, 255, 255, 0.95),    // 1-2px，极高透明度白色
      inset 0 0 3px rgba(255, 255, 255, 0.85),    // 2-3px，高透明度
      inset 0 0 4px rgba(255, 255, 255, 0.75),    // 3-4px，中高透明度
      inset 0 0 5px rgba(255, 255, 255, 0.6),     // 4-5px，中等透明度
      inset 0 0 6px rgba(255, 255, 255, 0.5),     // 5-6px，中等透明度
      inset 0 0 7px rgba(255, 255, 255, 0.4),     // 6-7px，中低透明度
      inset 0 0 8px rgba(255, 255, 255, 0.3),     // 7-8px，较低透明度
      inset 0 0 9px rgba(255, 255, 255, 0.2),     // 8-9px，很低透明度
      inset 0 0 10px rgba(255, 255, 255, 0.1),    // 9-10px，接近透明
      inset 0 0 11px rgba(255, 255, 255, 0.05),   // 10-11px，几乎透明
      // 外部阴影
      0 2px 8px rgba(0, 0, 0, 0.15);
  }
  
  // 移除光泽覆盖层
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 40%;
    background: transparent;
    border-radius: 2rem 2rem 0 0;
    pointer-events: none;
    opacity: 0;
    transition: all 0.3s ease;
  }
  
  // 悬停状态（只在compact-shadow类存在时应用）
  &:not(.expanded).compact-shadow:hover {
    transform: translateY(-1px);
    box-shadow: 
      // 悬停时增强的渐变白色内阴影 (10px宽度)
      inset 0 0 1px rgba(255, 255, 255, 1.0),
      inset 0 0 2px rgba(255, 255, 255, 1.0),     // 增强内层亮度
      inset 0 0 3px rgba(255, 255, 255, 0.9),
      inset 0 0 4px rgba(255, 255, 255, 0.8),
      inset 0 0 5px rgba(255, 255, 255, 0.7),
      inset 0 0 6px rgba(255, 255, 255, 0.6),
      inset 0 0 7px rgba(255, 255, 255, 0.5),
      inset 0 0 8px rgba(255, 255, 255, 0.4),
      inset 0 0 9px rgba(255, 255, 255, 0.3),
      inset 0 0 10px rgba(255, 255, 255, 0.2),
      inset 0 0 11px rgba(255, 255, 255, 0.1),
      // 增强外部阴影
      0 4px 12px rgba(0, 0, 0, 0.2);
  }
  
  // 按下状态（只在compact-shadow类存在时应用）
  &:not(.expanded).compact-shadow:active {
    transform: translateY(0);
    box-shadow: 
      // 按下时稍微减弱的渐变白色内阴影 (10px宽度)
      inset 0 0 1px rgba(255, 255, 255, 0.9),
      inset 0 0 2px rgba(255, 255, 255, 0.85),
      inset 0 0 3px rgba(255, 255, 255, 0.75),
      inset 0 0 4px rgba(255, 255, 255, 0.65),
      inset 0 0 5px rgba(255, 255, 255, 0.5),
      inset 0 0 6px rgba(255, 255, 255, 0.4),
      inset 0 0 7px rgba(255, 255, 255, 0.3),
      inset 0 0 8px rgba(255, 255, 255, 0.2),
      inset 0 0 9px rgba(255, 255, 255, 0.15),
      inset 0 0 10px rgba(255, 255, 255, 0.1),
      inset 0 0 11px rgba(255, 255, 255, 0.03),
      // 外部阴影
      0 2px 8px rgba(0, 0, 0, 0.15);
  }
  
  // 展开状态
  &.expanded {
    bottom: 0; // 固定在底部
    left: 0;
    right: 0;
    width: 100%; // 展开时占满宽度
    margin: 0; // 重置margin
    height: auto;
    min-height: 16rem;
    max-height: 70vh;
    border-radius: 1rem 1rem 0 0; // 顶部圆角，底部直角
    flex-direction: column;
    align-items: stretch;
    padding: 1rem 2rem; // 上下1rem，左右2rem内边距
    background: url('@/assets/an.jpg') center center/cover; // 使用图片背景，取中间部分
    background-position: center 50%; // 确保取图片中间部分
    
    &::before {
      border-radius: 1rem 1rem 0 0;
      background: transparent; // 移除光泽效果
    }
  }
  
  .dynamic-title {
    position: fixed;
    bottom: 4rem;
    left: 50%;
    transform: translateX(-50%) translateY(10px);
    width: 80vw;
    font-size: 1.3rem;
    font-weight: 600;
    color: #cccccc;
    opacity: 0;
    transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    // text-shadow: 0 1px 2px rgba(255, 255, 255, 0.8);
    text-align: center;
    z-index: 200;
    
    &.show {
      opacity: 1;
      transform: translateX(-50%) translateY(0);
    }
  }
  
  .bottom-content {
    position: relative;
    z-index: 2;
    cursor: pointer;
    padding: 0 1.5rem;
    
    .bottom-text {
      font-size: 0.75rem; // 更小的字体
      font-weight: 600;
      text-shadow: none;
      transition: all 0.2s ease;
      white-space: nowrap;
      
      // 第一屏 - 黑灰
      &.text-black-gray {
        color: #333333;
      }
      
      // 第二屏 - 白灰
      &.text-white-gray {
        color: #cccccc;
        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
      }
    }
  }
  
  .expanded-content {
    position: relative;
    z-index: 2;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    width: 100%;
    height: 100%;
    
    .chat-messages {
      flex: 1;
      overflow-y: auto;
      padding: 1rem 0;
      display: flex;
      flex-direction: column;
      gap: 1rem;
      min-height: 10rem;
      max-height: 50vh;
      
      // 隐藏滚动条
      &::-webkit-scrollbar {
        width: 2px;
      }
      
      &::-webkit-scrollbar-track {
        background: transparent;
      }
      
      &::-webkit-scrollbar-thumb {
        background: var(--border-medium);
        border-radius: 1px;
      }
      
      .message-item {
        display: flex;
        margin-bottom: 0.5rem;
        
        &.ai-message {
          justify-content: flex-start;
          
          .message-content {
            background: #ffffff;
            color: var(--text-primary);
            border-radius: 1rem 1rem 1rem 0.25rem;
            max-width: 75%;
          }
        }
        
        &.user-message {
          justify-content: flex-end;
          
          .message-content {
            background: #ffffff;
            color: var(--text-primary);
            border-radius: 1rem 1rem 0.25rem 1rem;
            max-width: 75%;
          }
        }
        
        .message-content {
          padding: 0.75rem 1rem;
          font-size: 0.9rem;
          line-height: 1.4;
          word-wrap: break-word;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          border: none;
        }
      }
    }
    
    .input-container {
      display: flex;
      align-items: center;
      background: #ffffff; // 恢复纯白色背景
      border-radius: 1.5rem; // 恢复原始圆角
      padding: 0.25rem; // 恢复原始内边距
      gap: 0.25rem;
      
      // 恢复原始阴影效果
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      
      .icon-button {
        width: 2rem;
        height: 2rem;
        border: none;
        border-radius: 50%;
        background: #f0f0f0;
        color: var(--text-secondary);
        font-size: 0.9rem;
        font-weight: 400;
        cursor: pointer;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        
        box-shadow: none;
        
        &:hover {
          background: #e0e0e0;
          color: var(--text-primary);
        }
        
        &:active {
          transform: scale(0.95);
        }
      }
      
      .add-button {
        // 加号图标样式
      }
      
      .voice-button {
        // 语音图标样式
      }
      
      .chat-input {
        flex: 1;
        height: 2rem; // 恢复原始输入框高度
        padding: 0 0.75rem;
        border: none;
        background: transparent;
        font-size: 0.9rem;
        color: var(--text-primary);
        outline: none;
        
        &::placeholder {
          color: var(--text-tertiary);
        }
        
        // 移除所有默认样式
        &:focus {
          outline: none;
          box-shadow: none;
        }
        
        // 移除浏览器默认样式
        &::-webkit-input-placeholder {
          color: var(--text-tertiary);
        }
        
        &::-moz-placeholder {
          color: var(--text-tertiary);
        }
        
        &:-ms-input-placeholder {
          color: var(--text-tertiary);
        }
      }
      
    }
  }
}

.overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.1);
  z-index: 99;
  backdrop-filter: blur(2px);
}
</style>