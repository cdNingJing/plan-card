/**
 * 手势交互处理模块
 * 支持触摸手势识别和处理
 */

export class GestureHandler {
  constructor(element, options = {}) {
    this.element = element
    this.options = {
      // 滑动手势阈值
      swipeThreshold: 50,
      // 滑动速度阈值
      swipeVelocityThreshold: 0.3,
      // 长按时间阈值
      longPressThreshold: 500,
      // 双击时间阈值
      doubleTapThreshold: 300,
      // 缩放手势最小变化
      scaleThreshold: 0.1,
      ...options
    }
    
    this.touchState = {
      startX: 0,
      startY: 0,
      currentX: 0,
      currentY: 0,
      startTime: 0,
      lastTapTime: 0,
      tapCount: 0,
      isDragging: false,
      isLongPress: false,
      longPressTimer: null,
      touches: []
    }
    
    this.callbacks = {
      onSwipeLeft: null,
      onSwipeRight: null,
      onSwipeUp: null,
      onSwipeDown: null,
      onTap: null,
      onDoubleTap: null,
      onLongPress: null,
      onPinch: null,
      onDragStart: null,
      onDrag: null,
      onDragEnd: null
    }
    
    this.init()
  }
  
  init() {
    if (!this.element) return
    
    // 绑定触摸事件
    this.element.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false })
    this.element.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false })
    this.element.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: false })
    this.element.addEventListener('touchcancel', this.handleTouchCancel.bind(this), { passive: false })
    
    // 绑定鼠标事件（用于桌面端测试）
    this.element.addEventListener('mousedown', this.handleMouseDown.bind(this))
    this.element.addEventListener('mousemove', this.handleMouseMove.bind(this))
    this.element.addEventListener('mouseup', this.handleMouseUp.bind(this))
    this.element.addEventListener('mouseleave', this.handleMouseLeave.bind(this))
  }
  
  // 触摸开始
  handleTouchStart(event) {
    const touch = event.touches[0]
    const now = Date.now()
    
    this.touchState.startX = touch.clientX
    this.touchState.startY = touch.clientY
    this.touchState.currentX = touch.clientX
    this.touchState.currentY = touch.clientY
    this.touchState.startTime = now
    this.touchState.isDragging = false
    this.touchState.isLongPress = false
    this.touchState.touches = Array.from(event.touches)
    
    // 检测双击
    if (now - this.touchState.lastTapTime < this.options.doubleTapThreshold) {
      this.touchState.tapCount++
    } else {
      this.touchState.tapCount = 1
    }
    
    // 设置长按定时器
    this.touchState.longPressTimer = setTimeout(() => {
      if (!this.touchState.isDragging) {
        this.touchState.isLongPress = true
        this.triggerCallback('onLongPress', {
          x: this.touchState.currentX,
          y: this.touchState.currentY
        })
      }
    }, this.options.longPressThreshold)
    
    // 多点触控处理
    if (event.touches.length > 1) {
      this.clearLongPressTimer()
    }
  }
  
  // 触摸移动
  handleTouchMove(event) {
    if (event.touches.length === 0) return
    
    const touch = event.touches[0]
    const deltaX = touch.clientX - this.touchState.startX
    const deltaY = touch.clientY - this.touchState.startY
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
    
    this.touchState.currentX = touch.clientX
    this.touchState.currentY = touch.clientY
    
    // 开始拖拽
    if (!this.touchState.isDragging && distance > 10) {
      this.touchState.isDragging = true
      this.clearLongPressTimer()
      this.triggerCallback('onDragStart', {
        startX: this.touchState.startX,
        startY: this.touchState.startY,
        currentX: this.touchState.currentX,
        currentY: this.touchState.currentY
      })
    }
    
    // 拖拽中
    if (this.touchState.isDragging) {
      this.triggerCallback('onDrag', {
        deltaX,
        deltaY,
        currentX: this.touchState.currentX,
        currentY: this.touchState.currentY
      })
    }
    
    // 多点触控缩放处理
    if (event.touches.length === 2) {
      this.handlePinchGesture(event.touches)
    }
  }
  
  // 触摸结束
  handleTouchEnd(event) {
    const deltaX = this.touchState.currentX - this.touchState.startX
    const deltaY = this.touchState.currentY - this.touchState.startY
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
    const duration = Date.now() - this.touchState.startTime
    const velocity = distance / duration
    
    this.clearLongPressTimer()
    
    // 拖拽结束
    if (this.touchState.isDragging) {
      this.triggerCallback('onDragEnd', {
        deltaX,
        deltaY,
        velocity,
        duration
      })
    }
    // 滑动手势检测
    else if (distance > this.options.swipeThreshold && velocity > this.options.swipeVelocityThreshold) {
      this.detectSwipeGesture(deltaX, deltaY, velocity)
    }
    // 点击手势检测
    else if (!this.touchState.isLongPress && distance < 10) {
      this.handleTapGesture()
    }
    
    this.touchState.lastTapTime = Date.now()
    this.resetTouchState()
  }
  
  // 触摸取消
  handleTouchCancel(event) {
    this.clearLongPressTimer()
    this.resetTouchState()
  }
  
  // 鼠标事件处理（桌面端支持）
  handleMouseDown(event) {
    const fakeTouch = {
      touches: [{
        clientX: event.clientX,
        clientY: event.clientY
      }]
    }
    this.handleTouchStart(fakeTouch)
  }
  
  handleMouseMove(event) {
    if (!this.touchState.startTime) return
    
    const fakeTouch = {
      touches: [{
        clientX: event.clientX,
        clientY: event.clientY
      }]
    }
    this.handleTouchMove(fakeTouch)
  }
  
  handleMouseUp(event) {
    if (!this.touchState.startTime) return
    this.handleTouchEnd(event)
  }
  
  handleMouseLeave(event) {
    if (!this.touchState.startTime) return
    this.handleTouchCancel(event)
  }
  
  // 检测滑动手势
  detectSwipeGesture(deltaX, deltaY, velocity) {
    const absX = Math.abs(deltaX)
    const absY = Math.abs(deltaY)
    
    if (absX > absY) {
      // 水平滑动
      if (deltaX > 0) {
        this.triggerCallback('onSwipeRight', { deltaX, deltaY, velocity })
      } else {
        this.triggerCallback('onSwipeLeft', { deltaX, deltaY, velocity })
      }
    } else {
      // 垂直滑动
      if (deltaY > 0) {
        this.triggerCallback('onSwipeDown', { deltaX, deltaY, velocity })
      } else {
        this.triggerCallback('onSwipeUp', { deltaX, deltaY, velocity })
      }
    }
  }
  
  // 处理点击手势
  handleTapGesture() {
    if (this.touchState.tapCount === 1) {
      // 延迟执行单击，等待可能的双击
      setTimeout(() => {
        if (this.touchState.tapCount === 1) {
          this.triggerCallback('onTap', {
            x: this.touchState.currentX,
            y: this.touchState.currentY
          })
        }
      }, this.options.doubleTapThreshold)
    } else if (this.touchState.tapCount === 2) {
      this.triggerCallback('onDoubleTap', {
        x: this.touchState.currentX,
        y: this.touchState.currentY
      })
      this.touchState.tapCount = 0
    }
  }
  
  // 处理缩放手势
  handlePinchGesture(touches) {
    if (touches.length !== 2) return
    
    const touch1 = touches[0]
    const touch2 = touches[1]
    const distance = Math.sqrt(
      Math.pow(touch2.clientX - touch1.clientX, 2) +
      Math.pow(touch2.clientY - touch1.clientY, 2)
    )
    
    if (this.touchState.initialPinchDistance) {
      const scale = distance / this.touchState.initialPinchDistance
      if (Math.abs(scale - 1) > this.options.scaleThreshold) {
        this.triggerCallback('onPinch', {
          scale,
          centerX: (touch1.clientX + touch2.clientX) / 2,
          centerY: (touch1.clientY + touch2.clientY) / 2
        })
      }
    } else {
      this.touchState.initialPinchDistance = distance
    }
  }
  
  // 触发回调函数
  triggerCallback(eventName, data) {
    const callback = this.callbacks[eventName]
    if (typeof callback === 'function') {
      callback(data)
    }
  }
  
  // 清除长按定时器
  clearLongPressTimer() {
    if (this.touchState.longPressTimer) {
      clearTimeout(this.touchState.longPressTimer)
      this.touchState.longPressTimer = null
    }
  }
  
  // 重置触摸状态
  resetTouchState() {
    this.touchState.isDragging = false
    this.touchState.isLongPress = false
    this.touchState.startTime = 0
    this.touchState.touches = []
    this.touchState.initialPinchDistance = null
  }
  
  // 设置事件回调
  on(eventName, callback) {
    if (this.callbacks.hasOwnProperty(`on${eventName.charAt(0).toUpperCase()}${eventName.slice(1)}`)) {
      this.callbacks[`on${eventName.charAt(0).toUpperCase()}${eventName.slice(1)}`] = callback
    }
    return this
  }
  
  // 移除事件回调
  off(eventName) {
    if (this.callbacks.hasOwnProperty(`on${eventName.charAt(0).toUpperCase()}${eventName.slice(1)}`)) {
      this.callbacks[`on${eventName.charAt(0).toUpperCase()}${eventName.slice(1)}`] = null
    }
    return this
  }
  
  // 销毁手势处理器
  destroy() {
    if (!this.element) return
    
    // 移除触摸事件
    this.element.removeEventListener('touchstart', this.handleTouchStart.bind(this))
    this.element.removeEventListener('touchmove', this.handleTouchMove.bind(this))
    this.element.removeEventListener('touchend', this.handleTouchEnd.bind(this))
    this.element.removeEventListener('touchcancel', this.handleTouchCancel.bind(this))
    
    // 移除鼠标事件
    this.element.removeEventListener('mousedown', this.handleMouseDown.bind(this))
    this.element.removeEventListener('mousemove', this.handleMouseMove.bind(this))
    this.element.removeEventListener('mouseup', this.handleMouseUp.bind(this))
    this.element.removeEventListener('mouseleave', this.handleMouseLeave.bind(this))
    
    this.clearLongPressTimer()
    this.resetTouchState()
  }
}

// 便捷函数：为元素添加滑动手势
export function addSwipeGesture(element, callbacks, options = {}) {
  const gesture = new GestureHandler(element, options)
  
  if (callbacks.onSwipeLeft) gesture.on('swipeLeft', callbacks.onSwipeLeft)
  if (callbacks.onSwipeRight) gesture.on('swipeRight', callbacks.onSwipeRight)
  if (callbacks.onSwipeUp) gesture.on('swipeUp', callbacks.onSwipeUp)
  if (callbacks.onSwipeDown) gesture.on('swipeDown', callbacks.onSwipeDown)
  
  return gesture
}

// 便捷函数：为元素添加拖拽手势
export function addDragGesture(element, callbacks, options = {}) {
  const gesture = new GestureHandler(element, options)
  
  if (callbacks.onDragStart) gesture.on('dragStart', callbacks.onDragStart)
  if (callbacks.onDrag) gesture.on('drag', callbacks.onDrag)
  if (callbacks.onDragEnd) gesture.on('dragEnd', callbacks.onDragEnd)
  
  return gesture
}

// 便捷函数：为元素添加点击手势
export function addTapGesture(element, callbacks, options = {}) {
  const gesture = new GestureHandler(element, options)
  
  if (callbacks.onTap) gesture.on('tap', callbacks.onTap)
  if (callbacks.onDoubleTap) gesture.on('doubleTap', callbacks.onDoubleTap)
  if (callbacks.onLongPress) gesture.on('longPress', callbacks.onLongPress)
  
  return gesture
}

export default GestureHandler