# 《无限大》官网效果复刻

基于 Vue 3 + TypeScript + Vite 对[《无限大》(ANANTA) 官方网站](https://ananta.163.com/)的前端效果进行复刻，仅用于编程教学。

> **本项目仅供学习、研究网页动效实现，不涉及任何商业用途，亦非官方网站。**

## 预览

滚动驱动的视差动画、视频帧同步、角色展示、图集浏览等核心视觉效果均已还原。

## 技术栈

| 类别 | 技术 |
|------|------|
| 框架 | Vue 3 `<script setup>` + TypeScript |
| 构建 | Vite 8 |
| 状态管理 | Pinia |
| 动画引擎 | GSAP 3 + ScrollTrigger |
| 平滑滚动 | Lenis |
| 样式 | SCSS（rem 响应式） |

## 实现思路

### 滚动驱动动画

采用 **固定容器 + 滚动占位** 模式：每个动画区块包含一个 `position: fixed` 的可视容器和一个透明的高度占位元素（spacer）。利用 GSAP ScrollTrigger 监听占位元素的滚动进度，将进度映射到 GSAP Timeline 上驱动所有动画。

### 视频帧同步

通过 GSAP Timeline 控制 `video.currentTime`，使视频播放进度与页面滚动位置精确绑定，而非自动播放。

### 响应式方案

沿用原站的 rem 基准策略：`1rem = 屏幕宽度 / 19.2`，即在 1920px 宽度下 `1rem = 100px`，所有尺寸以 rem 为单位，实现等比缩放。

### 角色对话气泡

还原了原站的多层容器嵌套动画：外层容器控制整体位移，内层容器控制缩放，各气泡独立控制透明度与缩放，通过 GSAP Timeline 的时间偏移精确编排时序。

### 图集交互

实现了双态交互——缩略图散列视图（鼠标视差 + 缩放）与大图浏览视图（全屏展示 + 左右切换），自定义光标跟随使用 GSAP 驱动以避免 Vue 响应式带来的延迟。

### 性能适配

自动检测设备性能等级，低性能模式下以静态图片替代视频播放，减少 GPU 负载。

## 快速开始

```bash
# 安装依赖
npm install

# 开发环境
npm run dev

# 构建生产版本
npm run build

# 预览构建产物
npm run preview
```

## 项目结构

```
src/
├── components/
│   ├── common/          # 通用组件（加载画面、弹窗等）
│   ├── gallery/         # 图集弹窗
│   ├── layout/          # 布局组件（TopBar、SideNav、FooterNav）
│   └── sections/        # 页面区块（Home、Role、Erasure、Reserve、News）
├── composables/         # 组合式函数（Lenis、性能检测等）
├── stores/              # Pinia 状态管理
├── styles/              # 全局样式、变量、字体
└── utils/               # 工具函数、视频/图片路径管理
```

## 版权声明

- 《无限大》(ANANTA) 是网易旗下 Naked Rain 工作室开发的游戏作品，游戏名称、Logo、角色形象、视频、音乐等素材的版权归**网易公司及相关权利方**所有。
- 本项目中使用的所有游戏素材（图片、视频、字体等）均来源于[官方网站](https://ananta.163.com/)，仅用于学习网页动效技术，不作任何商业用途。

## 免责声明

1. 本项目是**个人学习项目**，目的是研究和学习现代网页滚动动效的实现方式，与网易公司及 Naked Rain 工作室无任何关联，与 Apple Inc 无任何关联。
2. 本项目**不提供**任何游戏下载、账号注册、预约等服务功能。
3. 如有侵权，请联系删除。
4. 任何人不得将本项目用于商业用途或以此误导他人认为这是官方网站。

## License

本项目代码部分采用 [MIT License](https://opensource.org/licenses/MIT) 开源。游戏素材版权归原权利方所有，不在此许可范围内。
