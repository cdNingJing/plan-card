<template>
  <div class="dream-header">
    <div 
      class="dream-titles"
      :style="{ transform: `translateX(${dreamTitleTranslateX}px)` }"
    >
      <div
        v-for="(dream, index) in dreams"
        :key="dream.id"
        class="dream-title"
        :class="{ 
          'active': index === activeDreamIndex,
          'dream-following': isDreamFollowing && index === activeDreamIndex
        }"
        :style="getDreamTitleStyle(index)"
        @click="$emit('setActiveDream', index)"
      >
        {{ dream.title }}
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
  dreamTitleTranslateX: {
    type: Number,
    required: true
  },
  isDreamFollowing: {
    type: Boolean,
    default: false
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

const emit = defineEmits(['setActiveDream'])


const getDreamTitleStyle = (index) => {
  const isActive = index === props.activeDreamIndex
  const scrollThreshold = props.containerHeight * 0.8
  const fixedThreshold = props.containerHeight * 0.85
  
     if (isActive && props.verticalTranslateY >= fixedThreshold) {
     return {
       position: 'fixed',
       bottom: '6rem',
       right: '2rem',
       zIndex: 200,
       color: '#333',
       fontWeight: '700',
       fontSize: '1.1rem',
       transition: 'all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)',
       maxWidth: 'calc(100vw - 4rem)',
       overflow: 'hidden',
       textOverflow: 'ellipsis',
       whiteSpace: 'nowrap'
     }
  } else if (!isActive && props.verticalTranslateY >= scrollThreshold) {
    return {
      opacity: 0.5,
      transition: 'all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)'
    }
  }
  
  return {}
}
</script>

<style lang="scss" scoped>
.dream-header {
  position: absolute;
  top: 1rem;
  left: 0;
  right: 0;
  height: 3rem;
  z-index: 20;
  overflow: hidden;
  
     .dream-titles {
     display: flex;
     align-items: center;
     height: 100%;
     transition: transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
     width: max-content;
     justify-content: flex-end;
    
    .dream-title {
      display: block;
      height: 3rem;
      line-height: 3rem;
      font-size: 1rem;
      font-weight: 500;
      color: var(--text-secondary);
      cursor: pointer; 
      transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
             margin-left: 3rem;
       flex-shrink: 0;
       white-space: nowrap;
       padding: 0 0.5rem;
      min-width: 120px;
      overflow: hidden;
      text-overflow: ellipsis;
      text-align: left;
      
      &.active {
        color: #333;
        font-weight: 700;
        font-size: 1.1rem;
      }
      
      &.dream-following {
        position: relative;
        color: #333;
        font-weight: 700;
        transition: none;
      }
    }
  }
}
</style>