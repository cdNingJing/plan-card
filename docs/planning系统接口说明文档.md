# planning系统接口说明文档

## 概述

planning系统是一个基于AI驱动的用户界面生成系统，可以根据用户输入和上下文自动生成个性化的界面卡片。系统通过三个核心接口协同工作，为用户提供智能化的交互体验。

## 系统架构与工作流程

1. **获取建议** → 2. **生成界面** → 3. **聊天互动** → 4. **界面更新**

```
用户输入 → /planning/suggestion → 建议列表 → 用户选择 → /planning/completions → GenUI界面 → 用户交互 → /planning/chat → 上下文学习 → 界面刷新
```

## 接口调用

地址：

```
https://plan-dev.api.brain.ai/v1.0/invoke/planning-api/method
```

请求头：

```
Authorization: token 7d4adce86aab3c2a281d7b15e6a82012d86bcbf6
Content-Type: application/json'
```

## 核心接口定义

### 1. 获取建议接口 `/planning/suggestions`

**接口描述**：从聊天内容或窗口快照中提取建议，转换为可操作的项目列表

**HTTP方法**：POST
**路径**：`/ai_phone/planning/suggestions`

#### 1.1 请求参数

```json
{
  "chat_content": "string, optional - 聊天内容",
  "window_dump": "string, optional - 窗口快照内容",
  "original_description": "string, optional - 原始描述"
}
```

**参数说明**：
- `chat_content`：用户聊天内容，系统会从中提取可执行的建议
- `window_dump`：当前窗口状态快照，用于上下文分析
- `original_description`：原始描述信息
- 三个参数至少提供一个

#### 1.2 响应结果

```json
[
  {
    "key": "string - 唯一ID",
    "title": "string - 建议标题",
    "description": "string - 建议描述",
    "interactions": [
      {
        "type": "string - 交互类型",
        "title": "string - 交互标题",
        "description": "string - 交互描述",
        "value": {
          "key_info": "string - 关键信息",
          "source": "string - 建议来源 (chat_content | window_dump)",
        },
        "relation_key": "string - 关联的卡片key"
      }
    ]
  }
]
```

数据说明：

- 选择一个建议后，会将 interactions 直接传到`/planning/completions`

#### 1.3 示例

请求：

```
curl --location --request POST 'https://plan-dev.api.brain.ai/v1.0/invoke/planning-api/method/ai_phone/planning/suggestions' \
--header 'Authorization: token 7d4adce86aab3c2a281d7b15e6a82012d86bcbf6' \
--header 'Content-Type: application/json' \
--data-raw '{
    "chat_content": "Dad: Do not forget 21 June is your mom'\''s birthday! \n Me: Got it"
}'
```

响应：

```
[
    {
        "key": "a409942403ed65f06558a0887a3231fc",
        "title": "Remember Mom's Birthday",
        "description": "Ensure to remember and plan for mom's birthday on June 21.",
        "interactions": [
            {
                "type": "onSuggestion",
                "title": "Remember Mom's Birthday",
                "description": "Ensure to remember and plan for mom's birthday on June 21.",
                "value": {
                    "key_info": "Mom's birthday is on June 21; reminder from Dad.",
                    "source": "chat_content"
                },
                "relation_key": ""
            }
        ],
        "metadata": {}
    },
    {
        "key": "4e742bafbd52bdfdc4a6fbe7a9e4dfab",
        "title": "Choose a gift for Mom's Birthday",
        "description": "Choose and buy a gift for mom's birthday on June 21.",
        "interactions": [
            {
                "type": "onSuggestion",
                "title": "Choose a gift for Mom's Birthday",
                "description": "Choose and buy a gift for mom's birthday on June 21.",
                "value": {
                    "key_info": "Mom's birthday is on June 21; reminder from Dad.",
                    "source": "inferred"
                },
                "relation_key": ""
            }
        ],
        "metadata": {}
    }
]
```



### 2. 生成界面接口 `/planning/completions`

**接口描述**：基于用户交互生成GenUI界面，返回屏幕和卡片数据

**HTTP方法**：POST
**路径**：`/ai_phone/planning/completions`

#### 2.1 请求参数

```json
{
  "session_id": "string - 会话ID",
  "stream": "boolean - 是否流式返回，默认false",
  "interactions": [
    {
      "type": "string - 交互类型",
      "title": "string - 交互标题",
      "description": "string - 交互描述",
      "value": "any - 交互值，可为任意类型",
      "relation_key": "string - 关联的卡片key"
    }
  ]
}
```

**交互类型说明**：
- `onSuggestion`：选择建议
- `onTap`：点击操作
- `onOpenChat`：打开聊天
- `onLetMeLearnMyself`：自主学习
- `onAccessPermissionConfirm`：确认权限
- `onLearnContactConfirm`：确认联系人访问
- `onSaveNotes`：保存笔记

#### 2.2 响应结果

```json
{
  "session_id": "string - 会话ID",
  "screens": [
    {
      "name": "string - 屏幕名称",
      "key": "string - 屏幕唯一标识",
      "state": "string - 屏幕状态 (active|inactive)",
      "title": "string - 屏幕标题",
      "description": "string - 屏幕描述",
      "icon": "string - 图标URL",
      "focus": "string - 焦点描述",
      "interaction_value": "string - 交互值",
      "interaction_template": "string - 交互模板",
      "cards": [
        {
          "name": "string - 卡片类型名称",
          "key": "string - 卡片唯一标识",
          "state": "string - 卡片状态 (active|inactive)",
          "title": "string - 卡片标题",
          "description": "string - 卡片描述",
          "focus": "string - 卡片焦点",
          "icon": "string - 卡片图标URL",
          "interaction_value": "any - 交互值",
          "interaction_template": "string - 交互模板",
          "loading": "boolean - 是否加载中",
          "metadata": "object - 卡片特定元数据"
        }
      ]
    }
  ]
}
```

#### 2.3 示例

请求：

```
curl --location --request POST 'https://plan-dev.api.brain.ai/v1.0/invoke/planning-api/method/ai_phone/planning/completions' \
--header 'Authorization: token 7d4adce86aab3c2a281d7b15e6a82012d86bcbf6' \
--header 'Content-Type: application/json' \
--data-raw '{
    "session_id": "fffff",
    "stream": true,
    "interactions": [
        {
            "type":"onSuggestion",
            "title":"Choose a gift for Mom'\''s Birthday",
            "description": "Choose and buy a gift for mom'\''s birthday on June 21.",
            "value": {
                "key_info": "Mom'\''s birthday is on June 21; reminder from Dad.",
                "source":"inferred"
            },
            "relation_key": ""
        }
    ]
}'
```

响应：

```
data: {"session_id":"fffff","screens":[]}

data: {"session_id":"fffff","screens":[{"name":"main","key":"50176114535843cca3d5859aa66d8360","state":"active","title":"Gift Selection","description":"Main screen for mom's birthday gift selection.","icon":"","focus":"","interaction_value":"","interaction_template":"","cards":[{"name":"LearnAbout","key":"af96bcc3eacde6a797f9ec94ec654428","state":"active","title":"Learn","description":"Learn about mom's preferences and interests.","focus":"Mom's Preferences","icon":"https://dopniceu5am9m.cloudfront.net/static/planning/new_icon/learn_about.png","interaction_value":null,"interaction_template":"","loading":false,"metadata":{"state":"initial","buttons":[{"key":"019777a2-1736-bdb0-104c-44cb3111e585","title":"Tell me more about her","description":"","interactions":[{"type":"onOpenChat","title":"Tell me more about her","value":null,"description":"User clicked Tell me more about her","relation_key":"af96bcc3eacde6a797f9ec94ec654428"}]},{"key":"019777a2-1736-484b-70ff-44c288a8061d","title":"Let me learn myself","description":"","interactions":[{"type":"onLetMeLearnMyself","title":"Let me learn myself","value":null,"description":"User clicked Let me learn myself","relation_key":"af96bcc3eacde6a797f9ec94ec654428"}]}],"description":"","learn_contact":null,"access_permission":null}},{"name":"IdeaGift","key":"fa6bc56f47d1483d34d75943a4f707d4","state":"inactive","title":"Inspiration","description":"Provide gift inspiration and suggestions for mom.","focus":"Gift Suggestions","icon":"https://dopniceu5am9m.cloudfront.net/static/planning/new_icon/idea_gift.png","interaction_value":null,"interaction_template":"","loading":false,"metadata":{}},{"name":"Gift","key":"2de6973fc0ae925f598f72b3328b1202","state":"inactive","title":"Gift","description":"Selecting birthday gift for mom.","focus":"Mom's Birthday","icon":"https://dopniceu5am9m.cloudfront.net/static/planning/new_icon/gift.png","interaction_value":null,"interaction_template":"","loading":false,"metadata":{}}]}]}

data: {"session_id":"fffff","screens":[{"name":"main","key":"50176114535843cca3d5859aa66d8360","state":"active","title":"Gift Selection","description":"Main screen for mom's birthday gift selection.","icon":"","focus":"Choose a gift for Mom's Birthday","interaction_value":"","interaction_template":"","cards":[{"name":"LearnAbout","key":"af96bcc3eacde6a797f9ec94ec654428","state":"active","title":"Learn","description":"I will start to learn about her from online and local resources but will need access to some relevant apps.","focus":"Mom's Preferences","icon":"https://dopniceu5am9m.cloudfront.net/static/planning/new_icon/learn_about.png","interaction_value":null,"interaction_template":"","loading":false,"metadata":{"description":"","state":"initial","buttons":[{"key":"0197808a-6df3-3ffc-9b96-5c71fcd443de","title":"Tell me more about her","description":"","interactions":[{"type":"onOpenChat","title":"Tell me more about her","description":"User clicked Tell me more about her","value":null,"relation_key":"af96bcc3eacde6a797f9ec94ec654428"}]},{"key":"0197808a-6df3-fe08-a146-1ece6e68bfc0","title":"Let me learn myself","description":"","interactions":[{"type":"onLetMeLearnMyself","title":"Let me learn myself","description":"User clicked Let me learn myself","value":null,"relation_key":"af96bcc3eacde6a797f9ec94ec654428"}]}],"access_permission":null,"learn_contact":null}},{"name":"IdeaGift","key":"fa6bc56f47d1483d34d75943a4f707d4","state":"inactive","title":"Inspiration","description":"Provide gift inspiration and suggestions for mom.","focus":"Gift Suggestions","icon":"https://dopniceu5am9m.cloudfront.net/static/planning/new_icon/idea_gift.png","interaction_value":null,"interaction_template":"","loading":false,"metadata":{"widgets":[{"key":"e3c8b00c61a6fa693979bc4cec8f5418","title":"Gift Cards","description":"Perfect gift cards for gift giving occasions","interactions":[{"type":"onTap","title":"Favorited","description":"User favorited the gift gift cards","value":"gift cards","relation_key":"fa6bc56f47d1483d34d75943a4f707d4"}],"metadata":{"content_type":"image|video","cover_url":"https://tse2.mm.bing.net/th?id=OIP.84gDVf3mWutbNtvnt0parwHaE8&r=0&pid=Api","content_url":"https://tse2.mm.bing.net/th?id=OIP.84gDVf3mWutbNtvnt0parwHaE8&r=0&pid=Api"}}],"suggestions_title":"Suggestions","suggestions_widgets":[{"key":"f4fdd781791259a951b4c81338d77fbc","title":"Experiences","description":"Perfect experiences for gift giving occasions","interactions":[{"type":"onTap","title":"Favorited","description":"User favorited the gift experiences","value":"experiences","relation_key":"fa6bc56f47d1483d34d75943a4f707d4"}],"metadata":{"content_type":"image|video","cover_url":"https://tse4.mm.bing.net/th?id=OIP.GXPD_sXh_YEBiQbGSdMCDwHaE8&pid=Api","content_url":"https://tse4.mm.bing.net/th?id=OIP.GXPD_sXh_YEBiQbGSdMCDwHaE8&pid=Api"}},{"key":"7bc825ea799235c9b0e802b3312a4d5f","title":"Personalized Items","description":"Perfect personalized items for gift giving occasions","interactions":[{"type":"onTap","title":"Favorited","description":"User favorited the gift personalized items","value":"personalized items","relation_key":"fa6bc56f47d1483d34d75943a4f707d4"}],"metadata":{"content_type":"image|video","cover_url":"https://tse4.mm.bing.net/th?id=OIP._CGqN5YnztXMteSfeDrxRgHaHa&pid=Api","content_url":"https://tse4.mm.bing.net/th?id=OIP._CGqN5YnztXMteSfeDrxRgHaHa&pid=Api"}},{"key":"300b36f60149fb575f89fbf3a02fbacd","title":"Hobby-Related Products","description":"Perfect hobby-related products for gift giving occasions","interactions":[{"type":"onTap","title":"Favorited","description":"User favorited the gift hobby-related products","value":"hobby-related products","relation_key":"fa6bc56f47d1483d34d75943a4f707d4"}],"metadata":{"content_type":"image|video","cover_url":"https://tse1.mm.bing.net/th?id=OIP.L6--RePXU46HkJ0F6hZNngHaHa&pid=Api","content_url":"https://tse1.mm.bing.net/th?id=OIP.L6--RePXU46HkJ0F6hZNngHaHa&pid=Api"}}]}},{"name":"Gift","key":"2de6973fc0ae925f598f72b3328b1202","state":"inactive","title":"Gift","description":"Selecting birthday gift for mom.","focus":"Mom's Birthday","icon":"https://dopniceu5am9m.cloudfront.net/static/planning/new_icon/gift.png","interaction_value":null,"interaction_template":"","loading":false,"metadata":{"keywords":["Personalized Jewelry","Spa Day Gift Certificate","Gourmet Food Basket"]}}]}]}


```

####

### 3. 聊天接口 `/planning/chat`

**接口描述**：用于生成笔记和学习上下文知识

**HTTP方法**：POST
**路径**：`/ai_phone/planning/chat`

#### 3.1 请求参数

```json
{
  "session_id": "string - 会话ID",
  "stream": "boolean - 是否流式返回，默认false",
  "last_message_id": "integer, optional - 返回比此ID更新的消息",
  "query": "string, optional - 用户查询，为空时返回历史消息"
}
```

#### 3.2 响应结果

```json
{
    "messages": [
        {
            "id": "integer - 消息ID",
            "role": "string - 角色 (user|assistant)",
            "type": "string - 消息类型 (text|state)",
            "content": {
                "text": "string - 消息"
            }
        }
    ]
}
```



#### 3.2 示例

请求：

```
curl --location --request POST 'https://plan-dev.api.brain.ai/v1.0/invoke/planning-api/method/ai_phone/planning/chat' \
--header 'Authorization: token 7d4adce86aab3c2a281d7b15e6a82012d86bcbf6' \
--header 'Content-Type: application/json' \
--data-raw '{
    "session_id": "efa3b4c4-0b48-4ab9-b4b3-0d3c379f865a-061701",
    "stream": true
}'
```



响应：

```
{
    "messages": [
        {
            "id": 112680359260160,
            "role": "user",
            "type": "text",
            "content": {
                "text": "Remember Mom's Birthday"
            }
        },
        {
            "id": 112680364503040,
            "role": "assistant",
            "type": "text",
            "content": {
                "text": "I'd love to help! A great gift depends on your mom's personality, interests, and your budget. Could you tell me a bit more about her? For example:\n• What are her hobbies or favorite pastimes?\n• Does she like experiences or physical gifts?\n• Is there something she's been wanting or mentioning lately?\n• What's your budget?\nIf you're not sure, I can access other apps to collect more details about mom. Would you like to give permission?"
            }
        }
    ]
}
```



## 卡片类型定义

### 卡片类型一览表

| 卡片名称 | 英文名称 | 用途 | 主要功能 |
|---------|---------|------|----------|
| 聊天卡片 | Chat | 聊天对话 | 与AI助手进行文本对话 |
| 礼品卡片 | Gift | 礼品推荐 | 基于关键词推荐礼品选项 |
| 通用创意卡片 | Idea | 创意展示 | 展示通用创意内容和建议 |
| 礼品创意卡片 | IdeaGift | 礼品创意 | 展示礼品创意和灵感 |
| 美食创意卡片 | IdeaDish | 美食创意 | 展示菜品和美食建议 |
| 电影创意卡片 | IdeaMovie | 电影创意 | 展示电影推荐和建议 |
| 购物创意卡片 | IdeaShopping | 购物创意 | 展示购物建议和产品 |
| 学习卡片 | LearnAbout | 学习功能 | 学习用户偏好，支持权限申请 |
| 笔记卡片 | NotesAbout | 笔记功能 | 编辑和保存特定主题的笔记 |
| 联系人卡片 | Contact | 联系人管理 | 显示和管理联系人信息 |
| 航班卡片 | Flight | 航班信息 | 搜索和显示航班信息 |
| 分享卡片 | Share | 内容分享 | 支持多种风格的内容分享 |
| Yelp卡片 | Yelp | 本地服务 | 集成Yelp的本地商家推荐 |
| 最佳路线卡片 | BestRoute | 路线规划 | 显示最佳交通路线和路线详情 |
| 酒店卡片 | Hotel | 酒店预订 | 酒店查询和预订功能 |
| 日程卡片 | Schedule | 日程管理 | 日程安排和日历集成 |
| 票务卡片 | Ticket | 票务预订 | 火车票、电影票等票务购买 |
| 群组活动卡片 | GroupActivity | 群组协作 | 群组活动状态跟踪和参与管理 |
| 购物卡片 | Shopping | 购物搜索 | 基于关键词的商品搜索 |
| 完成卡片 | Completion | 任务完成 | 显示任务完成状态和后续操作 |
| 消息读取卡片 | ReadMessageWithAM | 消息处理 | 与账户管理器读取和处理消息 |

### 卡片通用字段说明

所有卡片都包含以下基础字段：

```json
{
  "name": "string - 卡片类型名称",
  "key": "string - 卡片唯一标识符",
  "state": "string - 卡片状态 (active|inactive)",
  "title": "string - 卡片标题",
  "description": "string - 卡片描述",
  "focus": "string - 卡片焦点内容",
  "icon": "string - 卡片图标URL",
  "interaction_value": "any - 交互值，可为任意类型",
  "interaction_template": "string - 交互模板",
  "loading": "boolean - 是否处于加载状态",
  "metadata": "object - 卡片特定的元数据"
}
```

### 1. Chat卡片 - 聊天功能

**用途**：提供聊天界面，用于与AI助手对话

**字段说明**：
- `knowledge_extraction_prompt`：知识提取提示文本
- `knowledge_description`：知识描述信息

```json
{
  "name": "Chat",
  "key": "8amre3O6qE22",
  "state": "inactive",
  "title": "Chat",
  "description": "聊天界面描述",
  "focus": "我想去某个地方旅行",
  "icon": "https://xxx.png",
  "interaction_value": null,
  "interaction_template": "",
  "loading": false,
  "metadata": {
    "knowledge_extraction_prompt": "string - 知识提取提示",
    "knowledge_description": "string - 知识描述"
  }
}
```

### 2. Gift卡片 - 礼品推荐

**用途**：显示和查询礼品选项

**字段说明**：
- `keywords`：礼品相关的关键词列表，用于搜索和推荐

```json
{
  "name": "Gift",
  "key": "test_gift_ard",
  "state": "active",
  "title": "礼品推荐",
  "description": "为特定场合推荐合适的礼品",
  "icon": "https://xxx.png",
  "focus": "生日礼物",
  "interaction_value": null,
  "interaction_template": "",
  "loading": false,
  "metadata": {
    "keywords": [
      "handbag",
      "shoulder bag"
    ]
  }
}
```

### 3. Idea卡片系列 - 创意展示

**用途**：展示创意内容和建议，支持图片/视频展示。包含多个子类型：
- `Idea` - 通用创意展示
- `IdeaGift` - 礼品创意
- `IdeaDish` - 美食创意
- `IdeaMovie` - 电影创意
- `IdeaShopping` - 购物创意

**字段说明**：
- `widgets`：主要展示的创意组件列表
- `suggestions_widgets`：建议区域的创意组件列表
- `suggestions_title`：建议区域标题

**组件字段说明**：
- `key`：组件唯一标识符
- `title`：组件标题
- `description`：组件描述
- `interactions`：用户可执行的交互操作列表
- `metadata.content_type`：内容类型，支持 `image` 或 `video`
- `metadata.cover_url`：封面图片URL
- `metadata.content_url`：内容资源URL

```json
{
  "name": "IdeaGift",
  "key": "test_gift_ard",
  "state": "active",
  "title": "礼品创意",
  "description": "为您推荐精心挑选的礼品创意",
  "icon": "https://xxx.png",
  "focus": "礼品灵感",
  "interaction_value": null,
  "interaction_template": "",
  "loading": false,
  "metadata": {
    "widgets": [
      {
        "key": "cd6929ae6574e4d5ea728c9d40fa95f5",
        "title": "Art Supplies",
        "description": "Perfect art supplies for gift giving occasions",
        "interactions": [
          {
            "type": "onTap",
            "title": "Favorited",
            "description": "User favorited the gift art supplies",
            "value": "art supplies",
            "relation_key": "test_gift_ard"
          }
        ],
        "metadata": {
          "content_type": "image",
          "cover_url": "https://tse1.mm.bing.net/th?id=OIP.Dn1cPiBKv9lQS5AKiErVgwHaHa&pid=Api",
          "content_url": "https://tse1.mm.bing.net/th?id=OIP.Dn1cPiBKv9lQS5AKiErVgwHaHa&pid=Api"
        }
      }
    ],
    "suggestions_title": "Suggestions",
    "suggestions_widgets": [
      {
        "key": "50a49291d52de56027390c4a461203b4",
        "title": "Drawing Tools",
        "description": "Perfect drawing tools for gift giving occasions",
        "interactions": [
          {
            "type": "onTap",
            "title": "Favorited",
            "description": "User favorited the gift drawing tools",
            "value": "drawing tools",
            "relation_key": "test_gift_ard"
          }
        ],
        "metadata": {
          "content_type": "image",
          "cover_url": "https://tse1.mm.bing.net/th?id=OIP.47iqBiSOy1w7751K5q46wgHaHa&r=0&pid=Api",
          "content_url": "https://tse1.mm.bing.net/th?id=OIP.47iqBiSOy1w7751K5q46wgHaHa&r=0&pid=Api"
        }
      }
    ]
  }
}
```

### 4. LearnAbout卡片 - 学习功能

**用途**：学习用户偏好和上下文信息，支持权限申请和联系人访问

**字段说明**：
- `description`：学习功能描述
- `state`：当前状态，可为 `initial` 或 `show_learn_contact`
- `buttons`：可操作的按钮列表
- `access_permission`：应用权限申请配置
- `learn_contact`：联系人学习配置

**按钮字段说明**：
- `key`：按钮唯一标识符
- `title`：按钮显示文本
- `description`：按钮描述
- `interactions`：点击按钮触发的交互操作

```json
{
  "name": "LearnAbout",
  "key": "LA9B2cX5pQ73",
  "state": "active",
  "title": "Learn about mom",
  "description": "了解妈妈的偏好和兴趣",
  "focus": "妈妈的偏好",
  "icon": "https://xxx.png",
  "interaction_value": null,
  "interaction_template": "",
  "loading": false,
  "metadata": {
    "description": "通过多种方式了解妈妈的喜好",
    "state": "initial",
    "buttons": [
      {
        "key": "01001",
        "title": "Tell me more about her",
        "description": "通过对话了解更多信息",
        "interactions": [
          {
            "type": "onOpenChat",
            "title": "Tell me more about her",
            "description": "User clicked Tell me more about her",
            "value": null,
            "relation_key": "LA9B2cX5pQ73"
          }
        ]
      },
      {
        "key": "01002",
        "title": "Let me learn myself",
        "description": "让系统自动学习",
        "interactions": [
          {
            "type": "onLetMeLearnMyself",
            "title": "Let me learn myself",
            "description": "User clicked Let me learn myself",
            "value": null,
            "relation_key": "LA9B2cX5pQ73"
          }
        ]
      }
    ],
    "access_permission": {
      "apps": [
        {
          "icon_url": "https://cdn-icons-png.flaticon.com/512/2111/2111728.png",
          "app_name": "LINE"
        },
        {
          "icon_url": "https://cdn-icons-png.flaticon.com/512/733/733547.png",
          "app_name": "Facebook"
        }
      ],
      "title": "Access permission",
      "subtitle": "Allow permission to access chat with mom",
      "buttons": [
        {
          "key": "01003",
          "title": "Reject",
          "interactions": [
            {
              "type": "onAccessPermissionReject",
              "title": "Reject",
              "description": "User clicked Reject",
              "value": null,
              "relation_key": "LA9B2cX5pQ73"
            }
          ]
        },
        {
          "key": "01004",
          "title": "Confirm",
          "interactions": [
            {
              "type": "onAccessPermissionConfirm",
              "title": "Confirm",
              "description": "User clicked Confirm",
              "value": null,
              "relation_key": "LA9B2cX5pQ73"
            }
          ]
        }
      ]
    },
    "learn_contact": {
      "key": "01006",
      "title": "Learn about mom",
      "description": "I will start to learn about her from online and local resources but will need access to some relevant apps.",
      "contacts": [],
      "buttons": [
        {
          "key": "01011",
          "title": "Confirm access",
          "description": "确认访问权限",
          "interactions": [
            {
              "type": "onLearnContactConfirm",
              "title": "Confirm access",
              "description": "User clicked Confirm access",
              "value": null,
              "relation_key": "LA9B2cX5pQ73"
            }
          ]
        }
      ]
    }
  }
}
```

### 5. NotesAbout卡片 - 笔记功能

**用途**：显示和编辑关于特定主题的笔记

**字段说明**：
- `onSaveNotes`：保存笔记操作的配置

```json
{
  "name": "NotesAbout",
  "key": "N9B2cX5pQ74",
  "state": "active",
  "title": "Notes about mom",
  "description": "关于妈妈的笔记",
  "icon": "https://xxx.png",
  "focus": "妈妈的笔记",
  "interaction_value": "",
  "interaction_template": "",
  "loading": false,
  "metadata": {
    "onSaveNotes": {
      "key": "01001",
      "title": "Save",
      "description": "保存笔记内容",
      "interactions": [
        {
          "type": "onSaveNotes",
          "title": "Save",
          "description": "User clicked Save",
          "value": "笔记内容将在此处传递",
          "relation_key": "N9B2cX5pQ74"
        }
      ]
    }
  }
}
```

### 6. Contact卡片 - 联系人管理

**用途**：显示和管理联系人信息

**字段说明**：
- `contacts`：联系人列表，每个联系人包含详细的个人信息

**联系人字段说明**：
- `id`：联系人ID
- `first_name`/`last_name`：姓名
- `metadata`：详细联系信息，包括电话、邮箱、地址等
- `brain_user_id`：Brain系统用户ID
- `is_brain_user`：是否为Brain系统用户

```json
{
  "name": "Contact",
  "key": "Z87T0s3STzO8",
  "state": "inactive",
  "title": "Contacts",
  "description": "联系人管理",
  "focus": "我的联系人",
  "icon": "https://xxx.png",
  "interaction_value": null,
  "interaction_template": "",
  "loading": false,
  "metadata": {
    "contacts": [
      {
        "id": 74992,
        "first_name": "Kate",
        "last_name": "Bell",
        "metadata": {
          "thumbnailPath": "",
          "identifier": "177C371E-701D-42F8-A03B-C61CA31627F6",
          "recordID": "177C371E-701D-42F8-A03B-C61CA31627F6",
          "hasThumbnail": false,
          "givenName": "Kate",
          "emailAddresses": [
            {
              "email": "kate-bell@mac.com",
              "label": "工作"
            }
          ],
          "jobTitle": "Producer",
          "company": "Creative Consulting",
          "middleName": "",
          "familyName": "Bell",
          "phoneNumbers": [
            {
              "number": "(555) 564-8583",
              "label": "手机"
            },
            {
              "number": "(415) 555-3695",
              "label": "主要"
            }
          ],
          "postalAddresses": [
            {
              "country": "",
              "region": "CA",
              "city": "Hillsborough",
              "label": "工作",
              "state": "CA",
              "postCode": "94010",
              "street": "165 Davis Street"
            }
          ]
        },
        "brain_user_id": null,
        "is_brain_user": false
      }
    ]
  }
}
```

### 7. Flight卡片 - 航班信息

**用途**：显示航班搜索和预订信息

**字段说明**：
- `from`/`to`：出发地和目的地机场代码
- `date`：出发日期（已弃用，使用departure_date）
- `departure_date`/`return_date`：出发和返回日期
- `adult_count`：成人乘客数量
- `cabin_class`：舱位等级

```json
{
  "name": "Flight",
  "key": "Z87T0s3STzO8",
  "state": "inactive",
  "title": "Flights",
  "description": "航班搜索和预订",
  "focus": "我想去某个地方旅行",
  "icon": "https://xxx.png",
  "interaction_value": null,
  "interaction_template": "",
  "loading": false,
  "metadata": {
    "from": "SFO",
    "to": "LAX",
    "date": null,
    "departure_date": "2025-06-03",
    "return_date": "2025-06-10",
    "adult_count": 1,
    "cabin_class": "ECONOMY"
  }
}
```

### 8. Share卡片 - 分享功能

**用途**：提供内容分享功能，支持多种分享风格

**字段说明**：
- `message`：默认分享消息
- `style_descriptors`：不同风格的分享消息模板

```json
{
  "name": "Share",
  "key": "Z87T0s3STzO8",
  "state": "inactive",
  "title": "Share",
  "description": "内容分享功能",
  "focus": "分享",
  "icon": "https://xxx.png",
  "interaction_value": null,
  "interaction_template": "",
  "loading": false,
  "metadata": {
    "message": "Hey! Want to go shopping sometime soon? Let me know when you're free!",
    "style_descriptors": [
      {
        "tag": "Casual",
        "message": "Hey! Want to go shopping sometime soon? Let me know when you're free!"
      },
      {
        "tag": "Enthusiastic",
        "message": "I was thinking it would be fun to go shopping this weekend! Are you up for it?"
      },
      {
        "tag": "Friendly",
        "message": "How about we plan a shopping trip when you're free? Let me know what you think!"
      },
      {
        "tag": "Persuasive",
        "message": "We should totally go shopping soon! It'll be a blast. What do you say?"
      }
    ]
  }
}
```

### 9. Yelp卡片 - 本地服务推荐

**用途**：集成Yelp服务，提供本地商家和服务推荐

**字段说明**：
- `term`：搜索关键词
- `location`：搜索位置

```json
{
  "name": "Yelp",
  "key": "Z87T0s3STzO8",
  "state": "inactive",
  "title": "Yelp",
  "description": "本地服务推荐",
  "focus": "Yelp本地搜索",
  "icon": "https://xxx.png",
  "interaction_value": null,
  "interaction_template": "",
  "loading": false,
  "metadata": {
    "term": "pizza",
    "location": "San Francisco"
  }
}
```

### 10. BestRoute卡片 - 最佳路线规划

**用途**：显示最佳交通路线和详细的路线信息

**字段说明**：
- `state`：卡片状态，如 `initial`
- `container`：包含路线概览信息
- `lines`：详细的路线段落信息，包括坐标、时间、交通工具等

**container字段说明**：
- `selected_route_key`：选中的路线键值
- `route`：路线概览信息（出发时间、到达时间、总时长等）
- `transportation`：交通工具列表（步行、火车等）

**lines字段说明**：
- `items`：路线段落列表，每个段落包含起点、终点、移动方式等详细信息
- `sections`：路线中的各个节点和移动段落

```json
{
  "name": "BestRoute",
  "key": "Z87T0s3S5634",
  "state": "active",
  "title": "Best route",
  "description": "最佳路线规划",
  "focus": "路线规划",
  "icon": "https://xxx.png",
  "interaction_value": "route_001",
  "interaction_template": "",
  "loading": false,
  "metadata": {
    "state": "initial",
    "container": {
      "selected_route_key": "route_001",
      "route": {
        "departure_time": "4:09 PM",
        "arrival_time": "5:34 PM",
        "total_duration": "1hr 25min",
        "departure_location": "Shibuya Station",
        "walking_time": "15 min"
      },
      "transportation": [
        {
          "type": "walk",
          "icon": "https://xxx.png",
          "primary": false
        },
        {
          "type": "train",
          "icon": "https://xxx.png",
          "primary": true
        }
      ]
    },
    "lines": {
      "items": [
        {
          "key": "line_1",
          "summary": {
            "no": "1",
            "start": {
              "type": "point",
              "coord": {"lat": 35.398667, "lon": 136.849222},
              "name": "start"
            },
            "goal": {
              "type": "point",
              "coord": {"lat": 35.441861, "lon": 136.573361},
              "name": "goal"
            }
          }
        }
      ]
    }
  }
}
```

### 11. Hotel卡片 - 酒店预订

**用途**：酒店查询和预订功能

**字段说明**：
- `params`：酒店搜索参数
- `onHotelTap`：酒店选择操作配置

**params字段说明**：
- `destination`：目的地
- `arrival_date`：入住日期
- `departure_date`：离店日期

```json
{
  "name": "Hotel",
  "key": "d59393ede27fb44b2decca4754c25d0a",
  "state": "inactive",
  "title": "Hotel",
  "description": "酒店查询和预订",
  "focus": "酒店预订",
  "icon": "https://xxx.png",
  "interaction_value": null,
  "interaction_template": "",
  "loading": false,
  "metadata": {
    "params": {
      "destination": "SFO",
      "arrival_date": "2025-07-04",
      "departure_date": "2025-07-05"
    },
    "onHotelTap": {
      "key": "b6a4cfe6c10f8f53b83a1bbbb8830431",
      "title": "Select",
      "description": "选择酒店",
      "interactions": [
        {
          "type": "onHotelTap",
          "title": "Select",
          "description": "User clicked Select",
          "value": "{{hotel名称}}",
          "relation_key": "d59393ede27fb44b2decca4754c25d0a"
        }
      ]
    }
  }
}
```

### 12. Schedule卡片 - 日程管理

**用途**：日程安排和日历集成

**字段说明**：
- `container`：日程信息容器
- `access_permission`：日历访问权限配置

**container字段说明**：
- `Text`：日程文本信息（标题、描述、时间等）
- `buttons`：操作按钮列表

```json
{
  "name": "Schedule",
  "key": "LA9B2cX5pQ45",
  "state": "active",
  "title": "Schedule",
  "description": "日程管理",
  "focus": "日程安排",
  "icon": "https://xxx.png",
  "interaction_value": null,
  "interaction_template": "",
  "loading": false,
  "metadata": {
    "state": "initial",
    "container": {
      "Text": {
        "title": "Meet up with Yuta",
        "icon": "https://xxx.png",
        "description": "Saturday, 2PM, Shinjuku Station"
      },
      "buttons": [
        {
          "key": "01001",
          "title": "Add to calendar",
          "description": "添加到日历",
          "interactions": [
            {
              "type": "onCalendar",
              "title": "Add to calendar",
              "description": "User clicked Add to calendar",
              "value": null,
              "relation_key": "LA9B2cX5pQ45"
            }
          ]
        }
      ]
    },
    "access_permission": {
      "apps": [
        {
          "icon_url": "https://ssl.gstatic.com/calendar/images/dynamiclogo_2020q4/calendar_31_2x.png",
          "app_name": "Google Calendar"
        }
      ],
      "title": "Access permission",
      "subtitle": "允许访问您的日历",
      "buttons": [
        {
          "key": "01003",
          "title": "Reject",
          "interactions": [
            {
              "type": "onAccessPermissionReject",
              "title": "Reject",
              "description": "User clicked Reject",
              "value": null,
              "relation_key": "LA9B2cX5pQ45"
            }
          ]
        },
        {
          "key": "01004",
          "title": "Confirm",
          "interactions": [
            {
              "type": "onAccessPermissionConfirm",
              "title": "Confirm",
              "description": "User clicked Confirm",
              "value": null,
              "relation_key": "LA9B2cX5pQ45"
            }
          ]
        }
      ]
    }
  }
}
```

### 13. Ticket卡片 - 票务预订

**用途**：火车票、电影票等票务购买

**字段说明**：
- `container`：票务信息容器
- `purchase_result`：购买结果信息

**container字段说明**：
- `tickets`：可购买的票务列表

**purchase_result字段说明**：
- `provider`：票务提供商信息
- `qr_code`：二维码信息

```json
{
  "name": "Ticket",
  "key": "T9K2L4M6N8P0",
  "state": "active",
  "title": "Ticket",
  "description": "票务预订",
  "focus": "票务购买",
  "icon": "https://xxx.png",
  "interaction_value": "ticket_001",
  "interaction_template": "",
  "loading": false,
  "metadata": {
    "state": "initial",
    "container": {
      "tickets": [
        {
          "key": "ticket_001",
          "route": "Shinkansen - Tokyo to Shinjuku",
          "date": "Apr 20",
          "time": "1:00pm",
          "train_type": "Shinkansen",
          "origin": "Tokyo",
          "destination": "Shinjuku",
          "button": {
            "key": "02001",
            "title": "Buy now",
            "description": "立即购买",
            "interactions": [
              {
                "type": "onBuyTicket",
                "title": "Buy now",
                "description": "User clicked Buy now",
                "value": "ticket_001",
                "relation_key": "T9K2L4M6N8P0"
              }
            ]
          }
        }
      ]
    },
    "purchase_result": {
      "provider": {
        "name": "JR",
        "full_name": "JR-EAST Train Reservation",
        "logo": "https://xxx.png"
      },
      "route": "Tokyo to Shinjuku",
      "date": "Apr 20",
      "time": "1:00pm",
      "qr_code": {
        "image": "https://xxx.png",
        "data": "qr_code_data"
      }
    }
  }
}
```

### 14. GroupActivity卡片 - 群组活动

**用途**：群组活动状态跟踪和参与管理

**字段说明**：
- `activity_title`：活动标题
- `scheduled_time`：计划时间
- `member_statuses`：成员状态列表

**member_statuses字段说明**：
- `name`：成员姓名
- `status`：状态（on_time、delayed、unable）
- `reason`：原因说明
- `delay_duration`：延迟时长

```json
{
  "name": "GroupActivity",
  "key": "52c4b2fd332d075fd19270c99a3ced52",
  "state": "inactive",
  "title": "Dinner Plan",
  "description": "群组活动管理",
  "focus": "活动状态跟踪",
  "icon": "https://xxx.png",
  "interaction_value": null,
  "interaction_template": "",
  "loading": false,
  "metadata": {
    "activity_title": "Family Dinner",
    "scheduled_time": "6:00 PM",
    "member_statuses": [
      {
        "name": "Mom",
        "status": "on_time",
        "reason": "",
        "delay_duration": ""
      },
      {
        "name": "Son",
        "status": "delayed",
        "reason": "something came up at work",
        "delay_duration": "30 minutes"
      },
      {
        "name": "Daughter",
        "status": "unable",
        "reason": "urgent project at work",
        "delay_duration": ""
      }
    ]
  }
}
```

### 15. Shopping卡片 - 购物搜索

**用途**：基于关键词的商品搜索

**字段说明**：
- `keywords`：搜索关键词列表

```json
{
  "name": "Shopping",
  "key": "8HA2iIz4ay61",
  "state": "active",
  "title": "Shopping",
  "description": "购物搜索",
  "focus": "商品搜索",
  "icon": "https://xxx.png",
  "interaction_value": null,
  "interaction_template": "",
  "loading": false,
  "metadata": {
    "keywords": [
      "handbag",
      "shoulder bag"
    ]
  }
}
```

### 16. Completion卡片 - 任务完成

**用途**：显示任务完成状态和后续操作

**字段说明**：
- `buttons`：后续操作按钮列表

```json
{
  "name": "Completion",
  "key": "LA9B2cX5pQ73",
  "state": "inactive",
  "title": "Completion",
  "description": "任务完成",
  "focus": "任务完成状态",
  "icon": "https://xxx.png",
  "interaction_value": null,
  "interaction_template": "",
  "loading": false,
  "metadata": {
    "buttons": [
      {
        "key": "5pQ73LA9B2cX",
        "title": "Share",
        "description": "分享结果",
        "interactions": [
          {
            "type": "onShareTap",
            "title": "Share",
            "description": "User clicked Share",
            "value": null,
            "relation_key": "LA9B2cX5pQ73"
          }
        ]
      }
    ]
  }
}
```

### 17. ReadMessageWithAM卡片 - 消息处理

**用途**：与账户管理器读取和处理消息，支持多阶段的消息学习流程

**工作流程**：
1. **权限申请** → 2. **加载聊天列表** → 3. **选择联系人** → 4. **加载聊天历史** → 5. **生成学习笔记** → 6. **完成**

**支持的交互类型**：
- `onAccessPermissionReject`：拒绝访问权限
- `onAccessPermissionConfirm`：确认访问权限
- `onContactConfirm`：确认联系人选择

**支持的消息推送类型**：
- `AMChatHistoryMsg`：请求读取聊天历史记录
- `AMSentChatMsg`：请求发送聊天消息
- `AMChatListMsg`：请求获取聊天列表
- `AMContactListMsg`：请求获取联系人列表
- `AMFinishMsg`：任务结束通知
- `PlanningReloadMsg`：请求重新加载界面
- `PlanningNotesLearningMsg`：笔记学习中状态更新
- `PlanningNotesLearnedMsg`：笔记学习完成通知
- `PlanningChatOpenMsg`：打开聊天页面
- `PlanningChatHideMsg`：隐藏聊天页面

**卡片状态说明**：
- `initial`：初始状态，显示访问权限申请界面
- `load_chat_list`：加载聊天列表状态（loading=true）
- `show_chat_list`：显示聊天列表供用户选择
- `load_chat_history`：加载选中联系人的聊天历史（loading=true）
- `learn_notes`：分析聊天内容并生成学习笔记（loading=true）
- `completed`：完成状态

**字段说明**：
- `description`：卡片描述信息
- `state`：当前卡片状态
- `access_permission`：应用访问权限配置（仅在initial状态显示）
- `contacts`：联系人选择配置（仅在show_chat_list状态显示）

**access_permission字段说明**：
- `apps`：支持的应用列表（目前支持Line和Facebook）
- `title`：权限申请标题
- `subtitle`：权限申请副标题
- `buttons`：操作按钮（拒绝/确认）

**contacts字段说明**：
- `app_info`：应用信息（图标、名称、包名）
- `selection_type`：选择类型（single单选/multiple多选）
- `contact_list`：联系人列表
- `buttons`：操作按钮（确认选择）

**contact_list中单个联系人字段说明**：
- `id`：联系人ID
- `name`：联系人名称
- `type`：联系人类型（group群组/individual个人）
- `avatar_url`：头像URL
- `is_selected`：是否被选中

#### 状态1：初始状态（权限申请）
```json
{
  "name": "ReadMessageWithAM",
  "key": "LA9B2cX5pud10",
  "state": "active",
  "title": "Planning trip",
  "description": "消息处理",
  "focus": "消息读取",
  "icon": "https://xxx.png",
  "interaction_value": null,
  "interaction_template": "",
  "loading": false,
  "metadata": {
    "description": "从在线和本地资源学习相关信息",
    "state": "initial",
    "access_permission": {
      "apps": [
        {
          "icon_url": "https://dopniceu5am9m.cloudfront.net/static/planning/appicon/line.png",
          "app_name": "Line",
          "package_name": "jp.naver.line.android"
        },
        {
          "icon_url": "https://dopniceu5am9m.cloudfront.net/static/planning/appicon/facebook.png",
          "app_name": "Facebook",
          "package_name": "com.facebook.katana"
        }
      ],
      "title": "Access permission",
      "subtitle": "允许访问您的消息应用",
      "buttons": [
        {
          "key": "01003",
          "title": "Reject",
          "interactions": [
            {
              "type": "onAccessPermissionReject",
              "title": "Reject",
              "description": "User clicked Reject",
              "value": null,
              "relation_key": "LA9B2cX5pud10"
            }
          ]
        },
        {
          "key": "01004",
          "title": "Confirm",
          "interactions": [
            {
              "type": "onAccessPermissionConfirm",
              "title": "Confirm",
              "description": "User clicked Confirm",
              "value": null,
              "relation_key": "LA9B2cX5pud10"
            }
          ]
        }
      ]
    },
    "contacts": null
  }
}
```

#### 状态2：加载聊天列表（loading状态）
```json
{
  "name": "ReadMessageWithAM",
  "key": "LA9B2cX5pud10",
  "state": "active",
  "title": "Planning trip",
  "description": "消息处理",
  "focus": "消息读取",
  "icon": "https://xxx.png",
  "interaction_value": null,
  "interaction_template": "",
  "loading": true,
  "metadata": {
    "description": "正在加载聊天列表...",
    "state": "load_chat_list",
    "access_permission": null,
    "contacts": null
  }
}
```

#### 状态3：显示聊天列表（联系人选择）
```json
{
  "name": "ReadMessageWithAM",
  "key": "LA9B2cX5pud10",
  "state": "active",
  "title": "Planning trip",
  "description": "消息处理",
  "focus": "消息读取",
  "icon": "https://xxx.png",
  "interaction_value": null,
  "interaction_template": "",
  "loading": false,
  "metadata": {
    "description": "请选择要分析的联系人",
    "state": "show_chat_list",
    "access_permission": null,
    "contacts": {
      "app_info": {
        "icon_url": "https://dopniceu5am9m.cloudfront.net/static/planning/appicon/line.png",
        "app_name": "Line",
        "package_name": "jp.naver.line.android"
      },
      "title": "Select Contact",
      "subtitle": "选择要分析聊天记录的联系人",
      "selection_type": "single",
      "contact_list": [
        {
          "id": "contact_001",
          "name": "Chat group 1",
          "type": "group",
          "avatar_url": "",
          "is_selected": true
        },
        {
          "id": "contact_002",
          "name": "Mom",
          "type": "individual",
          "avatar_url": "",
          "is_selected": false
        }
      ],
      "buttons": [
        {
          "key": "01005",
          "title": "Confirm",
          "interactions": [
            {
              "type": "onContactConfirm",
              "title": "Confirm Contact Selection",
              "description": "User confirmed contact selection",
              "value": "Chat group 1",
              "relation_key": "LA9B2cX5pud10"
            }
          ]
        }
      ]
    }
  }
}
```

#### 状态4：加载聊天历史（loading状态）
```json
{
  "name": "ReadMessageWithAM",
  "key": "LA9B2cX5pud10",
  "state": "active",
  "title": "Planning trip",
  "description": "消息处理",
  "focus": "消息读取",
  "icon": "https://xxx.png",
  "interaction_value": null,
  "interaction_template": "",
  "loading": true,
  "metadata": {
    "description": "正在加载聊天历史记录...",
    "state": "load_chat_history",
    "access_permission": null,
    "contacts": null
  }
}
```

#### 状态5：生成学习笔记（loading状态）
```json
{
  "name": "ReadMessageWithAM",
  "key": "LA9B2cX5pud10",
  "state": "active",
  "title": "Planning trip",
  "description": "消息处理",
  "focus": "消息读取",
  "icon": "https://xxx.png",
  "interaction_value": null,
  "interaction_template": "",
  "loading": true,
  "metadata": {
    "description": "正在分析聊天内容并生成学习笔记...",
    "state": "learn_notes",
    "access_permission": null,
    "contacts": null
  }
}
```

#### 状态6：完成状态
```json
{
  "name": "ReadMessageWithAM",
  "key": "LA9B2cX5pud10",
  "state": "active",
  "title": "Planning trip",
  "description": "消息处理",
  "focus": "消息读取",
  "icon": "https://xxx.png",
  "interaction_value": null,
  "interaction_template": "",
  "loading": false,
  "metadata": {
    "description": "学习笔记已生成完成",
    "state": "completed",
    "access_permission": null,
    "contacts": null
  }
}
```

**交互流程说明**：
1. 用户首次进入卡片时，显示权限申请界面，需要用户确认访问Line或Facebook等应用的权限
2. 用户点击"Confirm"确认权限后，卡片进入loading状态，开始加载用户的聊天列表
3. 聊天列表加载完成后，显示联系人选择界面，用户可以选择要分析的联系人或群组
4. 用户选择联系人并点击"Confirm"后，卡片再次进入loading状态，加载该联系人的聊天历史记录
5. 聊天历史加载完成后，系统自动进入学习笔记生成阶段（loading状态），分析聊天内容
6. 学习笔记生成完成后，卡片显示完成状态，并触发整个界面的重新加载

**技术实现要点**：
- 卡片支持多种异步任务（加载聊天列表、加载聊天历史、生成学习笔记）
- 使用loading状态提供用户反馈
- 通过消息推送机制实现状态同步
- 支持任务失败重试机制
- 自动检测已有数据，避免重复加载

## Natural 与 Planning-api 的对接说明

### 对接架构

```
ActionModel ←→ Natural ←→ Planning-api ←→ MindSystem
```

系统包含四个主要组件：
- **ActionModel**：负责设备聊天记录的读取和管理
- **Natural**：前端界面，负责用户交互和消息中转
- **Planning-api**：后端API，负责业务逻辑和数据处理
- **MindSystem**：智能对话系统，负责消息生成和学习

### 1. 消息监听和处理

Natural 需要监听并处理以下从 Planning-api 推送的消息：

#### AMChatHistoryMsg - 获取聊天记录
```json
{
  "type": "AMChatHistoryMsg",
  "package_name": "jp.naver.line.android",
  "session_id": "string",
  "task_id": "string",
  "data": {
    "chat_name": "string",
    "screen_count": "integer"
  }
}
```

**Natural 处理逻辑**：
- 接收此消息后，Natural 需要通知 ActionModel 读取聊天记录
- ActionModel 读取指定 `package_name` 和 `chat_name` 的聊天记录
- 需要抓取指定数量的屏幕（`screen_count`）
- ActionModel 将聊天记录返回给 Natural
- Natural 将聊天记录通过 `/remote/im_chat_history/save_part` 接口回传给 Planning-api

#### AMSentChatMsg - 发送消息到聊天应用
```json
{
  "type": "AMSentChatMsg",
  "package_name": "jp.naver.line.android",
  "session_id": "string",
  "task_id": "string",
  "data": {
    "chat_name": "string",
    "message_list": ["string"]
  }
}
```

**Natural 处理逻辑**：
- 接收此消息后，Natural 需要通知 ActionModel 发送消息给指定联系人
- ActionModel 发送消息列表中的所有消息到指定的聊天
- 发送完成后，ActionModel 开始定时读取聊天记录（每隔3秒）
- 读取到新的聊天记录后，通过 Natural 回传给 Planning-api

#### AMChatListMsg - 获取聊天列表
```json
{
  "type": "AMChatListMsg",
  "package_name": "jp.naver.line.android",
  "session_id": "string",
  "task_id": "string",
  "data": {
    "screen_count": "integer"
  }
}
```

**Natural 处理逻辑**：
- 接收此消息后，Natural 需要通知 ActionModel 获取聊天列表
- ActionModel 读取指定应用的聊天列表，抓取指定数量的屏幕
- 将聊天列表通过 `/remote/im_chat_list/save_part` 接口回传给 Planning-api

#### AMContactListMsg - 获取联系人列表
```json
{
  "type": "AMContactListMsg",
  "package_name": "jp.naver.line.android",
  "session_id": "string",
  "task_id": "string",
  "data": {
    "screen_count": "integer"
  }
}
```

**Natural 处理逻辑**：
- 接收此消息后，Natural 需要通知 ActionModel 获取联系人列表
- ActionModel 读取指定应用的联系人列表，抓取指定数量的屏幕
- 将联系人列表回传给 Planning-api

#### AMFinishMsg - 结束通知
```json
{
  "type": "AMFinishMsg",
  "package_name": "jp.naver.line.android",
  "session_id": "string",
  "task_id": "string"
}
```

**Natural 处理逻辑**：
- 接收此消息后，Natural 需要通知 ActionModel 结束相关任务
- 清理相关资源和状态

#### PlanningReloadMsg - 界面重新加载消息
```json
{
  "type": "PlanningReloadMsg",
  "session_id": "string",
  "interactions": [
    {
      "type": "string",
      "title": "string",
      "description": "string",
      "value": "any",
      "relation_key": "string"
    }
  ]
}
```

**Natural 处理逻辑**：
- 接收此消息后，Natural 需要重新调用 `/planning/completions` 接口
- 如果包含 `interactions`，则使用这些交互信息调用接口
- 获取更新后的界面数据并刷新显示

#### PlanningNotesLearningMsg - 笔记学习中
```json
{
  "type": "PlanningNotesLearningMsg",
  "session_id": "string",
  "notes": "string",
  "card_key": "string"
}
```

**Natural 处理逻辑**：
- 接收此消息后，局部更新指定卡片的 notes 内容
- 显示学习进度状态

#### PlanningNotesLearnedMsg - 笔记学习完成
```json
{
  "type": "PlanningNotesLearnedMsg",
  "session_id": "string",
  "notes": "string"
}
```

**Natural 处理逻辑**：
- 接收此消息后，更新 notes 内容
- 标记学习完成状态

#### PlanningChatOpenMsg - 打开聊天页面
```json
{
  "type": "PlanningChatOpenMsg",
  "session_id": "string"
}
```

**Natural 处理逻辑**：
- 接收此消息后，打开聊天界面页面

#### PlanningChatHideMsg - 隐藏聊天页面
```json
{
  "type": "PlanningChatHideMsg",
  "session_id": "string"
}
```

**Natural 处理逻辑**：
- 接收此消息后，隐藏聊天界面页面

### 2. 接口调用规范

#### 聊天记录回传接口
```
POST /remote/im_chat_history/save_part
```

**Natural 需要发送的数据格式**：
```json
{
  "account_id": "integer",
  "package_name": "string",
  "chat_name": "string",
  "session_id": "string",
  "messages": [
    {
      "id": "string",
      "content": "string",
      "sender": "string",
      "timestamp": "string",
      "message_type": "text|image|file"
    }
  ]
}
```

#### 聊天列表回传接口
```
POST /remote/im_chat_list/save_part
```

**Natural 需要发送的数据格式**：
```json
{
  "account_id": "integer",
  "package_name": "string",
  "session_id": "string",
  "chat_list": [
    {
      "id": "string",
      "name": "string",
      "last_message": "string",
      "timestamp": "string",
      "unread_count": "integer"
    }
  ]
}
```

### 3. ReadMessageWithAM 卡片状态处理

Natural 需要根据卡片的不同状态提供相应的用户界面：

#### 状态对应的UI处理
- `initial` → 显示权限申请界面
- `load_chat_list` → 显示加载中状态
- `show_chat_list` → 显示联系人选择界面
- `load_chat_history` → 显示加载中状态
- `learn_notes` → 显示学习笔记生成中状态
- `completed` → 显示完成状态

#### 用户交互处理
Natural 需要处理的用户交互：

1. **权限确认/拒绝**：
   ```json
   {
     "type": "onAccessPermissionConfirm", // 或 "onAccessPermissionReject"
     "title": "Confirm",
     "description": "User clicked Confirm",
     "value": null,
     "relation_key": "卡片key"
   }
   ```

2. **联系人选择确认**：
   ```json
   {
     "type": "onContactConfirm",
     "title": "Confirm Contact Selection",
     "description": "User confirmed contact selection",
     "value": "选中的联系人名称",
     "relation_key": "卡片key"
   }
   ```

#### 消息推送处理
Natural 需要将接收到的消息推送正确转发给 ActionModel：

1. **聊天历史读取请求**：
   - 接收 `AMChatHistoryMsg` 后，调用 ActionModel 的聊天记录读取功能
   - 根据 `screen_count` 抓取指定数量的屏幕截图
   - 等待 ActionModel 返回聊天记录数据
   - 将数据通过 `/remote/im_chat_history/save_part` 接口回传

2. **聊天消息发送请求**：
   - 接收 `AMSentChatMsg` 后，调用 ActionModel 的消息发送功能
   - 发送 `message_list` 中的所有消息到指定聊天
   - ActionModel 发送消息后，开始定时读取新的聊天记录
   - 新的聊天记录通过 `/remote/im_chat_history/save_part` 接口回传

3. **聊天列表获取请求**：
   - 接收 `AMChatListMsg` 后，调用 ActionModel 的聊天列表读取功能
   - 根据 `screen_count` 抓取指定数量的屏幕截图
   - 将聊天列表通过 `/remote/im_chat_list/save_part` 接口回传

4. **联系人列表获取请求**：
   - 接收 `AMContactListMsg` 后，调用 ActionModel 的联系人列表读取功能
   - 根据 `screen_count` 抓取指定数量的屏幕截图
   - 将联系人列表回传给 Planning-api

5. **任务结束通知**：
   - 接收 `AMFinishMsg` 后，通知 ActionModel 结束相关任务
   - 清理任务相关的资源和状态

6. **界面重新加载请求**：
   - 接收 `PlanningReloadMsg` 后，重新调用 `/planning/completions` 接口
   - 如果包含 `interactions`，则使用这些交互信息调用接口
   - 更新界面显示

7. **笔记学习状态更新**：
   - 接收 `PlanningNotesLearningMsg` 后，局部更新指定卡片的 notes 内容
   - 显示学习进度状态
   - 接收 `PlanningNotesLearnedMsg` 后，更新完整的 notes 内容并标记完成

8. **聊天界面控制**：
   - 接收 `PlanningChatOpenMsg` 后，打开聊天界面页面
   - 接收 `PlanningChatHideMsg` 后，隐藏聊天界面页面

### 4. 设备功能集成要求

#### Natural 需要实现的功能：

##### 消息中转
- 接收来自 Planning-api 的各种消息推送
- 将消息转发给 ActionModel 处理
- 将 ActionModel 的处理结果回传给 Planning-api

##### 界面状态管理
- 根据卡片状态显示相应的用户界面
- 处理用户交互事件
- 维护会话状态

#### ActionModel 需要实现的功能：

##### 应用权限检查
- 检查是否有读取指定应用（Line、Facebook等）的权限
- 动态申请相关权限

##### 屏幕抓取功能
- 根据 `screen_count` 参数抓取指定数量的屏幕截图
- 支持多屏幕滚动抓取
- 解析屏幕内容获取结构化数据

##### 聊天记录读取
- 读取指定应用的聊天列表
- 读取指定联系人的聊天历史记录
- 支持按时间范围过滤（通常读取最近7天的记录）
- 支持定时读取聊天记录（每隔3秒）

##### 联系人管理
- 读取指定应用的联系人列表
- 支持联系人信息的结构化解析

##### 消息发送功能
- 发送消息到指定的聊天应用
- 支持发送消息列表中的多条消息
- 支持发送文本消息到指定联系人
- 发送后自动开始监听新消息

##### 任务管理
- 支持任务的开始、执行和结束
- 清理任务相关的资源和状态
- 支持任务状态的跟踪和报告

##### 数据格式转换
- 将设备原生的聊天记录格式转换为 Planning-api 要求的格式
- 处理不同消息类型（文本、图片、文件等）
- 支持屏幕截图内容的结构化解析

这些对接要点确保了 Natural 和 ActionModel 能够正确地与 Planning-api 协同工作，实现完整的消息读取、发送和学习功能。

## 使用场景示例

### 场景1：为妈妈选择生日礼物

1. **获取建议**：用户输入"Choose a gift for Mom's Birthday"
2. **生成界面**：系统返回包含LearnAbout、IdeaGift、Gift三个卡片的界面
3. **学习过程**：用户通过LearnAbout卡片学习妈妈的偏好
4. **获取创意**：IdeaGift卡片展示礼品创意和建议
5. **最终选择**：Gift卡片提供具体的礼品选项

### 场景2：旅行规划

1. **输入需求**：用户表达旅行意愿
2. **生成界面**：系统返回包含Idea、Flight、Chat等卡片
3. **获取灵感**：Idea卡片展示目的地建议
4. **查询航班**：Flight卡片提供航班信息
5. **深度咨询**：Chat卡片支持详细的旅行规划对话

## 技术要点

### 状态管理
- **active**：当前激活的卡片，用户正在交互
- **inactive**：非激活状态，但可见可交互
- **loading**：加载中状态，显示进度指示器

### 交互机制
- 每个交互都包含`type`、`title`、`description`、`value`、`relation_key`
- `relation_key`用于关联具体的卡片或组件
- 系统根据交互类型执行相应的业务逻辑

### 会话管理
- 使用`session_id`维护用户会话状态
- 支持流式响应，提供实时的用户体验
- 会话状态在多个接口间共享和传递

## 交互类型定义

### 标准交互类型

系统支持以下标准交互类型，每种交互类型对应不同的用户操作：

| 交互类型 | 描述 | 适用场景 | 参数说明 |
|---------|------|----------|----------|
| `onSuggestion` | 选择建议 | 用户从建议列表中选择一个项目 | value: 建议的详细信息 |
| `onTap` | 点击操作 | 用户点击卡片中的某个元素 | value: 点击的元素值 |
| `onOpenChat` | 打开聊天 | 打开聊天界面与AI对话 | value: 通常为null |
| `onLetMeLearnMyself` | 自主学习 | 触发系统自动学习用户偏好 | value: 通常为null |
| `onAccessPermissionConfirm` | 确认权限 | 用户确认应用访问权限 | value: 通常为null |
| `onAccessPermissionReject` | 拒绝权限 | 用户拒绝应用访问权限 | value: 通常为null |
| `onLearnContactConfirm` | 确认联系人访问 | 确认访问联系人信息 | value: 通常为null |
| `onSaveNotes` | 保存笔记 | 保存用户编辑的笔记内容 | value: 笔记文本内容 |
| `onCalendar` | 日历操作 | 添加事件到日历 | value: 日历事件信息 |
| `onBuyTicket` | 购买票务 | 购买车票、电影票等 | value: 票务信息 |
| `onHotelTap` | 选择酒店 | 用户选择酒店 | value: 酒店名称或ID |
| `onShareTap` | 分享操作 | 分享内容或结果 | value: 分享的内容 |
| `onContactConfirm` | 确认联系人 | 确认联系人选择 | value: 联系人信息 |

### 交互对象结构

每个交互对象包含以下字段：

```json
{
  "type": "string - 交互类型",
  "title": "string - 交互标题",
  "description": "string - 交互描述",
  "value": "any - 交互值，根据类型而定",
  "relation_key": "string - 关联的卡片或组件key"
}
```

**字段说明**：
- `type`：交互类型，必须是上表中定义的类型之一
- `title`：用户界面显示的交互标题
- `description`：交互的详细描述，用于日志和调试
- `value`：交互携带的数据，类型根据具体交互而定
- `relation_key`：关联的卡片或组件的唯一标识符

## AI工具集成指南

### 1. 自动化应用生成
基于本文档，AI工具可以：
- 解析用户需求，调用suggestion接口获取建议
- 根据用户选择，调用completions接口生成界面
- 实现各类卡片的UI渲染和交互逻辑
- 集成chat接口提供智能对话功能

### 2. 数据模型映射
- 严格按照定义的JSON Schema生成数据结构
- 确保所有必填字段的完整性
- 正确处理optional字段的null值情况

### 3. 用户体验优化
- 实现loading状态的视觉反馈
- 支持流式响应的渐进式渲染
- 提供友好的错误处理和重试机制

### 4. 开发注意事项
- 所有卡片都必须包含通用字段
- 交互类型必须严格按照定义使用
- metadata字段根据不同卡片类型有不同的结构
- 图标URL和内容URL需要确保可访问性
- 联系人数据结构与Brain系统API保持一致

