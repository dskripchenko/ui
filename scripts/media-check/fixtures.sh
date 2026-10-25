#!/usr/bin/env bash
# Generates media fixtures for the real-browser player checks (not committed).
set -euo pipefail
FF=${FFMPEG:-ffmpeg}
OUT=${1:-"$(cd "$(dirname "$0")/../.." && pwd)/.media-fixtures"}
mkdir -p "$OUT"
cd "$OUT"
Q="-hide_banner -loglevel error -y"
DUR=12
VSRC="testsrc2=size=1280x720:rate=30:duration=$DUR"
ASRC="aevalsrc='0.9*sin(2*PI*330*t)*(0.15+0.85*abs(sin(1.3*t)*sin(0.45*t+0.5)))|0.9*sin(2*PI*440*t)*(0.15+0.85*abs(sin(1.1*t)*sin(0.5*t)))':s=48000:d=$DUR"

$FF $Q -f lavfi -i "$VSRC" -f lavfi -i "$ASRC" -c:v libx264 -profile:v main -pix_fmt yuv420p -g 30 -c:a aac -b:a 96k -movflags +faststart -shortest video.mp4
$FF $Q -f lavfi -i "$VSRC" -f lavfi -i "$ASRC" -c:v libx264 -profile:v baseline -s 640x360 -pix_fmt yuv420p -g 30 -c:a aac -b:a 64k -movflags +faststart -shortest video-360.mp4
$FF $Q -f lavfi -i "$VSRC" -f lavfi -i "$ASRC" -c:v libvpx-vp9 -b:v 600k -deadline realtime -cpu-used 8 -s 854x480 -c:a libopus -b:a 64k -shortest video.webm
$FF $Q -f lavfi -i "$ASRC" -c:a libmp3lame -b:a 96k audio.mp3
$FF $Q -f lavfi -i "$ASRC" -c:a libopus -b:a 64k audio.ogg
$FF $Q -f lavfi -i "$ASRC" -c:a pcm_s16le audio.wav
$FF $Q -f lavfi -i "$ASRC" -c:a flac audio.flac
$FF $Q -f lavfi -i "$ASRC" -c:a aac -b:a 96k audio.m4a
head -c 40000 /dev/urandom > broken.mp4

$FF $Q -ss 3 -i video.mp4 -frames:v 1 poster.jpg
# Sprite of thumbnails: one frame every 2 s, 160x90, 6 in a row.
$FF $Q -i video.mp4 -vf "fps=1/2,scale=160:90,tile=6x1" -frames:v 1 sprite.jpg
{
  printf 'WEBVTT\n\n'
  for i in 0 1 2 3 4 5; do
    s=$((i * 2)); e=$((s + 2))
    printf '00:00:%02d.000 --> 00:00:%02d.000\nsprite.jpg#xywh=%d,0,160,90\n\n' "$s" "$e" $((i * 160))
  done
} > thumbs.vtt

printf 'WEBVTT\n\n00:00:00.500 --> 00:00:03.500\nHello, this is a <i>caption</i> test.\n\n00:00:04.000 --> 00:00:07.000\n<v Narrator>Second line &amp; more\n\n00:00:07.500 --> 00:00:11.500\nThe end is near.\n' > captions-en.vtt
printf 'WEBVTT\n\n00:00:00.500 --> 00:00:03.500\nПривет, это проверка субтитров.\n\n00:00:04.000 --> 00:00:11.500\nВторая строка.\n' > captions-ru.vtt
printf 'WEBVTT\n\n00:00:00.000 --> 00:00:04.000\nIntro\n\n00:00:04.000 --> 00:00:08.000\nMiddle\n\n00:00:08.000 --> 00:00:12.000\nOutro\n' > chapters.vtt

hls() { # $1 dir, $2 segment type (fmp4|mpegts)
  local dir=$1 type=$2 ext=m4s
  [ "$type" = mpegts ] && ext=ts
  mkdir -p "$dir"
  $FF $Q -f lavfi -i "$VSRC" -f lavfi -i "$ASRC" \
    -filter_complex "[0:v]split=2[v1][v2];[v1]scale=640:360[v360];[v2]scale=1280:720[v720]" \
    -map "[v360]" -map 1:a -map "[v720]" -map 1:a \
    -c:v libx264 -profile:v main -pix_fmt yuv420p -g 60 -keyint_min 60 -sc_threshold 0 \
    -b:v:0 400k -maxrate:v:0 450k -bufsize:v:0 800k -b:v:1 1800k -maxrate:v:1 2000k -bufsize:v:1 3600k \
    -c:a aac -b:a 64k -ac 2 \
    -f hls -hls_time 2 -hls_playlist_type vod -hls_segment_type "$type" \
    -hls_segment_filename "$dir/v%v/seg%03d.$ext" -master_pl_name master.m3u8 \
    -var_stream_map "v:0,a:0,name:360 v:1,a:1,name:720" "$dir/v%v/index.m3u8"
}
hls hls-fmp4 fmp4
hls hls-ts mpegts

# AES-128 encrypted TS.
mkdir -p hls-aes
head -c 16 /dev/urandom > hls-aes/key.bin
printf 'key.bin\n%s\n' "$PWD/hls-aes/key.bin" > hls-aes/keyinfo
$FF $Q -f lavfi -i "$VSRC" -f lavfi -i "$ASRC" -c:v libx264 -pix_fmt yuv420p -s 640x360 -g 60 -sc_threshold 0 -c:a aac -b:a 64k \
  -f hls -hls_time 2 -hls_playlist_type vod -hls_key_info_file hls-aes/keyinfo -hls_segment_filename "hls-aes/seg%03d.ts" hls-aes/index.m3u8

# A second TS clip with far-away timestamps, for the discontinuity playlist built by the check server.
mkdir -p hls-disc
$FF $Q -f lavfi -i "testsrc=size=640x360:rate=30:duration=6" -f lavfi -i "sine=frequency=880:duration=6:sample_rate=48000" \
  -c:v libx264 -pix_fmt yuv420p -g 60 -sc_threshold 0 -c:a aac -b:a 64k -ac 2 \
  -output_ts_offset 5000 -f hls -hls_time 2 -hls_playlist_type vod -hls_segment_filename "hls-disc/b%03d.ts" hls-disc/b.m3u8
echo "fixtures in $OUT"
