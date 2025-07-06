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
            console.log('代理请求:', req.method, req.url)
          })
          proxy.on('proxyRes', (proxyRes, req, res) => {
            console.log('代理响应:', proxyRes.statusCode, req.url)
          })
        }
      },
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
      }
    }
  }
}) 