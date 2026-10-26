# 视频

`UidVideo` 是基于原生 `<video>` 元素的视频播放器，使用组件库自己的控件：带缓冲区段、章节和缩略图预览的进度条，音量，速度和画质菜单，字幕，全屏和画中画。无依赖；HLS 流由一个单独的、按需懒加载的入口播放（`@dskripchenko/ui/hls`）。

```vue
<UidVideo
  src="/media/lesson.mp4"
  poster="/media/lesson.jpg"
  :tracks="[
    { src: '/media/lesson.en.vtt', srclang: 'en', label: 'English', default: true },
    { src: '/media/lesson.chapters.vtt', kind: 'chapters' },
  ]"
  thumbnails="/media/lesson.thumbs.vtt"
  resume-key="lesson-42"
/>
```

| Prop | 类型 | 默认值 | |
|---|---|---|---|
| `src` | `string` | — | 单个源 |
| `sources` | `UidMediaSource[]` | — | 按优先顺序排列的 `{ src, type?, label? }`；浏览器选用第一个能播放的。两个及以上带 `label` 的源构成画质菜单 |
| `poster` | `string` | — | 播放前显示的图片 |
| `tracks` | `UidMediaTrack[]` | `[]` | WebVTT：`{ src, kind?: 'subtitles' \| 'captions' \| 'chapters', srclang?, label?, default? }` |
| `thumbnails` | `string` | — | 其 cue 指向雪碧图切片的 WebVTT：`sprite.jpg#xywh=0,0,160,90` |
| `autoplay` | `boolean` | `false` | 尽早以静音方式开始播放（浏览器会阻止有声自动播放） |
| `muted`, `loop` | `boolean` | `false` | |
| `preload` | `'none' \| 'metadata' \| 'auto'` | `'metadata'` | |
| `controls` | `boolean` | `true` | `false` —— 使用浏览器自带控件的原始元素 |
| `crossorigin` | `'' \| 'anonymous' \| 'use-credentials'` | — | 加载其他源的字幕和缩略图时需要 |
| `exclusive` | `boolean` | `true` | 启动此播放器会暂停页面上其他独占播放器 |
| `resumeKey` | `string` | — | 在 `localStorage` 中记住播放位置并从该处继续 |
| `rates` | `number[]` | `0.5…2` | 速度菜单 |
| `hotkeys` | `boolean` | `true` | 播放器获得焦点时的键盘快捷键 |
| `aspectRatio` | `string` | `'16 / 9'` | 视频尺寸未知前容器的宽高比 |
| `title` | `string` | — | 播放器的无障碍名称 |
| `autoHide` | `number` | `2500` | 播放时无操作多少毫秒后隐藏控件 |
| `hlsOptions` | `HlsOptions` | — | 传给 HLS 适配器（见下文） |
| `hlsLoader` | `() => Promise<module>` | 动态导入 | HLS 适配器的来源 |

事件：`play`、`pause`、`ended`、`error`（`{ kind, detail? }`）、`qualitychange`（标签）、`audiotrackchange`（标签）、`chapterchange`（章节、索引）。组件对外暴露 `play()`、`pause()`、`toggle()`、`seek(seconds)`、`seekToChapter(index | title)`、`chapters`、`chapterIndex`、响应式的 `state` 以及 `media` 元素。

## 章节

章节来自 `tracks` 中 `kind: 'chapters'` 的条目（WebVTT，每个 cue 对应一章）。加载后可通过组件 ref 访问：

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { UidVideo, type UidMediaChapter } from '@dskripchenko/ui'

const player = ref<InstanceType<typeof UidVideo> | null>(null)
function onChapter(chapter: UidMediaChapter | null, index: number) { /* … */ }
</script>

<template>
  <UidVideo ref="player" :src="src" :tracks="tracks" @chapterchange="onChapter" />
  <button v-for="(c, i) in player?.chapters" :key="i" @click="player?.seekToChapter(i)">{{ c.title }}</button>
</template>
```

- `chapters` — `UidMediaChapter[]`，`{ start, end, title }`，单位为秒；VTT 未加载或没有章节轨道时为空。
- `chapterIndex` — 当前时间所在章节的索引，不在任何章节内时为 `-1`。
- `seekToChapter(index | title)` — 跳转到章节开头。标题先精确匹配，再忽略大小写匹配。没有匹配的章节时返回 `false`。
- `chapterchange` 事件 — 播放进入另一章节（或离开所有章节）时触发，参数为 `(chapter | null, index)`。

## 控件

- **进度条** —— 已播放部分使用强调色，显示缓冲区段和章节间隔；悬停时显示时间、章节标题和缩略图。拖动时实时跳转。作为 `slider`，它响应方向键（±5 秒）、Page Up/Down（±10 %）、Home/End。
- **音量** —— 按钮切换静音，滑块在悬停或聚焦时展开（触屏设备上由硬件按键负责）。
- **设置** —— 速度，以及存在多个画质时的画质（自动（`Auto`）在 HLS 下随带宽调整），以及含多条音轨的 HLS 流的音轨。菜单位于播放器内部，因此全屏时也可使用；在小尺寸播放器中会变成覆盖在视频上的面板。
- **字幕** —— 由组件库自行绘制 cue（位于控件上方，在任何视频上都清晰可读）；在 iOS 原生全屏中由系统播放器显示。
- **窄播放器** —— 控制栏随播放器自身宽度调整：小于 440 px 时字幕和画中画移入设置菜单，小于 360 px 时时间只显示当前位置。播放、设置和全屏始终保留。
- **全屏** —— 整个播放器全屏；在 iPhone 上只有 `<video>` 本身能进入全屏，此时会打开原生播放器。
- **画中画** —— 标准 API 或 Safari 的演示模式。
- **直播**流显示"直播"（`Live`）徽标而不是时间；处于直播最新位置时变为红色，点击可跳转到最新位置。

在触屏上，轻点显示或隐藏控件，双击左侧或右侧三分之一区域后退/快进 10 秒，中央按钮播放和暂停。在桌面端，单击视频播放/暂停，双击切换全屏。播放时控件在 `autoHide` 后隐藏；当菜单打开、正在拖动进度条或焦点位于控件内时保持显示。

## 键盘

| 按键 | 操作 |
|---|---|
| 空格、`K` | 播放 / 暂停 |
| ← / → | −5 秒 / +5 秒 |
| `J` / `L` | −10 秒 / +10 秒 |
| ↑ / ↓ | 音量 ±10 % |
| `M` | 静音 |
| `F` | 全屏 |
| `C` | 开启 / 关闭字幕 |
| `0`–`9` | 跳转到 0–90 % |
| Home / End | 开头 / 结尾 |

## 错误

错误显示在播放器内部，带有"重试"（Try again）按钮，并带有类型：`aborted`、`network`、`decode`、`unsupported`、`mse`、`manifest`、`encrypted`、`codec`、`unknown`。文本来自语言包 `media.errors`（见 [i18n](./i18n.md)）。404 会报告为 `network`，而不像浏览器那样报告为"不支持的格式"。某个源无法播放时，会尝试 `sources` 中的下一个。

## 格式

浏览器原生支持的格式（组件库对此不做任何额外处理）：

| 格式 | Chrome / Edge | Firefox | Safari macOS | Safari iOS |
|---|---|---|---|---|
| MP4 · H.264 + AAC | ✓ | ✓ | ✓ | ✓ |
| MP4 · HEVC | 需硬件解码 | Windows，需硬件解码 | ✓ | ✓ |
| WebM · VP9 + Opus | ✓ | ✓ | ✓ | ✓（较新版本） |
| MP4/WebM · AV1 | ✓ | ✓ | 需硬件解码 | 需硬件解码 |
| HLS (`.m3u8`) | 通过组件库的适配器；较新版本也可原生播放 | 通过组件库的适配器 | 原生 | 原生 |

已在真实浏览器中验证（Playwright）：Chromium 156、Chrome 156、WebKit 27 —— MP4 H.264/AAC、WebM VP9/Opus、HLS fMP4 和 MPEG-TS（通过适配器及原生）、AES-128、直播播放列表、不连续点、备用音轨（fMP4、MPEG-TS、packed AAC）及其切换。测试环境中没有 Firefox。

## HLS

`type: 'application/x-mpegURL'`（或 `.m3u8` 地址）的源通过 `@dskripchenko/ui/hls` 播放。适配器是一个单独的入口，仅在出现此类源时通过动态导入加载 —— 主包体积不会增加。

- 在浏览器自身支持 HLS 的地方（Safari、iOS、较新的 Chrome），地址直接交给 `<video>`（`preferNative: true`；设为 `false` 则始终使用适配器并获得画质菜单）。
- 否则由适配器向 Media Source Extensions 供数据：master 和 media 播放列表、带 `EXT-X-MAP` 的 **fMP4/CMAF** 分片、在浏览器中转换为 fMP4 的 **MPEG-TS** 分片（H.264 + AAC）、字节范围、`EXT-X-DISCONTINUITY`、**AES-128**（WebCrypto）、**备用音轨**（带 URI 的 `EXT-X-MEDIA TYPE=AUDIO`）使用独立的 SourceBuffer，在拖动和切换画质时与视频保持同步；按 `audioLanguage`、`DEFAULT`、浏览器语言下的 `AUTOSELECT` 依次选择，并可在设置菜单中切换；音轨可以是 fMP4、MPEG-TS 或带 ID3 时间戳的 **packed AAC**；带重新加载和滑动窗口的直播播放列表、预缓冲与淘汰、跳转、支持手动选择画质的 ABR、带退避的重试。
- 不支持：SAMPLE-AES / DRM（`encrypted` 错误）、MPEG-TS 中的 HEVC 或 MP3（`codec` 错误）、低延迟 HLS 的 part。

```ts
import { UidVideo } from '@dskripchenko/ui'

// 在模板中：
// <UidVideo src="https://cdn.example/live/master.m3u8" :hls-options="{ maxBufferAhead: 20 }" />
```

| `HlsOptions` | 默认值 | |
|---|---|---|
| `preferNative` | `true` | 浏览器自带 HLS 时使用它 |
| `startLevel` | `-1` | 起始变体；`-1` —— 由 ABR 决定 |
| `audioLanguage` | — | 首选音轨语言（`ru`、`en-US`…） |
| `maxBufferAhead` | `30` | 向前缓冲的秒数 |
| `maxBufferBehind` | `30` | 播放位置之后保留的秒数 |
| `retries` | `3` | 失败请求的重试次数（500 毫秒、1 秒、2 秒……） |
| `initialBandwidth` | `1000000` | 初始带宽估计，bit/s |
| `capToPlayerSize` | `true` | ABR 不选择明显高于播放器的变体 |
| `transmuxer` | 内置 MPEG-TS | 分片转换器工厂；`null` 表示禁用 |

适配器也可以脱离组件使用：

```ts
import { attachHls } from '@dskripchenko/ui/hls'

const session = attachHls(videoElement, url, {
  onLevels: (levels) => console.log(levels.map((l) => l.label)),
  onError: (e) => console.warn(e.code, e.message),
})
session.setLevel(1)   // -1 —— 恢复自动
session.setAudioTrack(1) // 切换音轨
session.stats()        // 各 SourceBuffer 的缓冲区间、档位、带宽
session.destroy()
```

其他容器的转换器通过 `transmuxer` 接入：一个包含 `canHandle(bytes)`、`push(bytes, { discontinuity })` → `{ init?, data, mimeType, tracks, startTime }` 和 `reset()` 的对象。

## 控制器

`useMediaController(mediaRef, options)` 是两个播放器共用的核心；可以在它之上构建自己的播放器界面。

```ts
const media = ref<HTMLVideoElement | null>(null)
const { state, play, pause, toggle, seek, skip, setVolume, toggleMute, setRate, toggleFullscreen, togglePip, handleKey } =
  useMediaController(media, { fullscreenTarget: rootRef, resumeKey: 'intro' })
```

`state` 是响应式的：`playing`、`paused`、`ended`、`waiting`、`stalled`、`seeking`、`currentTime`、`duration`、`live`、`buffered`、`volume`、`muted`、`rate`、`fullscreen`、`pip`、`error`。`handleKey(event)` 应用上述快捷键，按键被处理时返回 `true`。

## 样式

控件始终是深色遮罩上的浅色。变量：`--uid-video-accent`（已播放部分、选中项）、`--uid-video-radius`、`--uid-video-bg`、`--uid-video-caption-size`。
