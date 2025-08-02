<template>
  <div class="main-content-area">
    <div class="content-cards">
      <div
        class="cards-container"
        :style="{ transform: `translateX(${cardsTranslateX}px)` }"
      >
        <div
          v-for="(dream, dreamIndex) in dreams"
          :key="`cards-${dream.id}`"
          class="dream-cards"
          :class="{ 'active': dreamIndex === activeDreamIndex }"
        >
          <div
            v-for="(card, cardIndex) in dream.cards"
            :key="`card-${dreamIndex}-${cardIndex}`"
            class="card-placeholder"
            :class="[`quadrant-${card.quadrant}`]"
          >
            <!-- <div class="card-header">
              <div class="card-priority">{{ card.priority }}</div>
            </div> -->
            <div class="card-tasks">
              <div
                v-for="(task, taskIndex) in card.tasks"
                :key="`task-${dreamIndex}-${cardIndex}-${taskIndex}`"
                class="task-item"
                :class="{ 'has-separator': taskIndex > 0 }"
              >
                <div class="task-title">{{ task.title }}</div>
                <div class="task-description">{{ task.description }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  dreams: {
    type: Array,
    required: true
  },
  activeDreamIndex: {
    type: Number,
    required: true
  },
  cardsTranslateX: {
    type: Number,
    required: true
  }
})
</script>

<style lang="scss" scoped>
.main-content-area {
  position: absolute;
  top: 4rem;
  left: 0;
  right: 0;
  bottom: 4rem;
  overflow: hidden;

  .content-cards {
    width: 100%;
    height: 100%;
    
    .cards-container {
      display: flex;
      width: 500%;
      height: 100%;
      transition: transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
      
      .dream-cards {
        width: 20%;
        height: 100%;
        padding: 1.25rem;
        display: flex;
        flex-direction: column;
        gap: 1rem;
        
        .card-placeholder {
          border-radius: 0.75rem;
          display: flex;
          flex-direction: column;
          border: 2px solid transparent;
          background: white;
          transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
          overflow: hidden;
          padding: 0 1rem;
          
          // 四象限颜色
          &.quadrant-important-urgent {
            border-color: #FF4444;
            box-shadow: 0 2px 8px rgba(255, 68, 68, 0.2);
          }
          
          &.quadrant-important-not-urgent {
            border-color: #44AA44;
            box-shadow: 0 2px 8px rgba(68, 170, 68, 0.2);
          }
          
          &.quadrant-not-important-urgent {
            border-color: #FFAA44;
            box-shadow: 0 2px 8px rgba(255, 170, 68, 0.2);
          }
          
          &.quadrant-not-important-not-urgent {
            border-color: #888888;
            box-shadow: 0 2px 8px rgba(136, 136, 136, 0.2);
          }
          
          &:hover {
            transform: translateY(-0.125rem) scale(1.02);
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
          }
          
          .card-header {
            padding: 0.5rem 0.5rem 0.375rem 0.5rem;
            border-bottom: 1px solid rgba(0, 0, 0, 0.08);
            flex-shrink: 0;
            
            .card-priority {
              font-size: 0.5rem;
              font-weight: 500;
              text-align: left;
              opacity: 0.7;
            }
          }
          
          .card-tasks {
            flex: 1;
            overflow-y: auto;
            padding: 0.375rem 0.5rem 0.5rem 0.5rem;
            
            .task-item {
              text-align: left;
              padding: 0.375rem 0;
              
              &.has-separator {
                border-top: 1px solid rgba(0, 0, 0, 0.06);
                margin-top: 0.375rem;
                padding-top: 0.75rem;
              }
              
              .task-title {
                font-size: 0.7rem;
                font-weight: 600;
                color: #333;
                margin-bottom: 0.1875rem;
                line-height: 1.2;
              }
              
              .task-description {
                font-size: 0.625rem;
                color: #666;
                font-weight: 400;
                line-height: 1.3;
              }
            }
          }
          
          // 象限优先级文字颜色
          &.quadrant-important-urgent .card-priority {
            color: #FF4444;
          }
          
          &.quadrant-important-not-urgent .card-priority {
            color: #44AA44;
          }
          
          &.quadrant-not-important-urgent .card-priority {
            color: #FFAA44;
          }
          
          &.quadrant-not-important-not-urgent .card-priority {
            color: #888888;
          }
        }
      }
    }
  }
}
</style>