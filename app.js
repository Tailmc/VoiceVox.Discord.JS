require('dotenv').config()
const discord = require("discord.js")
const { Client, Intents, MessageEmbed, MessageActionRow, MessageSelectMenu } = require('discord.js');
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

client.once('ready', async () => {
    await client.application.commands.set([{
        name: "ping",
        description: "ping値を表示",
    }, {
        name: "help",
        description: "ヘルプメニューを表示",
    }, {
        name: "join",
        description: "テキスト読み上げを開始"
    }, {
        name: "leave",
        description: "テキスト読み上げを終了"
    },{
        name: "switch",
        description: "キャラクターを変更",
    }])
})

client.on('ready', () => {
    mongoose.connect(process.env.mongodb, {
        keepAlive: true
    })
        .then(() => {
            console.log('Connected')
        }).catch((err) => {
            console.log(err)
        })

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

client.on('interactionCreate', async interaction => {

    async function sendembed(content, tf, componentsarray) {
        const embed = new MessageEmbed()
            .setTitle("")
            .setAuthor({ name: 'しゃべるのだ', iconURL: 'https://i.ibb.co/wrJnLQG/zundamon.png' })
            .setDescription(content)
            .setColor('#a4d5ad')
            .setFooter({ text: `${interaction.user.username} によって実行`, iconURL: `${interaction.user.displayAvatarURL()}` });
        await interaction.reply({ embeds: [embed] , ephemeral: tf, components: componentsarray});
    }
    if(!interaction.inGuild()){
        sendembed(':exclamation: コマンドはサーバーで送られる必要があるのだ', true, [])
        return
    }

    if (interaction.isCommand()){
    if (interaction.commandName === 'ping') {
        sendembed(`:timer: レイテンシは${Math.round(client.ws.ping)}ミリ秒なのだ`, false, [])
    }
    if (interaction.commandName === 'help') {
        sendembed(":question: ヘルプメニューなのだ\n/help - このメニューを表示\n" + "/ping - ping値を表示\n" + "/tts - 読み上げを開始\n" + "/leave - 読み上げを終了\n" + "/switch - キャラクターを変更", false, [])
    }
    if (interaction.commandName === "join") {
        if (interaction.member.voice.channelId !== null) {
            joinVoiceChannel({
                channelId: interaction.member.voice.channelId,
                guildId: interaction.guildId,
                adapterCreator: interaction.member.voice.channel.guild.voiceAdapterCreator,
            });
            sendembed(":green_circle: ボイスチャンネルに接続したのだ", false, [])
            const exists = await channelmodel.findOne({ _id: interaction.guildId })
            if (!exists) {
                const newprofile = await channelmodel.create({
                    _id: interaction.guildId,
                    channel: interaction.channelId,
                })
                await newprofile.save()
            } else {
                await channelmodel.updateOne({ _id: interaction.guildId }, {
                    channel: interaction.channelId,
                })
            }
        } else {
            sendembed(":warning: ボイスチャンネルに接続していないのだ", true, [])
            return;
        }
    }
    if (interaction.guild.me.voice.channelId !== null) {
        const profile = await channelmodel.findOne({ _id: interaction.guildId })
        if (interaction.commandName === "leave" && profile.channel === interaction.channelId) {
            const connection = getVoiceConnection(interaction.guild.id)
            connection.destroy()
            sendembed(":red_circle: ボイスチャンネルから切断したのだ", false, [])
        }
    }
    if (interaction.commandName === "switch") {
        const selectmenu = new MessageActionRow()
            .addComponents(
                new MessageSelectMenu()
                    .setCustomId('voice')
                    .setPlaceholder('キャラクターのIDを選ぶのだ')
                    .addOptions([
                        {
                            label: "ずんだもん",
                            description: "ノーマル",
                            value: "3"
                        }, {
                            label: "ずんだもん",
                            description: "あまあま",
                            value: "1"
                        }, {
                            label: "ずんだもん",
                            description: "ツンツン",
                            value: "7"
                        }, {
                            label: "ずんだもん",
                            description: "セクシー",
                            value: "5"
                        }, {
                            label: "四国めたん",
                            description: "ノーマル",
                            value: "2"
                        }, {
                            label: "四国めたん",
                            description: "あまあま",
                            value: "0"
                        }, {
                            label: "四国めたん",
                            description: "ツンツン",
                            value: "6"
                        }, {
                            label: "四国めたん",
                            description: "セクシー",
                            value: "4"
                        }, {
                            label: "春日部つむぎ",
                            description: "ノーマル",
                            value: "8"
                        }, {
                            label: "雨晴はう",
                            description: "ノーマル",
                            value: "10"
                        }, {
                            label: "波音リツ",
                            description: "ノーマル",
                            value: "9"
                        }, {
                            label: "玄野武宏",
                            description: "ノーマル",
                            value: "11"
                        }, {
                            label: "白上虎太郎",
                            description: "ノーマル",
                            value: "12"
                        }, {
                            label: "青山龍星",
                            description: "ノーマル",
                            value: "13"
                        }, {
                            label: "冥鳴ひまり",
                            description: "ノーマル",
                            value: "14"
                        }, {
                            label: "九州そら",
                            description: "ノーマル",
                            value: "16"
                        }, {
                            label: "九州そら",
                            description: "あまあま",
                            value: "15"
                        }, {
                            label: "九州そら",
                            description: "ツンツン",
                            value: "18"
                        }, {
                            label: "九州そら",
                            description: "セクシー",
                            value: "17"
                        }, {
                            label: "九州そら",
                            description: "ささやき",
                            value: "19"
                        }, {
                            label: "モチノ・キョウコ",
                            description: "ノーマル",
                            value: "20"
                        }
                    ])
            )
        sendembed(":left_right_arrow: キャラクターのIDを選ぶのだ", true, [selectmenu])
    }
}else if (interaction.isSelectMenu()){
    const embed = new MessageEmbed()
    .setTitle("")
    .setAuthor({ name: 'しゃべるのだ', iconURL: 'https://i.ibb.co/wrJnLQG/zundamon.png' })
    .setDescription(":green_circle: キャラクターのIDを選択したのだ")
    .setColor('#a4d5ad')
    .setFooter({ text: `${interaction.user.username} によって実行`, iconURL: `${interaction.user.displayAvatarURL()}` });
    const exists = await voicemodel.findOne({ _id: interaction.user.id })
    if (!exists) {
            const newprofile = await voicemodel.create({
                _id: interaction.user.id,
                voice: interaction.values[0],
            })
            await newprofile.save()
    } else {
            await voicemodel.updateOne({ _id: interaction.user.id }, {
                voice: interaction.values[0],
            })
    }
    await interaction.deferUpdate();
    await interaction.editReply({ ephemera: true, embeds:[embed], components: []})
}

})

client.on('messageCreate', async message => {

    if (message.author.bot || message.channel.type == "dm") return;

    /*
async function gen(txt) {
    const audio_query = await vvbase.post('audio_query?text=' + encodeURI(txt) + '&speaker=1');
 
    const synthesis = await vvbase.post("synthesis?speaker=1", JSON.stringify(audio_query.data), {
        responseType: 'arraybuffer',
        headers: {
            "accept": "audio/wav",
            "Content-Type": "application/json"
        }
    });
 
    fs.writeFileSync(uuidv4() + '.wav', new Buffer.from(synthesis.data), 'binary')
}
    */
    async function gen(txt) {
        const profile = await voicemodel.findOne({ _id: message.author.id })
        if (profile) {
            await vvwbase.get('audio/?key=' + process.env.voicevox + '&speaker=' + profile.voice + '&text=' + encodeURI(txt), {
                responseType: "arraybuffer"
            }).then((res) => {
                fs.writeFileSync(uuidv4() + '.wav', new Buffer.from(res.data), 'binary')
            })
                .catch((err) => {
                    console.log(err)
                })
        } else {
            await vvwbase.get('audio/?key=' + process.env.voicevox + '&speaker=3&text=' + encodeURI(txt), {
                responseType: "arraybuffer"
            }).then((res) => {
                fs.writeFileSync(uuidv4() + '.wav', new Buffer.from(res.data), 'binary')
            })
                .catch((err) => {
                    console.log(err)
                })
        }
    }

    if (message.guild.me.voice.channelId !== null) {
        const profile = await channelmodel.findOne({ _id: message.guildId })
        if (!message.content.startsWith(prefix) && profile.channel === message.channelId) {
            const content = message.content.replace(/```.*```|(?:https?|ftp):\/\/[\n\S]+/g, "")
            if (content.startsWith("t.")) {
                const tcontent = content.slice(2);
                (async () => {
                    const result = await translator.translateText(tcontent, null, 'ja');
                    gen(result.text)
                })();
            } else if (content.startsWith("w.")) {
                const wcontent = content.slice(2);
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
    }
});

if (process.env.TOKEN == undefined) {
    console.log("undefined token");
    process.exit(0);
}
client.login(process.env.TOKEN);
