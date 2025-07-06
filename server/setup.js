const fs = require('fs')
const path = require('path')

console.log('📧 会议提醒服务器配置向导')
console.log('========================')

// 检查.env文件是否存在
const envPath = path.join(__dirname, '.env')
const envExamplePath = path.join(__dirname, 'env.example')

if (!fs.existsSync(envPath)) {
  console.log('⚠️  未找到 .env 文件，正在创建...')
  
  if (fs.existsSync(envExamplePath)) {
    fs.copyFileSync(envExamplePath, envPath)
    console.log('✅ 已创建 .env 文件')
  } else {
    console.log('❌ 未找到 env.example 文件')
    process.exit(1)
  }
} else {
  console.log('✅ .env 文件已存在')
}

console.log('\n📋 配置步骤:')
console.log('1. 编辑 .env 文件，配置以下信息:')
console.log('   EMAIL_USER=your-email@gmail.com')
console.log('   EMAIL_PASS=your-app-password')
console.log('   PORT=3001')
console.log('   NODE_ENV=development')
console.log('\n2. Gmail 配置步骤:')
console.log('   - 登录 Gmail 账户')
console.log('   - 开启两步验证')
console.log('   - 生成应用专用密码')
console.log('   - 将应用专用密码填入 EMAIL_PASS')
console.log('\n3. 测试邮件发送:')
console.log('   node test-email.js')
console.log('\n4. 启动服务器:')
console.log('   npm start')
console.log('\n📖 详细说明请查看 README.md') 