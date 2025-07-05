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
        />
        
        <!-- 时间输入框 -->
        <input
          v-else-if="field.type === 'time'"
          :id="field.key"
          v-model="formData[field.key]"
          :required="field.required"
          class="field-input"
          type="time"
        />
        
        <!-- 下拉选择框 -->
        <select
          v-else-if="field.type === 'select'"
          :id="field.key"
          v-model="formData[field.key]"
          :required="field.required"
          class="field-input"
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
            />
            <span class="radio-label">{{ option.label }}</span>
          </label>
        </div>
        

      </div>
    </div>
    
    <div class="card-actions">
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
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import { getBasicInfoFields } from '@/config/basicInfoFields.js'
import { UserInfoStorage } from '@/utils/userInfoStorage.js'

const props = defineProps({
  // 支持直接传入字段配置（向后兼容）
  fields: {
    type: Array,
    default: () => []
  },
  // 支持传入场景类型
  scenario: {
    type: String,
    default: 'general'
  },
  // 支持传入完整配置
  config: {
    type: Object,
    default: () => ({})
  },
  // 初始数据
  initialData: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['submit', 'change', 'collapse'])

// 表单数据
const formData = ref({})
const validationErrors = ref([])

// 计算显示的字段配置
const displayFields = computed(() => {
  // 优先使用直接传入的字段配置（向后兼容）
  if (props.fields && props.fields.length > 0) {
    return props.fields
  }
  
  // 使用配置中的字段
  if (props.config.fields && props.config.fields.length > 0) {
    return props.config.fields
  }
  
  // 根据场景获取字段配置
  const scenarioConfig = getBasicInfoFields(props.scenario)
  return scenarioConfig.fields || []
})

// 计算配置信息
const config = computed(() => {
  // 优先使用直接传入的配置
  if (Object.keys(props.config).length > 0) {
    return props.config
  }
  
  // 根据场景获取配置
  return getBasicInfoFields(props.scenario)
})

// 初始化表单数据
const initFormData = () => {
  const data = {}
  
  // 获取已保存的场景信息
  const savedInfo = UserInfoStorage.getScenarioInfo(props.scenario)
  
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
    
    // 保存到本地存储
    const success = UserInfoStorage.saveScenarioInfo(props.scenario, submitData)
    if (success) {
      console.log(`${props.scenario}场景信息已保存到本地存储`)
    } else {
      console.warn(`${props.scenario}场景信息保存失败`)
    }
    
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

// 监听表单数据变化
watch(formData, (newData) => {
  emit('change', { ...newData })
}, { deep: true })

// 监听完成状态变化
watch(isCompleted, (newCompleted) => {
  console.log('完成状态变化:', newCompleted)
  
  // 通知父组件完成状态变化
  emit('change', { 
    ...formData.value,
    isCompleted: newCompleted
  })
  
  // 保存到本地存储
  if (newCompleted) {
    UserInfoStorage.saveScenarioInfo(props.scenario, formData.value)
    console.log(`${props.scenario}场景信息已自动保存到本地存储`)
  }
})

// 监听字段配置变化，重新初始化表单
watch(displayFields, () => {
  initFormData()
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
  gap: 12px;
  margin-top: 24px;
  justify-content: center;
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