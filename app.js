require('dotenv').config()
const discord = require("discord.js")
const { Client, Intents } = require('discord.js');
const { MessageEmbed } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, getVoiceConnection, AudioPlayerStatus } = require('@discordjs/voice');
const fs = require('fs');
const hound = require('hound')
const { default: axios } = require('axios')
const { v4: uuidv4 } = require('uuid')
const deeplnode = require('deepl-node')
const wiki = require('wikijs').default
const https = require('https')
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_VOICE_STATES] });
const mongoose = require('mongoose');
const prefix = process.env.prefix;
const watcher = hound.watch('.')
//const vvbase = axios.create({ baseURL: "http://localhost:50021", proxy: false });
const vvwbase = axios.create({ baseURL: "https://api.su-shiki.com/v2/voicevox", proxy: false });
const translator = new deeplnode.Translator(process.env.deepl)


// Channel Context
const voiceschema = new mongoose.Schema({
    _id: { type: String },
    voice: { type: String },
})

const voicemodel = mongoose.model('voice', voiceschema)

const channelschema = new mongoose.Schema({
    _id: { type: String },
    channel: { type: String },
})

const channelmodel = mongoose.model('channel', channelschema)


// On Ready
client.on('ready', () => {
    // Connect To DB
    mongoose.connect(process.env.mongodb, {
        keepAlive: true
    })
        .then(() => {
            console.log('Connected')
        }).catch((error) => {
            console.log(error)
        })

    // Change Activity Status
        const activities = [
        "@discordjs/voice",
        "Discord.js",
        "Dotenv",
        "FFMPEG-static",
        "Libsodium-wrappers",
        "Hound",
        "UUID",
        "Axios",
        "@discordjs/opus",
        "Wikijs",
        "Deepl-node"
    ];
    console.log('reloaded');
    setInterval(() => {
        const index = Math.floor(Math.random() * (activities.length - 1) + 1);
        client.user.setActivity(activities[index], {
            type: 'STREAMING',
            url: 'https://www.youtube.com/watch?v=4yVpklclxwU',
        });
    }, 5000)
});

client.on('messageCreate', async message => {
    // Use on Local Voice Docker
    /*async function gen(txt) {
        const audio_query = await vvbase.post('audio_query?text=' + encodeURI(txt) + '&speaker=1');

        const synthesis = await vvbase.post("synthesis?speaker=1", JSON.stringify(audio_query.data), {
            responseType: 'arraybuffer',
            headers: {
                "accept": "audio/wav",
                "Content-Type": "application/json"
            }
        });

        fs.writeFileSync(uuidv4() + '.wav', new Buffer.from(synthesis.data), 'binary')
    }*/

    async function gen(txt) {
        const profile = await voicemodel.findOne({ _id: message.author.id })
        if (profile) {
            const res = await vvwbase.get('audio/?key=' + process.env.voicevox + '&speaker=' + profile.voice + '&text=' + encodeURI(txt), {
                responseType: "arraybuffer"
            })
            .catch((err) => {
                console.log(err)
            })
            fs.writeFileSync(uuidv4() + '.wav', new Buffer.from(res.data), 'binary')
        } else {
            const res = await vvwbase.get('audio/?key=' + process.env.voicevox + '&speaker=3&text=' + encodeURI(txt), {
                responseType: "arraybuffer"
            })
            .catch((err) => {
                console.log(err)
            })
            fs.writeFileSync(uuidv4() + '.wav', new Buffer.from(res.data), 'binary')
        }
    }

    function sendembed(content) {
        const embed = new MessageEmbed()
            .setTitle("")
            .setAuthor({ name: 'しゃべるのだ', iconURL: 'https://i.ibb.co/wrJnLQG/zundamon.png' })
            .setDescription(content)
            .setColor('#a4d5ad')
            .setFooter({ text: `${message.author.username} によって実行`, iconURL: `${message.author.displayAvatarURL()}` });
        message.channel.send({ embeds: [embed] });
    }

    if (message.channel.type == "dm") return;
    if (message.author.bot) return;
    const args = message.content.slice(prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();
    if (command === "ping" && message.content.startsWith(prefix)) {
        sendembed(`:timer: レイテンシは${Math.round(client.ws.ping)}ミリ秒なのだ`)
    }
    if (command === "help" && message.content.startsWith(prefix)) {
        const embed = new MessageEmbed()
        .setTitle("")
        .setAuthor({ name: 'しゃべるのだ', iconURL: 'https://i.ibb.co/wrJnLQG/zundamon.png' })
        .setDescription(":question: ヘルプメニューなのだ")
        .addField('コマンド', prefix + "help - このメニューを表示\n" + prefix + "ping - ping値を表示\n" + prefix + "tts - 読み上げを開始\n" + prefix + "leave - 読み上げを終了\n" + prefix + "switch - キャラクターを変更", true)
        .addField('キャラクターID', "四国めたん\n-ノーマル:2 あまあま:0 ツンツン6 セクシー:4\nずんだもん\nノーマル:3 あまあま:1 ツンツン:7 セクシー:5\n春日部つむぎ:8\n雨晴はう:10\n波音リツ:9\n玄野武宏:11\n白上虎太郎:12\n青山龍星:13\n冥鳴ひまり:14\n九州そら\nノーマル:16 あまあま:15 ツンツン:18 セクシー:17 ささやき:19\nモチノキョウコ:20", true)
        .setColor('#a4d5ad')
        .setFooter({ text: `${message.author.username} によって実行`, iconURL: `${message.author.displayAvatarURL()}` });
    message.channel.send({ embeds: [embed] });
    }
    if (command === "switch" && message.content.startsWith(prefix)) {
        sendembed(":left_right_arrow: キャラクターのIDを選ぶのだ")
        const filter = res => res.author.id === message.author.id;
        const collector = message.channel.createMessageCollector({
            filter,
            time: 10000,
            max: 1,
        })
        collector.on('collect', async res => {
            const exists = await voicemodel.findOne({ _id: message.author.id })
            if (!exists) {
                if (Number(res.content) <= 20 && Number(res.content) >= 0) {
                    const newprofile = await voicemodel.create({
                        _id: message.author.id,
                        voice: res.content,
                    })
                    await newprofile.save()
                    sendembed(':green_circle: プロフィールを作成しました')
                } else {
                    sendembed(":warning: 有効なIDではないのだ")
                    return
                }
            } else {
                if (Number(res.content) <= 20 && Number(res.content) >= 0) {
                    await voicemodel.updateOne({ _id: message.author.id }, {
                        voice: res.content,
                    })
                    sendembed(':green_circle: キャラクターのIDを変更しました')
                } else {
                    sendembed(":warning: 有効なIDではないのだ")
                    return;
                }
            }
        })
    }
    if (command === "tts" && message.content.startsWith(prefix)) {
        if (message.member.voice.channelId !== null) {
            const connection = joinVoiceChannel({
                channelId: message.member.voice.channelId,
                guildId: message.guildId,
                adapterCreator: message.member.voice.channel.guild.voiceAdapterCreator,
            });
            sendembed(":green_circle: ボイスチャンネルに接続したのだ")
            const exists = await channelmodel.findOne({ _id: message.guildId })
            if (!exists) {
                const newprofile = await channelmodel.create({
                    _id: message.guildId,
                    channel: message.channelId,
                })
                await newprofile.save()
            } else {
                await channelmodel.updateOne({ _id: message.guildId }, {
                    channel: message.channelId,
                })
            }
        } else {
            sendembed(":warning: ボイスチャンネルに接続していないのだ")
            return;
        }
    }

    if (message.guild.me.voice.channelId !== null) {
        const profile = await channelmodel.findOne({ _id: message.guildId })
        if (!message.content.startsWith(prefix) && profile.channel === message.channelId) {
            const content = message.content.replace(/```.*```|(?:https?|ftp):\/\/[\n\S]+/g, "")
            if (content.endsWith(" -t")) {
                const tcontent = content.slice(0, -3);
                (async () => {
                    const result = await translator.translateText(tcontent, null, 'ja');
                    gen(result.text)
                })();
            } else if (content.endsWith(" -w")) {
                const wcontent = content.slice(0, -3);
                const ewcontent = encodeURI(wcontent)
                const url = 'https://ja.wikipedia.org/wiki/' + ewcontent;
                https.get(url, function (res) {
                    if (res.statusCode === 200) {
                        wiki({ apiUrl: 'http://ja.wikipedia.org/w/api.php' })
                            .page(wcontent)
                            .then(page => page.summary())
                            .then(info => gen(info.split('。')[0]))
                    } else if (res.statusCode === 404) {
                        gen('そのページは存在しません')
                    } else {
                        gen('エラーが発生しました')
                    }
                })
            } else {
                gen(content)
            }
            watcher.on('create', function (file, stats) {
                const connection = getVoiceConnection(message.guild.id)
                const player = createAudioPlayer()
                connection.subscribe(player)
                const resource = createAudioResource(file)
                player.play(resource)
                player.on('idle', () => {
                    fs.unlinkSync(file)
                })
            })
        }
        if (command === "leave" && message.content.startsWith(prefix) && profile.channel === message.channelId) {
            const connection = getVoiceConnection(message.guild.id)
            connection.destroy()
            sendembed(":red_circle: ボイスチャンネルから切断したのだ")
        }
    }
});


// Token Check
if (process.env.TOKEN == undefined) {
    console.log("undefined token");
    process.exit(0);
}

// Login
client.login(process.env.TOKEN);
