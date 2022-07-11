
# VoiceVox.Discord.JS

Simple TTS bot using VoiceVox

## What is VoiceVox?

Website: https://voicevox.hiroshiba.jp/

Docker Image: https://hub.docker.com/r/voicevox/voicevox_engine
## Commands

Start with the prefix, for example ?help

・help - shows help

・ping - shows ping

・tts - join the voice channel that the person who sent the command is in

・leave - leave the voice channel
## Demo

WIP

## Usage (Ubuntu)

### 1. Install Docker

```bash
sudo apt install docker.io
```

### 2. Pull & Run VoiceVox

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

### 3. Installing Node.js
```bash
curl -fsSL https://deb.nodesource.com/setup_16.x | bash -
sudo apt install -y nodejs
```

### 4. Downloading VoiceVox.Discord.JS

```bash
git clone https://github.com/Tailmc/VoiceVox.Discord.JS.git
cd VoiceVox.Discord.JS
npm install
```

### 5. Creating an ENV file

```bash
nano .env
```
Format

```
TOKEN=[Insert your bot token here]
prefix=[Insert your bot's prefix here, for example prefix=!]
```

### 6. Installing PM2 & Launch!
```bash
sudo npm install pm2 -g
pm2 start app.js
```
