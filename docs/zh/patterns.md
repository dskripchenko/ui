# Patterns 与 Layouts

除了原子组件外，组件库还提供两层：

- **Patterns** — 复合块：Header、Footer、Sidebar、PageHeader、EmptyState、ErrorState、Result。由组件拼装的"大砖块"。
- **Layouts** — 页面模板：Simple、Sidebar、Auth、Wizard。"整盒"的脚手架，安排 Header / Sidebar / Content / Footer 并为内容预留 slot。

思路很简单：你常常需要的是"5 分钟搭好 dashboard 布局"，而不只是 `UidButton`。Patterns 与 Layouts 正好填补这块。

## Component vs Pattern vs Layout

| 问题 | Component | Pattern | Layout |
|---|---|---|---|
| 是什么? | 原子 UI 元素 | 可识别的复合块 | 块的排列模板 |
| Slot 数量 | 0–2(default + 可选 prepend/append) | 3–6(logo、nav、actions…) | 2–4(header、sidebar、content、footer) |
| 依赖于 | 仅 token | 组件 | Patterns + 组件 |
| 例子 | `UidButton`、`UidInput` | `UidHeader`、`UidSidebar` | `UidSidebarLayout` |

**关键规则：**Patterns 与 Layouts 对使用方都是可选的。仅用原子组件也能搭页面——组件库支持这种用法。

## Patterns

每个 Pattern 解决一个典型页面任务。固定的 slot 集合，最少 props，最大化通过 slot(而非开关)做定制。

### `UidHeader` — 顶部栏

应用顶部栏。Logo 在左，导航在中，操作(资料、主题、搜索)在右。

| Slot | 用途 |
|---|---|
| `logo` | 品牌标识，回首页链接 |
| `nav` | 主菜单(`UidLink`、`UidMenu`) |
| `actions` | 右侧图标/按钮：主题、通知、资料 |
| `mobile` | 在断点以下替换 `nav` |

Props(最少)：`sticky?`、`bordered?`、`transparent?`。

### `UidFooter` — 页脚

带导航、版权、链接的页脚。

| Slot | 用途 |
|---|---|
| `default` | 简单情况下的内容 |
| `columns` | 链接列(Resources / Company / Legal) |
| `bottom` | 底部行：版权 + 社交图标 |

Props：`variant?: 'minimal' \| 'columns'`。

### `UidSidebar` — 侧边导航

垂直应用菜单。

| Slot | 用途 |
|---|---|
| `header` | 侧栏顶部：logo/品牌 |
| `nav` | 主导航(`UidSidebarItem`、`UidSidebarGroup`) |
| `footer` | 侧栏底部：资料 / 设置 / 收起 |

Props：`collapsed?`、`width?`、`position?: 'left' \| 'right'`。

子组件：`UidSidebarItem`、`UidSidebarGroup`、`UidSidebarDivider`。

### `UidPageHeader` — 页面标题

页面内容头部，带标题、描述、面包屑和操作。

| Slot | 用途 |
|---|---|
| `breadcrumb` | `UidBreadcrumb` 或自定义 |
| `title` | 标题(默认来自 `title` prop) |
| `description` | 副标题 |
| `actions` | 右对齐操作按钮 |
| `tabs` | 下方可选 `UidTabs` |

Props：`title?`、`description?`、`back?`。

### `UidEmptyState`

无数据时的回退("没有项目"、"未找到"、"从创建...开始")。

| Slot | 用途 |
|---|---|
| `illustration` | 顶部图标或插图 |
| `title` | (或 `title` prop) |
| `description` | (或 `description` prop) |
| `actions` | CTA 按钮 |

### `UidErrorState`

类似 `UidEmptyState` 但聚焦错误。默认图标警示，颜色用 `--uid-danger`。接受 `code?: '404' \| '500' \| 'network' \| string` 与 `message?: string`。

### `UidResult`

整页 success/info/warning/error 结果页。用于表单提交、支付、注册等之后的确认/错误页面。

Props：`status?`、`title?`、`description?`、`compact?: boolean`。

Slots：`icon`、`title`、`description`、`default`(附加内容)、`actions`。

## Layouts

Layout = 页面"盒子"。接收大块 slot(header、sidebar、content、footer)并排版。无业务逻辑——纯结构外壳。

### `UidSimpleLayout`

最简单的模板：垂直堆栈——header 在顶，内容居中，footer 在底。

Slots：`header`、`default`(内容)、`footer`。

```html
<UidSimpleLayout>
  <template #header>
    <UidHeader>
      <template #logo>Project</template>
      <template #nav>…</template>
    </UidHeader>
  </template>

  <main>
    <UidPageHeader title="首页" />
    …
  </main>

  <template #footer>
    <UidFooter>© 2026</UidFooter>
  </template>
</UidSimpleLayout>
```

### `UidSidebarLayout`

两栏模板：左侧固定 sidebar，右侧内容。可选顶部 header 与底部 footer。最常用的管理后台/dashboard 布局。

Slots：`sidebar`、`header?`、`default`、`footer?`。

Props：`sidebarWidth?`、`sidebarCollapsed?`、`sidebarPosition?: 'left' \| 'right'`。

行为：
- 移动端(断点以下，默认 768 px)，sidebar 折叠为 drawer，由 header 触发(via `useSidebar()`)。
- `useSidebar()` composable 让你从 layout 内任何位置访问 `collapsed`/`expanded` 状态。

### `UidAuthLayout`

登录/注册/找回密码页模板：居中全屏卡片，可选侧边插图。

Slots：`default`(表单卡片)、`aside?`、`footer?`。

Props：`variant?: 'centered' \| 'split'`。

### `UidWizardLayout`

分步流程模板(引导、多步表单、安装向导)。

| Slot | 用途 |
|---|---|
| `header` | 可选的流程标题 |
| `stepper` | 步骤指示器(默认 `UidStepper`，从 props 渲染) |
| `default` | 当前步骤内容 |
| `nav` | 上一步/下一步按钮 |

通常与 `UidWizard`(下文)配合使用，也可单独使用——layout 不强制状态管理。

## Wizards

三件套：

- `UidStepper` — 步骤指示器(水平/垂直)。可独立使用。
- `UidWizard` — 编排者：当前步骤、校验、导航。向子组件 provide context。
- `UidWizardStep` — 单步包装。订阅 context，仅当激活时渲染。可选 sync/async 校验器。

```html
<UidWizard
  :steps="[
    { id: 'profile', title: '个人资料' },
    { id: 'preferences', title: '偏好设置' },
    { id: 'review', title: '确认' },
  ]"
  @finish="onFinish"
>
  <template #default="{ current, next, prev, isFirst, isLast }">
    <UidWizardLayout>
      <template #stepper>
        <UidStepper :steps="steps" :current="current" />
      </template>

      <UidWizardStep id="profile" :validate="validateProfile">
        <ProfileForm v-model="form.profile" />
      </UidWizardStep>
      <UidWizardStep id="preferences"><PreferencesForm v-model="form.preferences" /></UidWizardStep>
      <UidWizardStep id="review"><Review :data="form" /></UidWizardStep>

      <template #nav>
        <UidButton variant="ghost" :disabled="isFirst" @click="prev">上一步</UidButton>
        <UidButton @click="next">{{ isLast ? '完成' : '下一步' }}</UidButton>
      </template>
    </UidWizardLayout>
  </template>
</UidWizard>
```

外部组件可通过 `useWizard()` 接入(例如显示当前步骤名的自定义 header)。

## 分页组件集

单一 `UidPagination` 加变体并不能覆盖所有情况——机制不同。组件库提供多个组件，各有用途。

| 组件 | UI | 何时使用 |
|---|---|---|
| `UidPagination` | `« 1 2 [3] 4 … 10 »` | 已知总数，直接跳转 |
| `UidPaginationCursor` | `← 上一页 · 下一页 →` | 基于游标(Slack、Twitter)，未知总数 |
| `UidLoadMore` | "加载更多"按钮 | feed；用户主动加载 |
| `UidInfiniteScroll` | 列表末尾的 sentinel | 无限 feed；滚动自动加载 |
| `UidPageSize` | "10 / 25 / 50"选择器 | 配合 `UidPagination` 使用 |

## 原则

1. **Slot 优先于 prop。** 如果可以放进 slot，就放。避免一堆 `showLogo` 之类的布尔开关。
2. **零业务逻辑。** Pattern 不知道路由、auth、API。router-link 通过 slot 传入；导航通过 `to` prop + `navigate` 事件。
3. **组合而非继承。** Layout = `<header-slot> + <content-slot> + <footer-slot>`。没有"页面协议"。要非标准？用组件自己拼。
4. **主题用同样的 CSS 变量。** Patterns/Layouts 不引入新的语义 token——只是本地的 `--uid-header-*`、`--uid-sidebar-*`、`--uid-layout-*`，回退到语义。
5. **合理的 a11y 骨架。** `UidSimpleLayout` 渲染真正的 `<header>`、`<main>`、`<footer>`。`UidSidebarLayout` 把 sidebar 标记为 `<aside>`。这是页面的骨架——不能偷懒。
