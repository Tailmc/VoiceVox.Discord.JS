# Syaberunoda

Simple TTS bot using VoiceVox

VoiceVoxを使ったシンプルな読み上げボット

## ❓ What is VoiceVox? / VoiceVoxとは？

Website: https://voicevox.hiroshiba.jp/

Docker Image: https://hub.docker.com/r/voicevox/voicevox_engine

---

ウェブサイト: https://voicevox.hiroshiba.jp/

Dockerイメージ: https://hub.docker.com/r/voicevox/voicevox_engine

## 🏓 Commands / コマンド

Start with the prefix, for example ?help

・help - shows help

・ping - shows ping

・tts - join the voice channel that the person who sent the command is in

・leave - leave the voice channel

---

?helpのように記号をつけて始める

・help - ヘルプを表示

・ping - 値を表示

・tts - コマンドを使った人がいるボイスチャンネルに接続する

・leave - 接続を切る

## 🤖 Demo /　デモ

WIP

## 🔧 Usage (Ubuntu) / 使い方（Ubuntu）

### 1. Install Docker / Dockerをインストール

```bash
sudo apt install docker.io
```

### 2. Pull & Run VoiceVox / VoiceVoxをプルして起動

CPU

```bash
docker pull voicevox/voicevox_engine:cpu-ubuntu20.04-latest
docker run --rm -it -d -p '127.0.0.1:50021:50021' voicevox/voicevox_engine:cpu-ubuntu20.04-latest
```

GPU (Nvidia)

```bash
docker pull voicevox/voicevox_engine:nvidia-ubuntu20.04-latest
docker run --rm --gpus all -d -p '127.0.0.1:50021:50021' voicevox/voicevox_engine:nvidia-ubuntu20.04-latest
```

### 3. Installing Node.js / Node.jsをインストール
```bash
curl -fsSL https://deb.nodesource.com/setup_16.x | bash -
sudo apt install -y nodejs
```

### 4. Downloading VoiceVox.Discord.JS / VoiceVox.Discord.JSをダウンロード

```bash
git clone https://github.com/Tailmc/VoiceVox.Discord.JS.git
cd VoiceVox.Discord.JS
npm install
```

### 5. Creating an ENV file / ENVファイルを作成

```bash
nano .env
```
Format / 形式

```
TOKEN=[TOKEN]
prefix=?
```

### 6. Installing PM2 & Launch! / PM2をインストールして起動
```bash
sudo npm install pm2 -g
pm2 start app.js
```
