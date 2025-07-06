const nodemailer = require('nodemailer')
require('dotenv').config()

console.log('🔍 邮件配置诊断工具')
console.log('==================')

// 检查环境变量
console.log('\n📋 环境变量检查:')
console.log('EMAIL_USER:', process.env.EMAIL_USER ? '✅ 已设置' : '❌ 未设置')
console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? '✅ 已设置' : '❌ 未设置')
console.log('PORT:', process.env.PORT || '3001 (默认)')
console.log('NODE_ENV:', process.env.NODE_ENV || 'development')

if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
  console.log('\n❌ 错误: 邮件凭据未配置')
  console.log('请按照以下步骤配置:')
  console.log('\n1. 复制环境变量文件:')
  console.log('   cp env.example .env')
  console.log('\n2. 编辑 .env 文件，填入你的Gmail信息:')
  console.log('   EMAIL_USER=your-email@gmail.com')
  console.log('   EMAIL_PASS=your-app-password')
  console.log('\n3. Gmail 配置步骤:')
  console.log('   - 登录 Gmail 账户')
  console.log('   - 开启两步验证 (必须)')
  console.log('   - 生成应用专用密码')
  console.log('   - 将应用专用密码填入 EMAIL_PASS')
  process.exit(1)
}

// 测试邮件配置
async function testEmailConfig() {
  try {
    console.log('\n📧 测试邮件配置...')
    
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    })
    
    // 验证配置
    console.log('正在验证邮件配置...')
    await transporter.verify()
    console.log('✅ 邮件配置验证成功!')
    
    // 发送测试邮件
    console.log('正在发送测试邮件...')
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: '1310569600@qq.com',
      subject: '邮件配置测试',
      text: `这是一封测试邮件，发送时间: ${new Date().toLocaleString()}`
    }
    
    const result = await transporter.sendMail(mailOptions)
    console.log('✅ 测试邮件发送成功!')
    console.log('Message ID:', result.messageId)
    console.log('收件人: 1310569600@qq.com')
    
  } catch (error) {
    console.log('\n❌ 邮件配置测试失败:')
    console.log('错误信息:', error.message)
    
    if (error.code === 'EAUTH') {
      console.log('\n🔧 认证错误解决方案:')
      console.log('1. 确保 Gmail 已开启两步验证')
      console.log('2. 生成应用专用密码 (不是普通密码)')
      console.log('3. 应用专用密码生成步骤:')
      console.log('   - 登录 Google 账户')
      console.log('   - 进入"安全性"设置')
      console.log('   - 开启"两步验证"')
      console.log('   - 生成"应用专用密码"')
      console.log('   - 选择"邮件"应用')
      console.log('   - 复制生成的16位密码')
      console.log('   - 填入 .env 文件的 EMAIL_PASS')
    }
    
    if (error.code === 'ECONNECTION') {
      console.log('\n🌐 连接错误解决方案:')
      console.log('1. 检查网络连接')
      console.log('2. 确保防火墙未阻止SMTP连接')
      console.log('3. 尝试使用其他邮件服务商')
    }
  }
}

// 运行诊断
testEmailConfig() 