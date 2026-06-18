## 1. 架构设计

```mermaid
graph TB
    A["平板端浏览器"] --> B["React 18 SPA 应用"]
    B --> C["路由层 React Router"]
    C --> D["页面层 Pages"]
    D --> E["组件层 Components"]
    E --> F["状态管理 Zustand"]
    F --> G["Mock 数据层"]
    style A fill:#e3f2fd
    style B fill:#1976d2,color:#fff
    style F fill:#ff9800
```

## 2. 技术描述

- 前端：React 18 + TypeScript + Vite + TailwindCSS 3
- 状态管理：Zustand
- 路由：React Router DOM v6
- 图标：Lucide React
- 后端：无后端，采用 Mock 数据 + localStorage 持久化
- 数据库：浏览器 localStorage 存储用户操作数据

## 3. 路由定义

| 路由 | 用途 |
|------|------|
| / | 首页看板（三大入口） |
| /events | 本周事件列表 |
| /events/:id | 事件详情页 |
| /reviews | 重点复盘列表 |
| /materials | 待补材料清单 |

## 4. 数据模型

### 4.1 数据模型定义

```mermaid
erDiagram
    EVENT ||--o{ TIMELINE_CARD : has
    EVENT ||--o{ CONCERN : has
    EVENT ||--o{ HANDOFF_NOTE : has
    EVENT {
        string id
        string title
        string level
        string status
        datetime createdAt
        datetime updatedAt
    }
    TIMELINE_CARD {
        string id
        string eventId
        string type
        string summary
        string imageUrl
        string impact
        int order
    }
    CONCERN {
        string id
        string eventId
        string content
        string category
        boolean checked
        int count
    }
    HANDOFF_NOTE {
        string id
        string eventId
        string section
        string content
        string author
        datetime createdAt
    }
```

### 4.2 核心类型定义

```typescript
type EventLevel = 'low' | 'medium' | 'high' | 'critical';
type EventStatus = 'monitoring' | 'responding' | 'resolved' | 'reviewed';
type TimelineType = 'wechat' | 'shortvideo' | 'media' | 'official';
type ConcernCategory = 'housing' | 'transport' | 'education' | 'law_enforcement' | 'environment' | 'healthcare' | 'other';
type HandoffSection = 'unverified' | 'to_contact' | 'confidential';

interface EventItem {
  id: string;
  title: string;
  level: EventLevel;
  status: EventStatus;
  createdAt: string;
  updatedAt: string;
  description: string;
}

interface TimelineCard {
  id: string;
  eventId: string;
  type: TimelineType;
  title: string;
  summary: string;
  imageNote: string;
  impact: string;
  reachCount: number;
  order: number;
}

interface ConcernItem {
  id: string;
  eventId: string;
  content: string;
  category: ConcernCategory;
  checked: boolean;
  count: number;
}

interface HandoffNote {
  id: string;
  eventId: string;
  section: HandoffSection;
  content: string;
  author: string;
  createdAt: string;
}
```
