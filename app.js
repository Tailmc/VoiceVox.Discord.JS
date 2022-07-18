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
const data = fs.readFileSync('db.json', 'utf-8');
const parseddata = JSON.parse(data)
const prefix = process.env.prefix;
const watcher = hound.watch('.')
//const vvbase = axios.create({ baseURL: "http://localhost:50021", proxy: false });
const vvwbase = axios.create({ baseURL: "https://api.su-shiki.com/v2/voicevox", proxy: false });
const translator = new deeplnode.Translator(process.env.deepl)

try {
    client.on('ready', () => {
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

    function gen(txt) {
        vvwbase.get('audio/?key=' + process.env.voicevox + '&speaker=3&text=' + encodeURI(txt), {
            responseType: "arraybuffer"
        })
        .then(res => {
            fs.writeFileSync(uuidv4() + '.wav', new Buffer.from(res.data), 'binary')
        })
    }
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
    client.on('messageCreate', message => {
        if (message.channel.type == "dm") return;
        if (message.author.bot) return;
        const args = message.content.slice(prefix.length).trim().split(/ +/g);
        const command = args.shift().toLowerCase();
        if (command === "ping" && message.content.startsWith(prefix)) {
            const embed = new MessageEmbed()
                .setTitle("")
                .setAuthor({ name: 'しゃべるのだ', iconURL: 'https://i.ibb.co/wrJnLQG/zundamon.png' })
                .setDescription(`:timer: レイテンシは${Math.round(client.ws.ping)}ミリ秒なのだ`)
                .setColor('#a4d5ad')
                .setFooter({ text: `${message.author.username} によって実行`, iconURL: `${message.author.displayAvatarURL()}` });
            message.channel.send({ embeds: [embed] });
        }
        if (command === "help" && message.content.startsWith(prefix)) {
            const embed = new MessageEmbed()
                .setTitle("")
                .setAuthor({ name: 'しゃべるのだ', iconURL: 'https://i.ibb.co/wrJnLQG/zundamon.png' })
                .setDescription(":question: コマンドは、" + prefix + "helpと、" + prefix + "pingと、" + prefix + "ttsと、" + prefix + "leaveがあるのだ")
                .setColor('#a4d5ad')
                .setFooter({ text: `${message.author.username} によって実行`, iconURL: `${message.author.displayAvatarURL()}` });
            message.channel.send({ embeds: [embed] });
        }
        if (command === "tts" && message.content.startsWith(prefix)) {
            if (message.member.voice.channelId !== null) {
                const connection = joinVoiceChannel({
                    channelId: message.member.voice.channelId,
                    guildId: message.guildId,
                    adapterCreator: message.member.voice.channel.guild.voiceAdapterCreator,
                });
                let datatoadd = {
                    server: message.guildId,
                    channel: message.channelId
                }
                const embed = new MessageEmbed()
                    .setTitle("")
                    .setAuthor({ name: 'しゃべるのだ', iconURL: 'https://i.ibb.co/wrJnLQG/zundamon.png' })
                    .setDescription(":green_circle: ボイスチャンネルに接続したのだ")
                    .setColor('#a4d5ad')
                    .setFooter({ text: `${message.author.username} によって実行`, iconURL: `${message.author.displayAvatarURL()}` });
                message.channel.send({ embeds: [embed] });
                let obj = parseddata.find(function (i) {
                    return i.server === message.guildId
                })
                let found = parseddata.findIndex(elem => {
                    return elem === obj
                })
                if (found > -1) {
                    parseddata.splice(found, 1)
                }
                parseddata.push(datatoadd)
                fs.writeFile('db.json', JSON.stringify(parseddata), 'utf-8', (err) => {
                    if (err) {
                        console.log(err)
                    }
                })
            } else {
                const embed = new MessageEmbed()
                    .setTitle("")
                    .setAuthor({ name: 'しゃべるのだ', iconURL: 'https://i.ibb.co/wrJnLQG/zundamon.png' })
                    .setDescription(":warning: ボイスチャンネルに接続していないのだ")
                    .setColor('#a4d5ad')
                    .setFooter({ text: `${message.author.username} によって実行`, iconURL: `${message.author.displayAvatarURL()}` });
                message.channel.send({ embeds: [embed] });
                return;
            }
        }

        if (message.guild.me.voice.channelId !== null) {
            let current = parseddata.find(function (i) {
                return i.server === message.guildId
            })
            let currentchannel = current.channel
            if (!message.content.startsWith(prefix) && currentchannel === message.channelId) {
                const content = message.content.replace(/```.*```|(?:https?|ftp):\/\/[\n\S]+/g, "")
                if(content.endsWith(" -t")){
                    const tcontent = content.slice(0, -3);
                    (async ()=>{
                        const result = await translator.translateText(tcontent, null, 'ja');
                        gen(result.text)
                    })();
                }else if(content.endsWith(" -w")){
                    const wcontent = content.slice(0, -3);
                    const ewcontent = encodeURI(wcontent)
                    const url = 'https://ja.wikipedia.org/wiki/' + ewcontent;
                    https.get(url, function(res){
                        if(res.statusCode === 404){
                            gen('そのページは存在しません')
                        }else{
                            wiki({ apiUrl: 'http://ja.wikipedia.org/w/api.php'})
                            .page(wcontent)
                            .then(page => page.summary())
                            .then(info => gen(info.split('。')[0]))
                        }
                    })
                }else{
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
            if (command === "leave" && message.content.startsWith(prefix) && currentchannel === message.channelId) {
                const connection = getVoiceConnection(message.guild.id)
                connection.destroy()
                const embed = new MessageEmbed()
                    .setTitle("")
                    .setAuthor({ name: 'しゃべるのだ', iconURL: 'https://i.ibb.co/wrJnLQG/zundamon.png' })
                    .setDescription(":red_circle: ボイスチャンネルから切断したのだ")
                    .setColor('#a4d5ad')
                    .setFooter({ text: `${message.author.username} によって実行`, iconURL: `${message.author.displayAvatarURL()}` });
                message.channel.send({ embeds: [embed] });
            }
        }
    });

    if (process.env.TOKEN == undefined) {
        console.log("undefined token");
        process.exit(0);
    }
    client.login(process.env.TOKEN);
} catch (e) {
    console.log(e);
}
