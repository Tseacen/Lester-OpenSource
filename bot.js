const Discord = require("discord.js");
const fs = require("fs");
const bot = new Discord.Client({disableEveryone: true});
const config = require("./config");

//models db
const GuildSettings = require("./models/settings");
const twitterSettings = require("./models/twitter");
const darknetSettings = require("./models/darknet");
const economySettings = require("./models/economy");
const userBank = require("./models/user-bank");
const logsSettings = require("./models/logs");
const robbery = require("./models/robbery");
const lspdSettings = require("./models/lspd");
const mongoose = require("mongoose");

const emsSettings = require("./models/ems");
const userSettings = require("./models/user-cardId")
const witheningSettings = require("./models/withening-settings")
const joinLeaveSettings = require("./models/join-leave-data")

const colors = require('colors');

async function mongoConnect() {
    if(config.db_username && config.db_password) {
      const mongodbUrl = `mongodb+srv://${config.db_username}:${config.db_password}@cluster0.giwyh.mongodb.net/test?retryWrites=true&w=majority`;
      await console.log("[Lester] Connexion à la base de donnée en cours..");
      await mongoose.connect(mongodbUrl, {
        useNewUrlParser: true,
        useUnifiedTopology: true
      });
      await console.log("[Lester] Connexion à la base de donnée établie !".green)
    } else if(config.mongodbUrl) {
      console.log("[Lester] Un problème de compatibilité des ressources a été trouvé. Votre version du fichier \"config.js\" est trop ancienne, et doit être mis à jour vers la version 0.0.11 ou une version plus récente.".yellow);
    } else {
      console.log("[Lester] Il manque un nom d'utilisateur, ou un mot de passe pour la base de donnée MongoDB. Veuillez réessayer !".red);
      return;
    }
}

mongoConnect()

bot.on("ready", async () => {
 
  await bot.shard.broadcastEval(`
    (async => { 
      console.log(\`Instance \${this.shard.ids} lancee.\`)
    })();
`);



  console.log(`${bot.user.username} a ete lance parfaitement !`.green);
  bot.user.setActivity(`${config.botActivityMsg}`, {type: `${config.botActivity}`});

});

bot.commands = new Discord.Collection();
bot.aliases = new Discord.Collection();

fs.readdir("./commands/", (err, files) => {

    if(err) console.log(err)

    //console.log(files)
    let jsfile = files.filter(f => f.split(".").pop() === "js") 
    if(jsfile.length <= 0) {
         return console.log("[LOGS] Aucune commande existante !");
    }

    jsfile.forEach((f, i) => {
        let pull = require(`./commands/${f}`);
        bot.commands.set(pull.config.name, pull);  
        pull.config.aliases.forEach(alias => {
            bot.aliases.set(alias, pull.config.name)
        });
    });
});


bot.on("guildMemberAdd" , async member => {
  
  var joinLeaveData = await joinLeaveSettings.findOne({ gid: member.guild.id });
  if(!joinLeaveData) {
    const newID = new joinLeaveSettings({
      gid: member.guild.id,
    });
    await newID.save()
    joinLeaveData = await joinLeaveSettings.findOne({ gid: member.guild.id });

  }
  if(!joinLeaveData) return;
  let channel = joinLeaveData.joinChannel
  if(!channel) return;
  channel = member.guild.channels.cache.find(x => x.id === channel)
  if(!channel) return;
  let msg = joinLeaveData.joinMessage
  if(!msg) return;
  let sendMsg = await channel.send(checkVar(msg, member)).catch(()=>{});
  if(!sendMsg) return;

});


bot.on("guildMemberRemove" , async (member) => {
  var removeLeaveData = await joinLeaveSettings.findOne({ gid: member.guild.id });
  if(!removeLeaveData) return;
  let channel = removeLeaveData.leaveChannel
  if(!channel) return;
  channel = member.guild.channels.cache.find(x => x.id === channel)
  if(!channel) return;
  channel
});


bot.on("message", async (message) => {
    // Declaring a reply function for easier replies - we grab all arguments provided into the function and we pass them to message.channel.send function.
  
    if(message.author.bot || message.channel.type === "dm") return;
    if (!message.channel.permissionsFor(message.guild.me).has("SEND_MESSAGES")) return;

    await checkDb(message.guild.id);

    var storedSettings = await GuildSettings.findOne({ gid: message.guild.id });
    var economy = await economySettings.findOne({ gid: message.guild.id });
    var identity = await userSettings.findOne({ gid: message.guild.id, user_id: message.author.id });
    if(!identity) {
      const newID = new userSettings({
        gid: message.guild.id,
        user_id: message.author.id
      });
      await newID.save()
    }


        if(storedSettings.premium === "yes") {

              var user_bank = await userBank.findOne({ gid: message.guild.id, user_id: message.author.id });
              if (!user_bank) {
                const newSettings = new userBank({
                  gid: message.guild.id,
                  user_id: message.author.id,
                  banque: economy.amount_start
                });
                await newSettings.save().catch(()=>{});
              }

        }

    let prefix = storedSettings.prefix
  
    if (message.content.indexOf(prefix) !== 0) return;
  
    let messageArray = message.content.split(" ")
    let cmd = messageArray[0];
    let args = messageArray.slice(1);

    let commandfile = bot.commands.get(cmd.slice(prefix.length)) || bot.commands.get(bot.aliases.get(cmd.slice(prefix.length)))
    if(commandfile) commandfile.run(bot,message,args)

  
  });




  
// darknet :
bot.on("message", async message => {
  if(message.author.bot || message.channel.type === "dm") return;
    
  const dSettings = await darknetSettings.findOne({ gid: message.guild.id });
  if(!dSettings) return;

  if(message.channel.id !== dSettings.channel) return;
  
  let messageArray = message.content.split(" ")
  let argsresult = messageArray.slice(0).join(" ");
  try {
      message.delete()

      let darknetChann = message.guild.channels.cache.find(x => x.id === dSettings.channel )

      if(!argsresult[0]) return;

      let successEmbed = new Discord.MessageEmbed()

          .setColor('#050505')
          .setDescription(`${argsresult}`)


          if(dSettings.title) {
            successEmbed.setTitle(`${checkVar(dSettings.title, message.author)}`)
            }

            if(dSettings.author && !dSettings.author_url) {
              successEmbed.setAuthor(`${checkVar(dSettings.author, message.author)}`)
              }

              
            if(dSettings.author && dSettings.author_url) {
              successEmbed.setAuthor(`${checkVar(dSettings.author, message.author)}`, checkVar(dSettings.author_url, message.author))
              }

              if(dSettings.footer && !dSettings.footer_url) {
                successEmbed.setFooter(`${checkVar(dSettings.footer, message.author)}`)
              }

              if(dSettings.footer && dSettings.footer_url) {
                successEmbed.setFooter(`${checkVar(dSettings.footer, message.author)}`, checkVar(dSettings.footer_url, message.author))
              }

                      if(dSettings.time === "true") {
                      successEmbed.setTimestamp()
                      }
          const msg = await darknetChann.send(successEmbed)

          let logs = await logsSettings.findOne({ gid: message.guild.id })
          if(logs) {
              let embedLogs = new Discord.MessageEmbed()
              .setColor(`#050505`)
              .setAuthor(`Message spécifique`, 'https://zupimages.net/up/20/28/aht6.png')
              .setTimestamp()
              if(argsresult.length > 1900) {
                embedLogs.setDescription(`**Utilisateur :** ${message.author} (${message.author.id})\n**Salon :** darknet - <#${dSettings.channel}>\n**Message :** [Voir](https://discordapp.com/channels/${message.guild.id}/${message.channel.id}/${msg.id}) - Message trop long.`)
              } else {
                embedLogs.setDescription(`**Utilisateur :** ${message.author} (${message.author.id})\n**Salon :** darknet - <#${dSettings.channel}>\n**Message :** [Voir](https://discordapp.com/channels/${message.guild.id}/${message.channel.id}/${msg.id}) - \`${argsresult}\``)
              } 
              logs = message.guild.channels.cache.find(x => x.id === logs.channel )
              if(logs) {
              logs.send(embedLogs)
              };
              
          } else return;
          
} catch(err) {
  console.log(err)
const errEmbed = new Discord.MessageEmbed()
.setDescription(`Une erreur est survenue !\nCode erreur : \`${err}\``)
.addField('Que faire ?', `Si l'erreur persiste, contactez le support avec le code erreur ci-dessus si possible afin de prévenir les développeurs de la faille, ce qui nous permettra de corriger le soucis. Faites la commande \`/invite\` pour recevoir le lien d'invitation au serveur de support. Vous pouvez également trouver le lien dans la documentation.`)
message.channel.send(errEmbed);
};
});

const tConfig = require("./configuration/twitter");
// twitter :
bot.on("message", async message => {
  if(message.author.bot || message.channel.type === "dm") return;
  
  const dSettings = await twitterSettings.findOne({ gid: message.guild.id });
  if(!dSettings) return;


  if(message.channel.id !== dSettings.channel) return;
  
  let messageArray = message.content.split(" ")
  let argsresult = messageArray.slice(0).join(" ");
  try {
      message.delete()

      let twitterChann = message.guild.channels.cache.find(x => x.id === dSettings.channel )

      if(!argsresult[0]) return;

      let successEmbed = new Discord.MessageEmbed()

          .setColor('#66c2e9')
          .setDescription(`${argsresult}`)


          if(dSettings.title) {
            successEmbed.setTitle(`${checkVar(dSettings.title, message.author)}`)
            }


            if(dSettings.author && !dSettings.author_url) {
              successEmbed.setAuthor(`${checkVar(dSettings.author, message.author)}`)
              }

              if(dSettings.author && dSettings.author_url) {
                successEmbed.setAuthor(`${checkVar(dSettings.author, message.author)}`, checkVar(dSettings.author_url, message.author))
                }

              if(dSettings.footer && !dSettings.footer_url) {
                successEmbed.setFooter(`${checkVar(dSettings.footer, message.author)}`)
              }

              if(dSettings.footer && dSettings.footer_url) {
                successEmbed.setFooter(`${checkVar(dSettings.footer, message.author)}`, checkVar(dSettings.footer_url, message.author))
              }

                      if(dSettings.time === "true") {
                      successEmbed.setTimestamp()
                      }
          const msg = await twitterChann.send(successEmbed)

          let logs = await logsSettings.findOne({ gid: message.guild.id })
          if(logs) {
              let embedLogs = new Discord.MessageEmbed()
              .setColor(`#050505`)
              .setAuthor(`Message spécifique`, 'https://zupimages.net/up/20/28/aht6.png')
              .setTimestamp()
              if(argsresult.length > 1900) {
                embedLogs.setDescription(`**Utilisateur :** ${message.author} (${message.author.id})\n**Salon :** twitter - <#${dSettings.channel}>\n**Message :** [Voir](https://discordapp.com/channels/${message.guild.id}/${message.channel.id}/${msg.id}) - Message trop long.`)
              } else {
                embedLogs.setDescription(`**Utilisateur :** ${message.author} (${message.author.id})\n**Salon :** twitter - <#${dSettings.channel}>\n**Message :** [Voir](https://discordapp.com/channels/${message.guild.id}/${message.channel.id}/${msg.id}) - \`${argsresult}\``)
              } 
              logs = message.guild.channels.cache.find(x => x.id === logs.channel )
              if(logs) {
              logs.send(embedLogs)
              };
              
          } else return;
          
          //sChannel.send(reportEmbed)

} catch(err) {
  console.log(err)
const errEmbed = new Discord.MessageEmbed()
.setDescription(`Une erreur est survenue !\nCode erreur : \`${err}\``)
.addField('Que faire ?', `Si l'erreur persiste, contactez le support avec le code erreur ci-dessus si possible afin de prévenir les développeurs de la faille, ce qui nous permettra de corriger le soucis. Faites la commande \`/invite\` pour recevoir le lien d'invitation au serveur de support. Vous pouvez également trouver le lien dans la documentation.`)
message.channel.send(errEmbed);
};
});


function checkVar(text, user) {
  if(text.includes("{user_mention}")) {
  text = text.replace("{user_mention}", user);
  };

  if(text.includes("{user_tag}")) {
    text = text.replace("{user_tag}", user.discriminator);
    };

    if(text.includes("{user_username}")) {
  text = text.replace("{user_username}", user.username);
  };

  if(text.includes("{user}")) {
    text = text.replace("{user}", `${user.username}#${user.discriminator}`);
    };

  if(text.includes("{user_icon}")) {
    text = text.replace("{user_icon}", `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`);
    };

  if(text.includes("{user_id}")) {
    text = text.replace("{user_id}", user.id);
    };
    return text
};


async function checkDb(id) {
  var storedSettings = await GuildSettings.findOne({ gid: id });
  if (!storedSettings) {
    const newSettings = new GuildSettings({
      gid: id
    });
    await newSettings.save().catch(()=>{});
  }

//twitter settings
var tSettings = await twitterSettings.findOne({ gid: id });
if (!tSettings) {
let newSettings = new twitterSettings({
  gid: id
});
await newSettings.save().catch(()=>{});
}

//darknet Settings
var dSettings = await darknetSettings.findOne({ gid: id });
if (!dSettings) {
let newSettings = new darknetSettings({
  gid: id
});
await newSettings.save().catch(()=>{});
}

var eSettings = await economySettings.findOne({ gid: id });
if (!eSettings) {
let newSettings = new economySettings({
  gid: id
});
await newSettings.save().catch(()=>{});
}


  //logs
  var logs = await logsSettings.findOne({ gid: id });
  if (!logs) {
    let newSettings = new logsSettings({
      gid: id
    });
    await newSettings.save().catch(()=>{});
  }

  var robberySettings = await robbery.findOne({ gid: id });
  if (!robberySettings) {
    let newSettings = new robbery({
      gid: id
    });
    await newSettings.save().catch(()=>{});
  }

  
  var lspd = await lspdSettings.findOne({ gid: id });
  if (!lspd) {
    let newSettings = new lspdSettings({
      gid: id
    });
    await newSettings.save().catch(()=>{});
  }

  var ems = await emsSettings.findOne({ gid: id });
  if (!ems) {
    let newSettings = new emsSettings({
      gid: id
    });
    await newSettings.save().catch(()=>{});
  }

  var withening = await witheningSettings.findOne({ gid: id });
  if (!withening) {
    let newSettings = new witheningSettings({
      gid: id
    });
    await newSettings.save().catch(()=>{});
  }
};

if(config.token) {
bot.login(config.token);
} else {
  console.log("[Lester] Veuillez entrer un token dans le fichier \"config.js\". Rendez-vous sur la page GitHub pour suivre les étapes de la documentation afin de faire fonctionner le bot parfaitement.");
  return;
}
