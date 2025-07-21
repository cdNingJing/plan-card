import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  server: {
    port: 3000,
    open: true,
    proxy: {

      '/api/flights': {
        target: 'https://api-dev.braininc.net',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api\/flights/, '/be/svc-adapter'),
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            // 添加必要的headers
            proxyReq.setHeader('User-Agent', 'Dart/3.7 (dart:io)')
            proxyReq.setHeader('App-Build', '1251820236')
            proxyReq.setHeader('App-Version', '1.0.0')
            proxyReq.setHeader('App-Bundle', 'com.android.natural')
            proxyReq.setHeader('authorization', 'token d2708d9cd30561fd5001b449ef737a78dafd2f43')
            proxyReq.setHeader('x-brain-exec-id', '68634acf30283f0027b0a1af')
            proxyReq.setHeader('x-brain-user-address', encodeURIComponent('870 Market St #1277, San Francisco, CA 94102, USA'))
            proxyReq.setHeader('x-brain-user-lang', 'en')
            proxyReq.setHeader('x-brain-user-tz', 'Asia/Shanghai')
            proxyReq.setHeader('x-brain-user-location', '37.785834,-122.406417')
            proxyReq.setHeader('x-brain-user-country', 'CN')
            console.log('航班API代理请求:', req.method, req.url)
          })
          proxy.on('proxyRes', (proxyRes, req, res) => {
            console.log('航班API代理响应:', proxyRes.statusCode, req.url)
          })
        }
      },
      '/api/hotels': {
        target: 'https://plan-dev.api.brain.ai',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api\/hotels/, '/v1.0/invoke/composite-api/method/hotels'),
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            // 添加认证header
            proxyReq.setHeader('Authorization', 'token 7d4adce86aab3c2a281d7b15e6a82012d86bcbf6')
            console.log('酒店API代理请求:', req.method, req.url)
          })
          proxy.on('proxyRes', (proxyRes, req, res) => {
            console.log('酒店API代理响应:', proxyRes.statusCode, req.url)
          })
        }
      },
      '/api/shops': {
        target: 'https://api-dev.braininc.net/be/svc-adapter/purchasing',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/api\/shops/, '')
      },
      '/api/amazon': {
        target: 'https://api-dev.braininc.net/be/svc-adapter/amazon',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/api\/amazon/, '')
      },
      '/api/ai': {
        target: 'https://cerebras-proxy.brain.loocaa.com:1443',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api\/ai/, '/v1/chat/completions'),
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            // 确保 Authorization header 被正确转发
            if (req.headers['authorization']) {
              proxyReq.setHeader('authorization', req.headers['authorization']);
            }
            // 添加必要的headers
            proxyReq.setHeader('Accept', 'application/json');
            proxyReq.setHeader('Content-Type', 'application/json');
            console.log('AI API代理请求:', req.method, req.url)
          })
          proxy.on('proxyRes', (proxyRes, req, res) => {
            console.log('AI API代理响应:', proxyRes.statusCode, req.url)
          })
        }
      },
      '/api/claude': {
        target: 'https://anthropic-proxy.brain.loocaa.com:1443',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api\/claude/, '/v1/messages'),
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            // 确保 Authorization header 被正确转发
            if (req.headers['authorization']) {
              proxyReq.setHeader('authorization', req.headers['authorization']);
            }
            // 添加必要的headers
            proxyReq.setHeader('Accept', 'application/json');
            proxyReq.setHeader('Content-Type', 'application/json');
            console.log('Claude API代理请求:', req.method, req.url)
          })
          proxy.on('proxyRes', (proxyRes, req, res) => {
            console.log('Claude API代理响应:', proxyRes.statusCode, req.url)
          })
        }
      },
      '/echarts-svg': {
        target: 'https://echarts.apache.org',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/echarts-svg/, '/examples'),
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            // 添加必要的headers
            proxyReq.setHeader('Accept', 'image/svg+xml,text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8');
            proxyReq.setHeader('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
            console.log('ECharts SVG代理请求:', req.method, req.url)
          })
          proxy.on('proxyRes', (proxyRes, req, res) => {
            console.log('ECharts SVG代理响应:', proxyRes.statusCode, req.url)
          })
        }
      }
    }
  }
}) 