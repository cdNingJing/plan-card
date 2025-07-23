// 统一的身份图谱数据 - 程序员身份模拟
export const identityGraphData = {
  // 节点数据
  nodes: [
    // 核心身份节点
    {
      id: 'me',
      name: '程序员小王',
      category: 0,
      value: 100,
      symbolSize: 35,
      itemStyle: { color: '#007AFF' }
    },
    
    // 工作身份节点 - 程序员工作圈
    {
      id: 'work',
      name: '工作身份',
      category: 1,
      value: 85,
      symbolSize: 25,
      itemStyle: { color: '#34C759' }
    },
    {
      id: 'tech_lead',
      name: '技术主管',
      category: 1,
      value: 75,
      symbolSize: 20,
      itemStyle: { color: '#34C759' }
    },
    {
      id: 'senior_dev',
      name: '高级开发',
      category: 1,
      value: 65,
      symbolSize: 18,
      itemStyle: { color: '#34C759' }
    },
    {
      id: 'junior_dev',
      name: '初级开发',
      category: 1,
      value: 45,
      symbolSize: 15,
      itemStyle: { color: '#34C759' }
    },
    {
      id: 'product_manager',
      name: '产品经理',
      category: 1,
      value: 60,
      symbolSize: 17,
      itemStyle: { color: '#34C759' }
    },
    {
      id: 'ui_designer',
      name: 'UI设计师',
      category: 1,
      value: 50,
      symbolSize: 16,
      itemStyle: { color: '#34C759' }
    },
    {
      id: 'qa_engineer',
      name: '测试工程师',
      category: 1,
      value: 55,
      symbolSize: 16,
      itemStyle: { color: '#34C759' }
    },
    {
      id: 'devops_engineer',
      name: '运维工程师',
      category: 1,
      value: 40,
      symbolSize: 14,
      itemStyle: { color: '#34C759' }
    },
    
    // 家庭身份节点
    {
      id: 'family',
      name: '家庭身份',
      category: 2,
      value: 90,
      symbolSize: 25,
      itemStyle: { color: '#FF9500' }
    },
    {
      id: 'wife',
      name: '妻子小美',
      category: 2,
      value: 95,
      symbolSize: 22,
      itemStyle: { color: '#FF9500' }
    },
    {
      id: 'daughter',
      name: '女儿小糖',
      category: 2,
      value: 88,
      symbolSize: 20,
      itemStyle: { color: '#FF9500' }
    },
    {
      id: 'parents',
      name: '父母',
      category: 2,
      value: 75,
      symbolSize: 18,
      itemStyle: { color: '#FF9500' }
    },
    {
      id: 'in_laws',
      name: '岳父母',
      category: 2,
      value: 65,
      symbolSize: 16,
      itemStyle: { color: '#FF9500' }
    },
    
    // 社交身份节点 - 程序员社交圈
    {
      id: 'social',
      name: '社交身份',
      category: 3,
      value: 70,
      symbolSize: 22,
      itemStyle: { color: '#AF52DE' }
    },
    {
      id: 'tech_friend1',
      name: '技术好友A',
      category: 3,
      value: 80,
      symbolSize: 19,
      itemStyle: { color: '#AF52DE' }
    },
    {
      id: 'tech_friend2',
      name: '技术好友B',
      category: 3,
      value: 75,
      symbolSize: 18,
      itemStyle: { color: '#AF52DE' }
    },
    {
      id: 'college_friend',
      name: '大学同学',
      category: 3,
      value: 60,
      symbolSize: 15,
      itemStyle: { color: '#AF52DE' }
    },
    {
      id: 'neighbor',
      name: '邻居老王',
      category: 3,
      value: 45,
      symbolSize: 13,
      itemStyle: { color: '#AF52DE' }
    },
    {
      id: 'online_community',
      name: '技术社区',
      category: 3,
      value: 85,
      symbolSize: 20,
      itemStyle: { color: '#AF52DE' }
    },
    {
      id: 'gaming_friend',
      name: '游戏好友',
      category: 3,
      value: 55,
      symbolSize: 14,
      itemStyle: { color: '#AF52DE' }
    }
  ],

  // 基础连接数据
  baseLinks: [
    // 核心身份连接
    { source: 'me', target: 'work', value: 0.95, lineStyle: { width: 4, color: '#007AFF' } },
    { source: 'me', target: 'family', value: 0.92, lineStyle: { width: 4, color: '#007AFF' } },
    { source: 'me', target: 'social', value: 0.78, lineStyle: { width: 3, color: '#007AFF' } },
    
    // 工作身份关系 - 程序员工作环境
    { source: 'work', target: 'tech_lead', value: 0.85, lineStyle: { color: '#34C759' } },
    { source: 'work', target: 'senior_dev', value: 0.75, lineStyle: { color: '#34C759' } },
    { source: 'work', target: 'junior_dev', value: 0.65, lineStyle: { color: '#34C759' } },
    { source: 'work', target: 'product_manager', value: 0.70, lineStyle: { color: '#34C759' } },
    { source: 'work', target: 'ui_designer', value: 0.60, lineStyle: { color: '#34C759' } },
    { source: 'work', target: 'qa_engineer', value: 0.68, lineStyle: { color: '#34C759' } },
    { source: 'work', target: 'devops_engineer', value: 0.55, lineStyle: { color: '#34C759' } },
    
    // 家庭身份关系
    { source: 'family', target: 'wife', value: 0.95, lineStyle: { color: '#FF9500' } },
    { source: 'family', target: 'daughter', value: 0.90, lineStyle: { color: '#FF9500' } },
    { source: 'family', target: 'parents', value: 0.80, lineStyle: { color: '#FF9500' } },
    { source: 'family', target: 'in_laws', value: 0.70, lineStyle: { color: '#FF9500' } },
    
    // 社交身份关系 - 程序员社交特点
    { source: 'social', target: 'tech_friend1', value: 0.85, lineStyle: { color: '#AF52DE' } },
    { source: 'social', target: 'tech_friend2', value: 0.80, lineStyle: { color: '#AF52DE' } },
    { source: 'social', target: 'college_friend', value: 0.65, lineStyle: { color: '#AF52DE' } },
    { source: 'social', target: 'neighbor', value: 0.50, lineStyle: { color: '#AF52DE' } },
    { source: 'social', target: 'online_community', value: 0.90, lineStyle: { color: '#AF52DE' } },
    { source: 'social', target: 'gaming_friend', value: 0.60, lineStyle: { color: '#AF52DE' } }
  ],

  // 跨身份连接数据 - 程序员特有的跨身份关系
  crossLinks: [
    // 工作与社交的交叉
    { source: 'tech_lead', target: 'tech_friend1', value: 0.45, lineStyle: { color: '#34C759' } },
    { source: 'senior_dev', target: 'tech_friend2', value: 0.40, lineStyle: { color: '#34C759' } },
    { source: 'product_manager', target: 'online_community', value: 0.35, lineStyle: { color: '#34C759' } },
    
    // 家庭与社交的交叉
    { source: 'wife', target: 'neighbor', value: 0.55, lineStyle: { color: '#FF9500' } },
    { source: 'daughter', target: 'gaming_friend', value: 0.30, lineStyle: { color: '#FF9500' } },
    
    // 工作与家庭的交叉
    { source: 'tech_lead', target: 'wife', value: 0.25, lineStyle: { color: '#34C759' } },
    { source: 'senior_dev', target: 'parents', value: 0.20, lineStyle: { color: '#34C759' } }
  ],

  // 兴趣连接数据 - 程序员共同的兴趣爱好
  interestLinks: [
    { source: 'tech_friend1', target: 'senior_dev', value: 0.50, lineStyle: { width: 1, type: 'dashed', color: '#FF9500' } },
    { source: 'tech_friend2', target: 'junior_dev', value: 0.40, lineStyle: { width: 1, type: 'dashed', color: '#FF9500' } },
    { source: 'wife', target: 'ui_designer', value: 0.35, lineStyle: { width: 1, type: 'dashed', color: '#FF9500' } },
    { source: 'gaming_friend', target: 'qa_engineer', value: 0.45, lineStyle: { width: 1, type: 'dashed', color: '#FF9500' } },
    { source: 'online_community', target: 'devops_engineer', value: 0.55, lineStyle: { width: 1, type: 'dashed', color: '#FF9500' } }
  ],

  // 分类数据
  categories: [
    { name: '核心身份' },
    { name: '工作身份' },
    { name: '家庭身份' },
    { name: '社交身份' }
  ]
}

// 获取连接数据的函数
export function getGraphLinks(showCrossConnections = true, showInterestConnections = true) {
  const links = [...identityGraphData.baseLinks]
  
  if (showCrossConnections) {
    links.push(...identityGraphData.crossLinks)
  }
  
  if (showInterestConnections) {
    links.push(...identityGraphData.interestLinks)
  }
  
  return links
} 