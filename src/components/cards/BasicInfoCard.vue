<template>
  <div class="basic-info-card">
    <div class="card-header">
      <h3>{{ config.title || '基础信息' }}</h3>
      <p>{{ config.description || '请填写以下信息以便为您制定更精准的计划' }}</p>
    </div>
    
    <div class="info-form">
      <div 
        v-for="field in displayFields" 
        :key="field.key"
        class="form-field"
      >
        <label :for="field.key" class="field-label">
          {{ field.label }}
          <span v-if="field.required" class="required">*</span>
        </label>
        
        <!-- 文本输入框 -->
        <input
          v-if="field.type === 'text'"
          :id="field.key"
          v-model="formData[field.key]"
          :placeholder="field.placeholder"
          :required="field.required"
          class="field-input"
          type="text"
          @input="handleInputChange(field.key, $event.target.value)"
        />
        
        <!-- 数字输入框 -->
        <input
          v-else-if="field.type === 'number'"
          :id="field.key"
          v-model="formData[field.key]"
          :placeholder="field.placeholder"
          :required="field.required"
          :min="field.min"
          :max="field.max"
          class="field-input"
          type="number"
          @input="handleInputChange(field.key, $event.target.value)"
        />
        
        <!-- 日期输入框 -->
        <input
          v-else-if="field.type === 'date'"
          :id="field.key"
          v-model="formData[field.key]"
          :required="field.required"
          :min="field.min"
          :max="field.max"
          class="field-input"
          type="date"
          @input="handleInputChange(field.key, $event.target.value)"
        />
        
        <!-- 时间输入框 -->
        <input
          v-else-if="field.type === 'time'"
          :id="field.key"
          v-model="formData[field.key]"
          :required="field.required"
          class="field-input"
          type="time"
          @input="handleInputChange(field.key, $event.target.value)"
        />
        
        <!-- 下拉选择框 -->
        <select
          v-else-if="field.type === 'select'"
          :id="field.key"
          v-model="formData[field.key]"
          :required="field.required"
          class="field-input"
          @change="handleInputChange(field.key, $event.target.value)"
        >
          <option value="">{{ field.placeholder }}</option>
          <option 
            v-for="option in field.options" 
            :key="option.value"
            :value="option.value"
          >
            {{ option.label }}
          </option>
        </select>
        
        <!-- 多行文本框 -->
        <textarea
          v-else-if="field.type === 'textarea'"
          :id="field.key"
          v-model="formData[field.key]"
          :placeholder="field.placeholder"
          :required="field.required"
          :rows="field.rows || 3"
          class="field-input field-textarea"
          @input="handleInputChange(field.key, $event.target.value)"
        ></textarea>
        
        <!-- 范围滑块 -->
        <div v-else-if="field.type === 'range'" class="range-field">
          <input
            :id="field.key"
            v-model="formData[field.key]"
            :min="field.min"
            :max="field.max"
            :step="field.step || 1"
            class="field-range"
            type="range"
            @input="handleInputChange(field.key, $event.target.value)"
          />
          <div class="range-value">
            {{ formatRangeValue(formData[field.key], field) }}
          </div>
        </div>
        
        <!-- 多选框组 -->
        <div v-else-if="field.type === 'checkbox'" class="checkbox-group">
          <label 
            v-for="option in field.options" 
            :key="option.value"
            class="checkbox-item"
          >
            <input
              v-model="formData[field.key]"
              :value="option.value"
              type="checkbox"
              class="checkbox-input"
              @change="handleInputChange(field.key, formData[field.key])"
            />
            <span class="checkbox-label">{{ option.label }}</span>
          </label>
        </div>
        
        <!-- 单选框组 -->
        <div v-else-if="field.type === 'radio'" class="radio-group">
          <label 
            v-for="option in field.options" 
            :key="option.value"
            class="radio-item"
          >
            <input
              v-model="formData[field.key]"
              :value="option.value"
              type="radio"
              class="radio-input"
              @change="handleInputChange(field.key, $event.target.value)"
            />
            <span class="radio-label">{{ option.label }}</span>
          </label>
        </div>
        

      </div>
    </div>
    
    <div class="card-actions">
      <div class="save-status">
        <span v-if="isSaving" class="saving-indicator">
          <span class="saving-dot"></span>
          正在保存...
        </span>
        <span v-else-if="lastSaved" class="saved-indicator">
          ✓ 已保存 ({{ formatLastSaved(lastSaved) }})
        </span>
      </div>
      <button 
        @click="validateAndSubmit"
        :disabled="!isFormValid"
        class="submit-btn"
      >
        确认信息
      </button>
    </div>
    
    <!-- 验证错误提示 -->
    <div v-if="validationErrors.length > 0" class="validation-errors">
      <p class="error-title">请完善以下信息：</p>
      <ul class="error-list">
        <li v-for="error in validationErrors" :key="error" class="error-item">
          {{ error }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick, onUnmounted } from 'vue'
import { useProjectCardStore } from '@/stores/projectCardStore.js'
import { useUserInfoStore } from '@/stores/userInfoStore.js'
import { getBasicInfoFields, basicInfoFieldsConfig } from '@/config/basicInfoFields.js'

const props = defineProps({
  scenario: { type: String, default: 'general' },
  initialData: { type: Object, default: () => ({}) },
  // 支持直接传入字段配置（向后兼容）
  fields: {
    type: Array,
    default: () => []
  },
  // 支持传入完整配置
  config: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['submit', 'change', 'collapse'])

const projectCardStore = useProjectCardStore()
const userInfoStore = useUserInfoStore()

// 表单数据
const formData = ref({})
const validationErrors = ref([])

// 防抖定时器
const saveDebounceTimer = ref(null)
const autoSaveDelay = 1000 // 1秒防抖延迟

// 保存状态
const isSaving = ref(false)
const lastSaved = ref(null)

// 防抖函数
const debounce = (func, delay) => {
  return (...args) => {
    if (saveDebounceTimer.value) {
      clearTimeout(saveDebounceTimer.value)
    }
    saveDebounceTimer.value = setTimeout(() => {
      func.apply(this, args)
    }, delay)
  }
}

// 自动保存函数
const autoSave = (data) => {
  try {
    isSaving.value = true
    
    // 保存到store
    userInfoStore.updateUserInfo(props.scenario, data)
    
    // 保存到本地存储
    userInfoStore.saveToStorage()
    
    console.log(`[BasicInfoCard] ${props.scenario}场景信息已自动保存`)
    lastSaved.value = new Date()
    
    // 通知父组件数据变化
    emit('change', { 
      ...data,
      isCompleted: isCompleted.value
    })
  } catch (error) {
    console.error('[BasicInfoCard] 自动保存失败:', error)
  } finally {
    isSaving.value = false
  }
}

// 防抖后的自动保存函数
const debouncedAutoSave = debounce(autoSave, autoSaveDelay)

// 处理输入变化
const handleInputChange = (fieldKey, value) => {
  // 更新表单数据
  formData.value[fieldKey] = value
  
  // 触发防抖自动保存
  debouncedAutoSave({ ...formData.value })
}

// 计算显示的字段配置
const displayFields = computed(() => {
  console.log('[BasicInfoCard] displayFields computed, props:', {
    fields: props.fields,
    config: props.config,
    scenario: props.scenario
  })
  
  // 优先使用直接传入的字段配置（向后兼容）
  if (props.fields && Array.isArray(props.fields) && props.fields.length > 0) {
    console.log('[BasicInfoCard] 使用props.fields:', props.fields)
    return props.fields
  }
  
  // 使用配置中的字段
  if (props.config && props.config.fields && Array.isArray(props.config.fields) && props.config.fields.length > 0) {
    console.log('[BasicInfoCard] 使用props.config.fields:', props.config.fields)
    return props.config.fields
  }
  
  // 根据场景获取字段配置
  const scenarioConfig = getBasicInfoFields(props.scenario)
  console.log('[BasicInfoCard] 使用场景配置:', scenarioConfig)
  return scenarioConfig.fields || []
})

// 计算配置信息
const config = computed(() => {
  console.log('[BasicInfoCard] config computed, props.config:', props.config)
  
  // 优先使用直接传入的配置
  if (props.config && Object.keys(props.config).length > 0) {
    console.log('[BasicInfoCard] 使用props.config:', props.config)
    return props.config
  }
  
  // 根据场景获取配置
  const scenarioConfig = getBasicInfoFields(props.scenario)
  console.log('[BasicInfoCard] 使用场景配置:', scenarioConfig)
  return scenarioConfig
})

// 初始化表单数据
const initFormData = () => {
  const data = {}
  
  // 获取已保存的场景信息
  const savedInfo = userInfoStore.getScenarioInfo(props.scenario)
  
  displayFields.value.forEach(field => {
    let value = ''
    
    // 优先级：props.initialData > savedInfo > field.defaultValue > ''
    if (props.initialData[field.key] !== undefined) {
      value = props.initialData[field.key]
    } else if (savedInfo[field.key] !== undefined) {
      value = savedInfo[field.key]
    } else if (field.defaultValue !== undefined) {
      value = field.defaultValue
    }
    
    if (field.type === 'checkbox') {
      data[field.key] = Array.isArray(value) ? value : []
    } else {
      data[field.key] = value
    }
  })
  
  formData.value = data
}

// 格式化范围值显示
const formatRangeValue = (value, field) => {
  if (!value) return field.min || 0
  
  if (field.format === 'currency') {
    return `¥${value}`
  } else if (field.format === 'percentage') {
    return `${value}%`
  } else if (field.unit) {
    return `${value}${field.unit}`
  }
  return value
}

// 格式化最后保存时间
const formatLastSaved = (date) => {
  if (!date) return ''
  
  const now = new Date()
  const diff = now - date
  
  if (diff < 60000) { // 1分钟内
    return '刚刚'
  } else if (diff < 3600000) { // 1小时内
    const minutes = Math.floor(diff / 60000)
    return `${minutes}分钟前`
  } else if (diff < 86400000) { // 1天内
    const hours = Math.floor(diff / 3600000)
    return `${hours}小时前`
  } else {
    return date.toLocaleDateString()
  }
}

// 验证表单
const validateForm = () => {
  const errors = []
  
  displayFields.value.forEach(field => {
    if (field.required) {
      const value = formData.value[field.key]
      
      if (field.type === 'checkbox') {
        if (!value || value.length === 0) {
          errors.push(`请选择${field.label}`)
        }
      } else if (!value || value.toString().trim() === '') {
        errors.push(`请填写${field.label}`)
      }
    }
  })
  
  validationErrors.value = errors
  return errors.length === 0
}

// 表单是否有效
const isFormValid = computed(() => {
  return validateForm()
})

// 检查是否完成（基于必选项是否有数据）
const isCompleted = computed(() => {
  return displayFields.value.filter(field => field.required).every(field => {
    const value = formData.value[field.key]
    if (field.type === 'checkbox') {
      return value && value.length > 0
    } else {
      return value && value.toString().trim() !== ''
    }
  })
})

// 验证并提交
const validateAndSubmit = () => {
  if (validateForm()) {
    const submitData = { ...formData.value }
    
    // 清除防抖定时器
    if (saveDebounceTimer.value) {
      clearTimeout(saveDebounceTimer.value)
      saveDebounceTimer.value = null
    }
    
    // 立即保存到store和本地存储
    userInfoStore.updateUserInfo(props.scenario, submitData)
    userInfoStore.saveToStorage()
    
    console.log(`[BasicInfoCard] ${props.scenario}场景信息已保存`)
    
    emit('submit', submitData)
    
    // 提交后折叠卡片
    emit('collapse')
  }
}

// 重置表单
const resetForm = () => {
  initFormData()
  validationErrors.value = []
}

// 监听表单数据变化（移除原有的深度监听，改为手动控制）
// watch(formData, (newData) => {
//   emit('change', { ...newData })
// }, { deep: true })

// 监听完成状态变化
watch(isCompleted, (newCompleted) => {
  // 通知父组件完成状态变化
  emit('change', { 
    ...formData.value,
    isCompleted: newCompleted
  })
  
  // 保存到store和本地存储
  if (newCompleted) {
    userInfoStore.updateUserInfo(props.scenario, formData.value)
    userInfoStore.saveToStorage()
    console.log(`[BasicInfoCard] ${props.scenario}场景信息已自动保存`)
  }
})

// 监听字段配置变化，重新初始化表单
watch(displayFields, () => {
  initFormData()
}, { deep: true })

// 监听projectCardStore的变化，更新表单数据
watch(() => projectCardStore.updateVersion, (newVersion, oldVersion) => {
  if (newVersion !== oldVersion) {
    console.log('[BasicInfoCard] 检测到projectCardStore更新:', newVersion)
    
    // 查找当前场景的basic-info卡片
    const basicInfoCards = projectCardStore.getCardsByType('basic-info')
    const currentCard = basicInfoCards.find(card => 
      card.data.scenario === props.scenario
    )
    
    if (currentCard && currentCard.data.formData) {
      console.log('[BasicInfoCard] 找到匹配的卡片，更新表单数据:', currentCard.data.formData)
      Object.assign(formData.value, currentCard.data.formData)
      console.log('[BasicInfoCard] 更新后的表单数据:', formData.value)
    }
  }
}, { immediate: true })

// 监听初始数据变化，更新表单数据（保持向后兼容）
watch(() => props.initialData, (newInitialData, oldInitialData) => {
  console.log('[BasicInfoCard] 检测到initialData变化:', {
    old: oldInitialData,
    new: newInitialData,
    hasData: newInitialData && Object.keys(newInitialData).length > 0
  })
  
  if (newInitialData && Object.keys(newInitialData).length > 0) {
    console.log('[BasicInfoCard] 更新表单数据:', newInitialData)
    Object.assign(formData.value, newInitialData)
    console.log('[BasicInfoCard] 更新后的表单数据:', formData.value)
  }
}, { deep: true })

// 组件挂载时初始化
onMounted(() => {
  initFormData()
  
  // 初始化后检查完成状态
  nextTick(() => {
    if (isCompleted.value) {
      emit('change', { 
        ...formData.value,
        isCompleted: true
      })
    }
  })
})

// 组件卸载时清理定时器
onUnmounted(() => {
  if (saveDebounceTimer.value) {
    clearTimeout(saveDebounceTimer.value)
    saveDebounceTimer.value = null
  }
})

// 暴露方法给父组件
defineExpose({
  validateForm,
  resetForm,
  getFormData: () => formData.value,
  setFormData: (data) => {
    Object.assign(formData.value, data)
  }
})
</script>

<style scoped>
.basic-info-card {
  background: #FFFFFF;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.card-header {
  margin-bottom: 24px;
  text-align: center;
}

.card-header h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #333333;
  margin-bottom: 8px;
}

.card-header p {
  font-size: 0.9rem;
  color: #666666;
  line-height: 1.4;
}

.info-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.field-label {
  font-size: 0.9rem;
  font-weight: 500;
  color: #333333;
  display: flex;
  align-items: center;
  gap: 4px;
}

.required {
  color: #DC2626;
  font-weight: 600;
}

.field-input {
  padding: 12px 16px;
  border: 1px solid #E5E5E5;
  border-radius: 8px;
  font-size: 0.9rem;
  color: #333333;
  background: #FFFFFF;
  transition: border-color 0.2s;
}

.field-input:focus {
  outline: none;
  border-color: #333333;
}

.field-textarea {
  resize: vertical;
  min-height: 80px;
  font-family: inherit;
}

.range-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.field-range {
  width: 100%;
  height: 6px;
  border-radius: 3px;
  background: #E5E5E5;
  outline: none;
  appearance: none;
}

.field-range::-webkit-slider-thumb {
  appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #333333;
  cursor: pointer;
}

.field-range::-moz-range-thumb {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #333333;
  cursor: pointer;
  border: none;
}

.range-value {
  text-align: center;
  font-size: 0.9rem;
  font-weight: 500;
  color: #333333;
}

.checkbox-group,
.radio-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.checkbox-item,
.radio-item {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.checkbox-input,
.radio-input {
  width: 16px;
  height: 16px;
  cursor: pointer;
}

.checkbox-label,
.radio-label {
  font-size: 0.9rem;
  color: #333333;
  cursor: pointer;
}



.card-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 24px;
  align-items: center;
}

.save-status {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.8rem;
}

.saving-indicator {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #666666;
}

.saving-dot {
  width: 8px;
  height: 8px;
  background: #666666;
  border-radius: 50%;
  animation: pulse 1.5s infinite;
}

.saved-indicator {
  color: #059669;
  font-weight: 500;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.3;
  }
}

.submit-btn {
  padding: 12px 24px;
  background: #333333;
  color: #FFFFFF;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.submit-btn:hover:not(:disabled) {
  background: #1F1F1F;
}

.submit-btn:disabled {
  background: #CCCCCC;
  cursor: not-allowed;
}



.validation-errors {
  margin-top: 16px;
  padding: 12px;
  background: #FEF2F2;
  border: 1px solid #FECACA;
  border-radius: 8px;
}

.error-title {
  font-size: 0.9rem;
  font-weight: 500;
  color: #DC2626;
  margin-bottom: 8px;
}

.error-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.error-item {
  font-size: 0.8rem;
  color: #DC2626;
  margin-bottom: 4px;
}

.error-item:last-child {
  margin-bottom: 0;
}

</style> 