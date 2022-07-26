## 🔧 Deploy (Ubuntu) / デプロイ（Ubuntu）

### 1. Installing Node.js / Node.jsをインストール
```bash
curl -fsSL https://deb.nodesource.com/setup_16.x | bash -
sudo apt install -y nodejs
```

### 2. Downloading Syaberunoda / しゃべるのだをダウンロード

```bash
git clone https://github.com/Tailmc/Syaberunoda.git
cd Syaberunoda
npm install
```

### 3. Creating an ENV file / ENVファイルを作成

```bash
nano .env
```
Format / 形式

```
TOKEN=[TOKEN]
deepl=[DeepL API KEY]
mongodb=[MongoDB URI]
voicevox=[Su-shiki API KEY]
```

How do i get these variables? / これらの変数の入手方法

[TOKEN]https://discord.com/developers

[DeepL API KEY]https://www.deepl.com/docs-api

[MongoDB URI]https://www.mongodb.com/docs/atlas/

[Su-shiki API KEY]https://su-shiki.com/api/

### 4. Installing PM2 & Launch! / PM2をインストールして起動
```bash
sudo npm install pm2 -g
pm2 start app.js
```
