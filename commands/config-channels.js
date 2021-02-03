const Discord = require("discord.js")

const GuildSettings = require("../models/settings");
const twitterSettings = require("../models/twitter");
const darknetSettings = require("../models/darknet");
const logsSettings = require("../models/logs");
const lspdSettings = require("../models/lspd");
const emsSettings = require("../models/ems");


module.exports.run = async (bot, message, args) => {

    if (!message.member.permissions.has('MANAGE_CHANNELS')) return;

    let prefix = await GuildSettings.findOne({ gid: message.guild.id });
    if(!prefix) return;
    prefix = prefix.prefix;


    if(!args[0]) {
        let embed = new Discord.MessageEmbed()
        .setColor("BLUE")
        .setAuthor("Configuration")
        .setDescription(`\`${prefix}config twitter <salon>\`\nConfiguration du salon Twitter \n\n\`${prefix}config darknet <salon>\`\nConfiguration du salon Darknet  \n\n\`${prefix}config logs <salon>\`\nConfiguration du salon Logs \n\n\`${prefix}config lspd <salon>\`\nConfiguration du salon LSPD \n\n\`${prefix}config ems <salon>\`\nConfiguration du salon EMS\n\n\`${prefix}config show\`\nAffiche la liste des configurations`);
        message.channel.send(embed);
        return;
    }

    let channel = message.mentions.channels.first()
    let errChannel = new Discord.MessageEmbed()
    .setColor("RED")
    .setAuthor("Erreur")
    .setDescription(`Salon introuvable, ou manquant. Veuillez réssayer.`);

    let successConfig = new Discord.MessageEmbed()
    .setColor("GREEN")
    .setAuthor("Changement effectué avec succès !")
    .setDescription(`Les changements ont été sauvegardés avec succès.`);


    if(args[0] === "logs") {
        if(!channel) return message.channel.send(errChannel);

        let logs = await logsSettings.findOne({ gid: message.guild.id });
        logs.channel = channel.id;
        await logs.save().catch(()=>{});

        message.channel.send(successConfig);
    }

    if(args[0] === "darknet") {
        if(!channel) return message.channel.send(errChannel);

        let darknet = await darknetSettings.findOne({ gid: message.guild.id });
        darknet.channel = channel.id;
        await darknet.save().catch(()=>{});

        message.channel.send(successConfig);
    }

    if(args[0] === "twitter") {
        if(!channel) return message.channel.send(errChannel);

        let twitter = await twitterSettings.findOne({ gid: message.guild.id });
        twitter.channel = channel.id;
        await twitter.save().catch(()=>{});

        message.channel.send(successConfig);
    }

    if(args[0] === "lspd") {
        if(!channel) return message.channel.send(errChannel);

        let lspd = await lspdSettings.findOne({ gid: message.guild.id });
        lspd.channel = channel.id;
        await lspd.save().catch(()=>{});

        message.channel.send(successConfig);
    }

    if(args[0] === "ems") {
        if(!channel) return message.channel.send(errChannel);

        let ems = await emsSettings.findOne({ gid: message.guild.id });
        ems.channel = channel.id ;
        await ems.save().catch(()=>{});

        message.channel.send(successConfig);
    }

    if(args[0] === "show") {

        let logs = await logsSettings.findOne({ gid: message.guild.id });
        let ems = await emsSettings.findOne({ gid: message.guild.id });
        let darknet = await darknetSettings.findOne({ gid: message.guild.id });
        let lspd = await lspdSettings.findOne({ gid: message.guild.id });
        let twitter = await twitterSettings.findOne({ gid: message.guild.id });

        logs = logs.channel;
        ems = ems.channel;
        darknet = darknet.channel;
        lspd = lspd.channel;
        twitter = twitter.channel;

        let embed = new Discord.MessageEmbed()
        .setAuthor("Configuration des salons :")
        .setColor("RANDOM")
        .setDescription(`Twitter : <#${twitter}>\nDarknet : <#${darknet}>\nLogs : <#${logs}>\nLSPD : <#${lspd}>\nEMS : <#${ems}>`)
        .setFooter(`${message.guild.name}`, message.guild.iconURL);

        message.channel.send(embed);
    }
}

module.exports.config = {
    name: "config",
    description: `/`,
    usage: "/config",
    accessableby: "Tous",
    aliases: ['']
}