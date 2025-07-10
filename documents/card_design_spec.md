# 🧩 卡片设计规范

每张卡片只完成一项任务，结构统一，操作清晰。

## 📦 通用结构

| 字段名 | 类型 | 说明 |
|--------|------|------|
| `title` | string | 卡片标题，突出意图 |
| `image` | string | 展示图地址 |
| `summary` | string | 一句话解释用途 |
| `action_text` | string | 按钮文案（如“查看菜单”） |
| `action_link` | string | 点击后跳转页面路径 |

---

## 🎂 示例卡片

### 🥜 过敏对策菜单卡片

```json
{
  "title": "提供无过敏原的菜单",
  "image": "/img/allergy.jpg",
  "summary": "不含蛋奶坚果的儿童菜单推荐",
  "action_text": "查看菜单",
  "action_link": "/menu/allergy-safe"
}
