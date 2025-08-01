<template>
  <div class="dream-detail-container">
    <!-- 梦想详情页面头部 -->
    <div class="dream-header">
      <button class="back-button" @click="goBack">
        <i class="icon-arrow-left"></i>
      </button>
      <h1 class="dream-title">{{ dream?.title }}</h1>
      <div class="dream-progress">
        <div class="progress-bar">
          <div 
            class="progress-fill" 
            :style="{ width: `${dream?.progress || 0}%` }"
          ></div>
        </div>
        <span class="progress-text">{{ dream?.progress || 0 }}%</span>
      </div>
    </div>
    
    <!-- 梦想详情内容 -->
    <div class="dream-content">
      <div class="description-section">
        <h2>描述</h2>
        <p>{{ dream?.description }}</p>
      </div>
      
      <!-- 这里可以添加更多梦想相关的详细信息 -->
      <div class="milestones-section">
        <h2>里程碑</h2>
        <!-- TODO: 实现里程碑列表 -->
      </div>
      
      <div class="actions-section">
        <h2>相关行动</h2>
        <!-- TODO: 实现行动项列表 -->
      </div>
    </div>
    
    <!-- 底部固定输入框 -->
    <div class="bottom-input-area">
      <BottomInputBox 
        @voice-command="handleVoiceCommand"
        @text-command="handleTextCommand"
      />
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import BottomInputBox from '@/components/BottomInputBox.vue'

export default {
  name: 'DreamDetailView',
  components: {
    BottomInputBox
  },
  props: {
    dreamId: {
      type: String,
      required: true
    }
  },
  setup(props) {
    const router = useRouter()
    const route = useRoute()
    
    const dream = ref(null)
    
    const goBack = () => {
      router.go(-1)
    }
    
    const handleVoiceCommand = (command) => {
      console.log('Voice command in dream detail:', command)
      // TODO: 实现梦想详情页的语音命令处理
    }
    
    const handleTextCommand = (command) => {
      console.log('Text command in dream detail:', command)
      // TODO: 实现梦想详情页的文本命令处理
    }
    
    const loadDreamDetail = async () => {
      // TODO: 根据dreamId加载梦想详情
      const mockDreams = {
        '1': { id: 1, title: '孩子考哈佛', description: '帮助孩子实现名校梦想，制定学习计划，提供最好的教育资源', progress: 65 },
        '2': { id: 2, title: '事业发展', description: '职业生涯规划与提升，寻求更好的发展机会', progress: 40 },
        '3': { id: 3, title: '健康管理', description: '身心健康全面提升，建立良好的生活习惯', progress: 80 }
      }
      
      dream.value = mockDreams[props.dreamId]
    }
    
    onMounted(() => {
      loadDreamDetail()
    })
    
    return {
      dream,
      goBack,
      handleVoiceCommand,
      handleTextCommand
    }
  }
}
</script>

<style lang="scss" scoped>
.dream-detail-container {
  position: relative;
  width: 100vw;
  height: 100vh;
  background: #f8f9fa;
  
  .dream-header {
    position: relative;
    padding: 1rem;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    
    .back-button {
      position: absolute;
      top: 1rem;
      left: 1rem;
      background: none;
      border: none;
      color: white;
      font-size: 1.2rem;
      cursor: pointer;
    }
    
    .dream-title {
      margin: 0 0 1rem 0;
      padding-left: 2.5rem;
      font-size: 1.5rem;
      font-weight: 600;
    }
    
    .dream-progress {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-left: 2.5rem;
      
      .progress-bar {
        flex: 1;
        height: 0.5rem;
        background: rgba(255, 255, 255, 0.3);
        border-radius: 0.25rem;
        overflow: hidden;
        
        .progress-fill {
          height: 100%;
          background: #4caf50;
          transition: width 0.3s ease;
        }
      }
      
      .progress-text {
        font-size: 0.875rem;
        font-weight: 500;
      }
    }
  }
  
  .dream-content {
    padding: 1rem;
    height: calc(100vh - 8rem - 4rem); // 减去头部和底部输入框高度
    overflow-y: auto;
    
    .description-section,
    .milestones-section,
    .actions-section {
      margin-bottom: 2rem;
      
      h2 {
        margin: 0 0 1rem 0;
        font-size: 1.25rem;
        font-weight: 600;
        color: #333;
      }
      
      p {
        margin: 0;
        line-height: 1.6;
        color: #666;
      }
    }
  }
  
  .bottom-input-area {
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 4rem;
    background: #fff;
    border-top: 1px solid #e0e0e0;
    z-index: 100;
  }
}
</style>