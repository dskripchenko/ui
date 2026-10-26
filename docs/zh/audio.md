# 音频

`UidAudio` 是基于原生 `<audio>` 元素的音频播放器：紧凑的一行（播放、进度条、时间、音量、速度），用于表格和列表的 `mini` 变体，在浏览器中计算的波形，以及播放列表。它与 [UidVideo](./video.md) 共用控制器。

```vue
<UidAudio src="/media/episode.mp3" title="Episode 12" artist="The Podcast" waveform />

<UidAudio :src="row.recording" variant="mini" />

<UidAudio v-model:index="current" :tracks="playlist" waveform />
```

| Prop | 类型 | 默认值 | |
|---|---|---|---|
| `src`, `type` | `string` | — | 单个曲目；指定 `type` 时，无法播放的格式会立即报告 |
| `title`, `artist` | `string` | — | 显示在进度条上方 |
| `tracks` | `UidAudioTrack[]` | — | 播放列表：`{ src, type?, title?, artist?, peaks?, duration? }` |
| `index` (`v-model:index`) | `number` | `0` | 当前播放列表曲目 |
| `variant` | `'default' \| 'mini'` | `'default'` | `mini` —— 一行：播放、进度条、时间 |
| `waveform` | `boolean` | `false` | 以浏览器中解码的波形作为进度条 |
| `peaks` | `number[]` | — | 预先计算的峰值 `0..1`；无需解码即可绘制波形 |
| `waveformMaxBytes` | `number` | 40 MB | 更大的文件不解码 —— 改用普通进度条 |
| `waveformMaxDuration` | `number` | 1800 | 更长的音频（秒）不解码 |
| `autoAdvance` | `boolean` | `true` | 曲目结束时播放列表中的下一首 |
| `loop` | `boolean` | `false` | 循环当前曲目或整个播放列表 |
| `preload` | `'none' \| 'metadata' \| 'auto'` | `'metadata'` | |
| `crossorigin` | `'' \| 'anonymous' \| 'use-credentials'` | — | |
| `exclusive` | `boolean` | `true` | 启动此播放器会暂停其他播放器 |
| `resumeKey` | `string` | — | 记住播放位置（按播放列表曲目分别记录） |
| `rates` | `number[]` | `0.5…2` | 速度菜单 |
| `hotkeys` | `boolean` | `true` | 空格/`K`、方向键、`J`/`L`、`M`、`0`–`9`；`Shift+N` / `Shift+P` —— 下一首 / 上一首 |
| `showVolume`, `showRate` | `boolean` | `true` | |
| `showPlaylist` | `boolean` | `true` | 播放器下方的曲目列表 |

事件：`play`、`pause`、`ended`、`error`、`trackchange`（索引）、`update:index`。属性 `hlsOptions` 和 `hlsLoader` 与 UidVideo 中相同。对外暴露：`play()`、`pause()`、`toggle()`、`seek()`、`next()`、`prev()`、`state`、`media`。

## 布局

- **默认** —— 一行：播放按钮、标题和进度条、时间、音量、速度。在窄容器中（小于 480 px），标题和艺术家上下排列并以省略号截断，进度条移到单独的整行，时间位于其下方，音量滑块交由硬件按键处理。从 560 px 起音量滑块始终可见。
- **Mini** —— 默认宽 `240px`（`--uid-audio-mini-width`），可放入表格单元格：播放、进度条或小波形、时间（播放前为时长，播放中为当前位置）。启动某一行会暂停其他行。
- **播放列表** —— 播放按钮两侧为上一首 / 下一首，并有一个标出当前播放曲目的编号列表。若曲目已播放超过 3 秒，"上一首"会先将其倒回开头。锁屏和硬件媒体键通过 Media Session API 工作。所有曲目的时长会依次从元数据中读取；在此之前列表显示“—”。

## 波形

启用 `waveform` 时，文件会被获取并通过 Web Audio 解码（`decodeAudioData` 使用较低采样率以节省内存），峰值分块计算，块与块之间让出给浏览器（`requestIdleCallback`，否则 `setTimeout`）。结果按地址在页面生命周期内缓存；文件逐个解码，且仅在播放器接近视口时进行，因此包含上百条录音的表格也能保持流畅。超过 `waveformMaxBytes` 或长于 `waveformMaxDuration` 的文件保留普通进度条。音频必须能被 `fetch` 读取 —— 同源或 CORS。峰值计算完成之前，进度条位置显示闪烁的占位效果，而不是看起来已经完成的普通线条。

对于较长的录音，请在服务器上计算峰值并通过 `peaks` 传入（长度任意；播放器会按自身宽度重新采样）：

```ts
import { computePeaks } from '@dskripchenko/ui'

// 例如在 worker 中或处理上传时
const peaks = await computePeaks([audioBuffer.getChannelData(0)], 512)
```

辅助函数：`getWaveform(src, options)`、`computePeaks(channels, count)`、`resamplePeaks(peaks, n)`、`peaksToPath(peaks)`。

## HLS

`.m3u8` 源（或 `type: 'application/x-mpegURL'`）通过与 [UidVideo](./video.md#hls) 相同的按需加载适配器播放：纯音频的 master 或 media 播放列表，fMP4、MPEG-TS 或 packed AAC 分片。流不绘制波形。

## 格式

| 格式 | Chrome / Edge | Firefox | Safari macOS | Safari iOS |
|---|---|---|---|---|
| MP3 | ✓ | ✓ | ✓ | ✓ |
| AAC / M4A | ✓ | ✓ | ✓ | ✓ |
| Ogg · Opus | ✓ | ✓ | ✓（较新版本） | ✓（较新版本） |
| Ogg · Vorbis | ✓ | ✓ | 较新版本 | 较新版本 |
| WAV (PCM) | ✓ | ✓ | ✓ | ✓ |
| FLAC | ✓ | ✓ | ✓ | ✓ |
| WebM · Opus | ✓ | ✓ | ✓ | ✓（较新版本） |

已在真实浏览器中验证（Playwright）：MP3、Ogg/Opus、WAV、FLAC 和 M4A 在 Chromium 156、Chrome 156 和 WebKit 27 中均可播放并绘制波形。对于不太常见的格式，最好指定 `type`：播放器会立即报告"不支持"，而不是在加载失败后才报告。

## 样式

变量：`--uid-audio-accent`、`--uid-audio-accent-hover`、`--uid-audio-bg`、`--uid-audio-border`、`--uid-audio-radius`、`--uid-audio-padding`、`--uid-audio-play-size`、`--uid-audio-play-color`、`--uid-audio-wave`、`--uid-audio-wave-height`、`--uid-audio-mini-width`、`--uid-audio-list-max-height`。
