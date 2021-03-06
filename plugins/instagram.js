/* Copyright (C) 2022 Sourav KL11.
Licensed under the  GPL-3.0 License;
you may not use this file except in compliance with the License.
Raganork MD - Sourav KL11
*/
const {
    Module
} = require('../main');
const {
    Mimetype
} = require('@adiwajshing/baileys');
const fs = require('fs');
const got = require("got");
const axios = require('axios');
const setting = require('../config');
const {
    getPost,
    getStalk,
    getStory,
    skbuffer
} = require('raganork-bot');
const {
    downloadGram,
    pin,
    story,
    tiktok
} = require('./misc/misc');
const Config = require('../config');
const s = require('../config');
var need = "*_Need instagram link!_*";
var downloading = "_*Downloading*_";
var need_acc = "*_Need an instagram username!_*";
var fail = "*_Download failed! Check your link and try again_*";
var need_acc_s = "_Need an instagram username or link!_";
let sourav = setting.MODE == 'public' ? false : true
Module({
    pattern: 'insta ?(.*)',
    fromMe: sourav,
    desc: 'Instagram post downloader',
    usage: 'insta link or reply to a link',
    use: 'download'
}, (async (msg, query) => {
     var q = !msg.reply_message.message ? query[1] : msg.reply_message.message
    if (q.startsWith('l')) return;
    if (!q) return await msg.sendReply("*Need instagram link*")
    if (q.includes("stories")) return await msg.sendReply("*Use .story command!*")
    if (q && !q.includes('instagram.com')) return await msg.client.sendMessage(msg.jid, {
        text: need
    }, {
        quoted: msg.data
    })
    var getid = /(?:https?:\/\/)?(?:www\.)?(?:instagram\.com(?:\/.+?)?\/(p|reel|tv)\/)([\w-]+)(?:\/)?(\?.*)?$/
    var url = getid.exec(q)
    if (url != null) {
        var res = await downloadGram(url[0])
        if (res == false) return await msg.sendReply("*Download failed*");
        for (var i in res) {
        await msg.sendReply({url:res[i].url}, res[i].type)
        };
    }
}));
Module({
    pattern: 'ig ?(.*)',
    fromMe: sourav,
    desc: 'Gets account info from instagram',
    usage: 'ig username',
    use: 'search'
}, (async (msg, query) => {
    if (query[1] === '') return await msg.client.sendMessage(msg.jid, {
        text: need_acc
    }, {
        quoted: msg.data
    })
    var res = await getStalk(query[1])
    if (res === "false") return await msg.client.sendMessage(msg.jid, {
        text: "*_Username invalid!_*"
    }, {
        quoted: msg.data
    })
    var buffer = await skbuffer(res.hd_profile_pic_url_info.url)
    await msg.client.sendMessage(msg.jid, {
        image: buffer,
        caption: '_*Name:*_ ' + `${res.fullname}` + '\n _*Bio:*_ ' + `${res.biography}` + '\n _*Private account:*_ ' + `${res.is_private} ` + '\n _*Followers:*_ ' + `${res.followers}` + '\n _*Following:*_ ' + `${res.following}` + '\n _*Posts:*_ ' + `${res.post_count}` + '\n _*Verified:*_ ' + `${res.is_verified} ` + '\n _*IGTV videos:*_ ' + `${res.total_igtv_videos}`
    }, {
        quoted: msg.data
    });
}));
Module({
    pattern: 'story ?(.*)',
    fromMe: sourav,
    desc: 'Instagram stories downloader',
    usage: '.story username or link',
    use: 'download'
}, (async (msg, query) => {
    var user = query[1] !== '' ? query[1] : msg.reply_message.text;
    if (!user) return await msg.sendReply(need_acc_s);
    if (/\bhttps?:\/\/\S+/gi.test(user)) user = user.match(/\bhttps?:\/\/\S+/gi)[0]
    try { var res = await story(user) } catch {return await msg.sendReply("*Server error*")}
    await msg.sendMessage('_Downloading ' + res.length + ' stories_');
    for (var i in res){
        await msg.sendReply({url: res[i].url},res[i].type)
    }
}));
Module({
    pattern: 'pin ?(.*)',
    fromMe: sourav,
    desc: 'Pinterest downloader',
    usage: '.pin reply or link',
    use: 'download'
}, (async (msg, query) => {
    var user = query[1] !== '' ? query[1] : msg.reply_message.text;
    if (user === 'g') return;
    if (!user) return await msg.sendReply("*Need url*");
    if (/\bhttps?:\/\/\S+/gi.test(user)) user = user.match(/\bhttps?:\/\/\S+/gi)[0]
    try { var res = await pin(user) } catch {return await msg.sendReply("*Server error*")}
    await msg.sendMessage('_Downloading ' + res.length + ' medias_');
    for (var i in res){
        var type = res[i].url.includes("mp4") ? "video" : "image"
        await msg.sendReply({url:res[i].url },type)
    }
}));
Module({
    pattern: 'tiktok ?(.*)',
    fromMe: sourav,
    desc: 'tiktok downloader',
    usage: '.tiktok reply or link',
    use: 'download'
}, (async (msg, query) => {
    var link = query[1] !== '' ? query[1] : msg.reply_message.text;
    if (!link) return await msg.sendReply("*Need a tiktok url*");
    link = link.match(/\bhttps?:\/\/\S+/gi)[0]
    try { var res = await tiktok(link) } catch {return await msg.sendReply("*Server error*")}
    var buttons = [{
        quickReplyButton: {
            displayText: 'No WM',
            id: 'tktk nowm '+msg.myjid+' '+res.nowm
        }
    }, {
        quickReplyButton: {
            displayText: 'With WM',
            id: 'tktk wm '+msg.myjid+' '+res.wm
        }  
    }]
    await msg.sendImageTemplate(await skbuffer("https://d15shllkswkct0.cloudfront.net/wp-content/blogs.dir/1/files/2018/10/tiktok.jpeg"),"TikTok Downloader","Choose your media",buttons);
    }));
    Module({
        on: 'button',
        fromMe: sourav
    }, (async (msg) => {
        if (msg.button && msg.button.startsWith("tktk") && msg.button.includes(msg.myjid)){
        if (msg.button.includes("nowm")){
        return await msg.sendReply({url: msg.button.split(" ")[3]},'video')
        }
           if (msg.button.split(" ")[1] === "wm"){
                return await msg.sendReply({url: msg.button.split(" ")[3]},'video')
                }
                if (msg.button.includes("aud")){
                    return await msg.sendReply({url: msg.button.split(" ")[3]},'audio')
                    }     
        }
        }));
    