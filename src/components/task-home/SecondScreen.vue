<template>
  <div 
    class="second-screen"
    :style="{ transform: `translateY(${verticalTranslateY}px)` }"
  >
    <div class="second-screen-content">
      
      <div class="visions-container">
        
        <div 
          class="visions-content"
          :style="{ transform: `translateX(${-activeDreamIndex * 20}%)` }"
        >
          
          <div
            v-for="(dreamVision, dreamIndex) in allDreamVisions"
            :key="`vision-${dreamIndex}-${dreamIndex === activeDreamIndex ? animationKey : 0}`"
            class="vision-section"
            :class="{ 'active': dreamIndex === activeDreamIndex }"
          >
          
          <div class="vision-header">
            <h2 class="vision-title">{{ dreamVision?.title || `Vision ${dreamIndex}` }}</h2>
            <p class="vision-subtitle">{{ dreamVision?.subtitle || 'Loading...' }}</p>
          </div>
          
          <div class="insight-cards">
            <div
              v-for="(insight, index) in (dreamVision?.insights || [])"
              :key="`insight-${dreamIndex}-${index}`"
              class="insight-card"
              :style="dreamIndex === activeDreamIndex ? { animationDelay: `${index * 0.2}s` } : {}"
            >
              <div class="insight-icon">
                <component :is="insight.icon" :size="24" />
              </div>
              <div class="insight-content">
                <div class="insight-title">{{ insight.title }}</div>
                <div class="insight-description">{{ insight.description }}</div>
              </div>
            </div>
          </div>
          
          <div class="future-state">
            <div class="future-text">{{ dreamVision?.futureState || 'Future vision loading...' }}</div>
          </div>
        </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, watch, ref } from 'vue'
import { Zap, Brain, Sprout, Target, Users, Rocket, Home, TrendingUp, MapPin, Puzzle, Globe, Gem, Heart, Handshake, Star } from 'lucide-vue-next'

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
  }
})

// 为每个梦想定义超越时机的内容
const dreamVisions = {
  0: { // 年底前减重20斤，重拾健康活力
    title: "重拾生命活力",
    subtitle: "不只是减重，而是重新定义你的人生",
    insights: [
      {
        icon: Zap,
        title: "能量觉醒",
        description: "当你摆脱身体负担，将体验到前所未有的精力充沛状态"
      },
      {
        icon: Brain,
        title: "心智升华", 
        description: "自律带来的成就感会提升你在工作和生活中的决策能力"
      },
      {
        icon: Sprout,
        title: "重新开始",
        description: "健康的体魄是实现所有其他目标的基石"
      }
    ],
    futureState: "想象一年后的你：精力充沛地工作，自信地面对每一个挑战，拥有掌控生活的力量"
  },
  1: { // 3年内晋升技术主管，实现年薪50万目标
    title: "技术领导力的蜕变",
    subtitle: "从代码执行者到战略思考者",
    insights: [
      {
        icon: Target,
        title: "战略视野",
        description: "掌握的不仅是技术，更是用技术解决商业问题的智慧"
      },
      {
        icon: Users, 
        title: "团队影响力",
        description: "你将引领团队创造价值，而不仅仅是完成任务"
      },
      {
        icon: Rocket,
        title: "行业地位",
        description: "成为技术领域的意见领袖，影响行业发展方向"
      }
    ],
    futureState: "3年后的你：在技术大会上分享经验，带领团队攻克关键项目，拥有行业话语权"
  },
  2: { // 攒够100万首付买房
    title: "财富自由的起点",
    subtitle: "第一桶金不只是数字，是选择的自由",
    insights: [
      {
        icon: Home,
        title: "安全感升级",
        description: "拥有自己的空间，不再为房租焦虑，心理状态更稳定"
      },
      {
        icon: TrendingUp,
        title: "财商觉醒",
        description: "学会理财投资，让钱为你工作，而不是你为钱工作"
      },
      {
        icon: MapPin,
        title: "目标实现力",
        description: "证明了你有能力实现看似困难的长期目标"
      }
    ],
    futureState: "买房那一刻：不只是获得了居住空间，更是获得了财务规划能力和实现大目标的信心"
  },
  3: { // 2年内考取PMP证书和AWS架构师认证
    title: "终身学习的复利效应",
    subtitle: "每一个证书都是新能力的证明",
    insights: [
      {
        icon: Puzzle,
        title: "系统性思维",
        description: "不再只做螺丝钉，而是理解整个系统如何运转"
      },
      {
        icon: Globe,
        title: "全球视野",
        description: "掌握国际标准，与世界级专家在同一频道上对话"
      },
      {
        icon: Gem,
        title: "价值升级",
        description: "认证背后是能力的实质提升，市场会给出相应回报"
      }
    ],
    futureState: "2年后的你：拥有项目管理和技术架构的双重能力，成为稀缺的复合型人才"
  },
  4: { // 修复家庭关系，建立深度友谊圈
    title: "人生支持系统的重建",
    subtitle: "关系是人生最大的财富",
    insights: [
      {
        icon: Heart,
        title: "情感丰盈",
        description: "修复的关系会成为你面对困难时最坚实的支撑"
      },
      {
        icon: Handshake,
        title: "互助网络",
        description: "深度友谊带来的不只是陪伴，还有机遇和资源共享"
      },
      {
        icon: Star,
        title: "人格成长",
        description: "学会理解和包容，让你在职场和生活中更有魅力"
      }
    ],
    futureState: "当你拥有深度的人际关系：每个重要时刻都有人分享，每个困难时刻都有人支持"
  }
}

const allDreamVisions = computed(() => {
  // 确保按照正确的索引顺序返回数据
  const visions = [
    dreamVisions[0],
    dreamVisions[1], 
    dreamVisions[2],
    dreamVisions[3],
    dreamVisions[4]
  ]
  return visions
})

const currentDreamVision = computed(() => {
  return dreamVisions[props.activeDreamIndex] || dreamVisions[0]
})

// 添加一个key来强制重新渲染动画
const animationKey = ref(0)

watch(() => props.activeDreamIndex, () => {
  animationKey.value++
})
</script>

<style lang="scss" scoped>
.second-screen {
  position: fixed;
  top: -100vh;
  left: 0;
  width: 100%;
  height: 100vh;
  z-index: 15;
  background: white;
  transition: transform 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
  
  .second-screen-content {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    overflow: hidden;
    
    .visions-container {
      width: 100%;
      height: 100%;
      overflow: hidden;
      position: relative;
      
      .visions-content {
        display: flex;
        width: 500%;
        height: 100%;
        transition: transform 0.2s cubic-bezier(0.25, 0.8, 0.25, 1);
      }
      
      .vision-section {
        width: 20%;
        height: 100%;
        padding: 2rem 1.25rem 8rem 1.25rem;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        align-items: center;
        color: #333;
        flex-shrink: 0;
        
        .vision-header {
          opacity: 1;
          transform: translateY(0);
        }
        
        .insight-card {
          opacity: 1;
          transform: translateX(0);
        }
        
        .future-state {
          opacity: 1;
          transform: translateY(0);
        }
        
        &.active {
          .insight-card {
            animation: insightSlideIn 0.8s ease-out forwards;
            
            &:nth-child(1) {
              animation-delay: 0.2s;
            }
            
            &:nth-child(2) {
              animation-delay: 0.4s;
            }
            
            &:nth-child(3) {
              animation-delay: 0.6s;
            }
          }
          
          .vision-header {
            animation: fadeInUp 1s ease-out forwards;
          }
          
          .future-state {
            animation: fadeInUp 1.2s ease-out forwards;
          }
        }
      }
        
        .vision-header {
          text-align: center;
          margin-bottom: 2rem;
          
          .vision-title {
            font-size: 1.75rem;
            font-weight: 700;
            margin-bottom: 0.5rem;
            color: #333;
          }
          
          .vision-subtitle {
            font-size: 1rem;
            opacity: 0.7;
            font-weight: 400;
            line-height: 1.4;
            color: #666;
          }
        }
        
        .insight-cards {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 1rem;
          width: 100%;
          max-width: 380px;
          justify-content: center;
          
          .insight-card {
            background: white;
            border-radius: 1rem;
            padding: 1rem;
            display: flex;
            align-items: center;
            gap: 1rem;
            border: 1px solid rgba(0, 0, 0, 0.08);
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
            
            &:hover {
              transform: translateY(-2px);
              box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
              border-color: rgba(0, 0, 0, 0.12);
            }
            
            .insight-icon {
              flex-shrink: 0;
              display: flex;
              align-items: center;
              justify-content: center;
              width: 40px;
              height: 40px;
              background: #f8f9fa;
              border-radius: 0.5rem;
              color: #666;
            }
            
            .insight-content {
              flex: 1;
              
              .insight-title {
                font-size: 0.9rem;
                font-weight: 600;
                margin-bottom: 0.25rem;
                color: #333;
              }
              
              .insight-description {
                font-size: 0.75rem;
                color: #666;
                line-height: 1.3;
              }
            }
          }
        }
        
        .future-state {
          margin-top: 1.5rem;
          text-align: center;
          
          .future-text {
            font-size: 0.9rem;
            font-style: italic;
            color: #666;
            line-height: 1.4;
            padding: 1rem;
            background: #f8f9fa;
            border-radius: 0.75rem;
            border: 1px solid rgba(0, 0, 0, 0.08);
          }
        }
      }
    }
  }


// 洞察卡片进入动画
@keyframes insightSlideIn {
  0% {
    opacity: 0;
    transform: translateX(-30px);
  }
  50% {
    opacity: 0.7;
    transform: translateX(5px);
  }
  100% {
    opacity: 1;
    transform: translateX(0);
  }
}

// 添加微妙的浮动效果
@keyframes gentleFloat {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-1px);
  }
}

.insight-card {
  &:nth-child(1) {
    animation-delay: 0.2s;
  }
  
  &:nth-child(2) {
    animation-delay: 0.4s;
  }
  
  &:nth-child(3) {
    animation-delay: 0.6s;
  }
}

.vision-header {
  animation: fadeInUp 1s ease-out both;
}

.future-state {
  animation: fadeInUp 1.2s ease-out both;
}

@keyframes fadeInUp {
  0% {
    opacity: 0;
    transform: translateY(20px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>