require('dotenv').config()
const discord = require("discord.js")
const { Client, Intents, MessageEmbed, MessageActionRow, MessageSelectMenu } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, getVoiceConnection, getVoiceConnections } = require('@discordjs/voice');
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
const watcher = hound.watch('audio')
const base = axios.create({ baseURL: "https://api.su-shiki.com/v2/voicevox", proxy: false });
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

client.on('ready', async () => {
    mongoose.connect(process.env.mongodb, {
        keepAlive: true
    })
        .then(() => {
            console.log('connected')
        }).catch((err) => {
            console.log(err)
        })

    console.log('reloaded');
    setInterval(() => {
        client.user.setActivity(`${client.guilds.cache.size}サーバー・${getVoiceConnections().size}チャンネルにいるのだ`, {
            type: 'STREAMING',
            url: 'https://www.youtube.com/watch?v=4yVpklclxwU',
        });
    }, 5000)

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
    }, {
        name: "switch",
        description: "キャラクターを変更",
    }, {
        name: "wiki",
        description: "Wikipediaで検索",
        options: [{
            type: "STRING",
            name: "query",
            description: "検索する文字列",
            required: true
        }]
    }, {
        name: "translate",
        description: "DeepLで翻訳",
        options: [{
            type: "STRING",
            name: "query",
            description: "翻訳する文字列",
            required: true
        }]
    }])
});

async function gen(txt, msgorint) {

    const arr = txt.match(/[A-Z]+/gi) !== null ? txt.match(/[A-Z]+/gi) : [null]
    let result = txt
    for (const item of arr) {
        const req = https.get(`https://www.sljfaq.org/cgi/e2k_ja.cgi?word=${item}`, (res) => {
            res.on('data', async (data) => {
                if (data.toString().match(/"j_pron_spell":"[\S\s]*?"/g)) {

                    result = result.replace(item, data.toString().match(/"j_pron_spell":"[\S\s]*?"/g)[0].replace(/j_pron_spell|:|"/g, ''))
                    if (item === arr[arr.length - 1]) {

                        const profile = await voicemodel.findOne({ _id: msgorint.author ? msgorint.author.id : msgorint.user.id })

                        await base.get(`audio/?key=${process.env.voicevox}&speaker=${profile ? profile.voice : '3'}&text=${encodeURI(result)}`, {
                            responseType: "arraybuffer"
                        }).then((res) => {
                            fs.writeFileSync(`audio/${msgorint.guildId}/` + uuidv4() + '.wav', new Buffer.from(res.data), 'binary')
                        })
                            .catch((err) => {
                                console.log(err)
                            })

                    }
                }
            })
        })
        req.on('error', (e) => {
            console.log(e)
        })
        req.end()
    }
}

client.on('interactionCreate', async interaction => {

    async function buildembed(content, tf, componentsarray) {
        const embed = new MessageEmbed()
            .setTitle("")
            .setAuthor({ name: 'しゃべるのだ', iconURL: 'https://i.ibb.co/wrJnLQG/zundamon.png' })
            .setDescription(content)
            .setColor('#a4d5ad')
            .setFooter({ text: `${interaction.user.username} によって実行`, iconURL: `${interaction.user.displayAvatarURL()}` });
        return { embeds: [embed], ephemeral: tf, components: componentsarray }
    }
    if (!interaction.inGuild()) {
        interaction.reply(await buildembed(':exclamation: コマンドはサーバーで送られる必要があるのだ', true, []))
        return
    }

    if (interaction.isCommand()) {
        if (interaction.commandName === 'ping') {
            interaction.reply(await buildembed(`:timer: レイテンシは${Math.round(client.ws.ping)}ミリ秒なのだ`, false, []))
        }
        if (interaction.commandName === 'help') {
            interaction.reply(await buildembed(":question: ヘルプメニューなのだ\n/help - このメニューを表示\n" + "/ping - ping値を表示\n" + "/tts - 読み上げを開始\n" + "/leave - 読み上げを終了\n" + "/switch - キャラクターを変更", false, []))
        }
        if (interaction.commandName === "join") {
            if (interaction.member.voice.channelId !== null) {
                joinVoiceChannel({
                    channelId: interaction.member.voice.channelId,
                    guildId: interaction.guildId,
                    adapterCreator: interaction.member.voice.channel.guild.voiceAdapterCreator,
                });
                interaction.reply(await buildembed(":green_circle: ボイスチャンネルに接続したのだ", false, []))
                if (!fs.existsSync(`audio/${interaction.guildId}`)) {
                    fs.mkdirSync(`audio/${interaction.guildId}`)
                }
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
                interaction.reply(await buildembed(":warning: ボイスチャンネルに接続していないのだ", true, []))
                return
            }
        }
        if (interaction.guild.me.voice.channelId !== null) {
            const profile = await channelmodel.findOne({ _id: interaction.guildId })
            if (interaction.commandName === "leave" && profile.channel === interaction.channelId) {
                const connection = getVoiceConnection(interaction.guild.id)
                connection.destroy()
                interaction.reply(await buildembed(":red_circle: ボイスチャンネルから切断したのだ", false, []))
                fs.rmSync(`audio/${interaction.guildId}`, { recursive: true, force: true })
            } else if (interaction.commandName === "wiki" && profile.channel === interaction.channelId) {
                await interaction.deferReply()
                const url = 'https://ja.wikipedia.org/wiki/' + encodeURI(interaction.options.getString('query'));
                https.get(url, async (res) => {
                    if (res.statusCode === 200) {
                        wiki({ apiUrl: 'http://ja.wikipedia.org/w/api.php' })
                            .page(interaction.options.getString('query'))
                            .then(page => page.summary())
                            .then(async (info) => {
                                gen(info.split('。')[0], interaction)
                                interaction.editReply(await buildembed(':green_circle: 正常に検索が完了したのだ', true, []))
                            })
                    } else if (res.statusCode === 404) {
                        interaction.editReply(await buildembed(':warning: そのページは存在しないのだ', true, []))
                    } else {
                        interaction.editReply(await buildembed(':warning: エラーが発生したのだ', true, []))
                    }
                })
            } else if (interaction.commandName === "translate" && profile.channel === interaction.channelId) {
                await interaction.deferReply()
                const result = await translator.translateText(interaction.options.getString('query'), null, 'ja');
                gen(result.text, interaction)
                interaction.editReply(await buildembed(':green_circle: 正常に翻訳が完了したのだ', true, []))
            }
        } else {
            if (interaction.commandName === "translate" || interaction.commandName === "leave" || interaction.commandName === "wiki") {
                interaction.reply(await buildembed(':warning: 僕はまだボイスチャンネルにいないのだ', true, []))
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
            interaction.reply(await buildembed(":left_right_arrow: キャラクターのIDを選ぶのだ", true, [selectmenu]))
        }
    } else if (interaction.isSelectMenu()) {
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
        await interaction.deferUpdate()
        for (const option of interaction.component.options) {
            if (option.value === interaction.values[0]) {
                interaction.editReply(await buildembed(`:green_circle: キャラクターを${option.label}の${option.description}に設定したのだ`, false, []))
            }
        }
    }

})

client.on('messageCreate', async message => {

    if (message.author.bot || message.channel.type == "dm") return;

    if (message.guild.me.voice.channelId !== null) {
        const profile = await channelmodel.findOne({ _id: message.guildId })
        if (!message.content.startsWith(prefix) && profile.channel === message.channelId) {
            const content = message.content.replace(/<?(a)?:?(\w{2,32}):(\d{17,19})>?|(```.+?```)|(:.+?:)|(?:https?|ftp):\/\/[\n\S]+/gms, "")
            gen(content, message)
        }
    }
})

watcher.on('create', (file, stats) => {
    if (!file.endsWith('.wav')) return
    const connection = getVoiceConnection(file.split('/')[1])
    const player = createAudioPlayer()
    connection.subscribe(player)
    const resource = createAudioResource(file)
    player.play(resource)
})

if (process.env.TOKEN == undefined) {
    console.log("undefined token");
    process.exit(0);
}
client.login(process.env.TOKEN);
