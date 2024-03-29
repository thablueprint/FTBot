const Discord = require('discord.js')
const bot = new Discord.Client()
const MinecraftAPI = require('minecraft-api');
const config = require("./config.json");
const fs = require('fs');
var prefix = ("!");
var whitelist = "../servermc/whitelist.json";
var Rcon = require('rcon');

var numa = 0;
var numb = 0;

var conn = new Rcon(config.rcon_adress, config.rcon, config.rcon_password);
conn.on('auth', function() {
  console.log("Authed!");
  
}).on('response', function (str) {
  if(str == "Reloaded the whitelist")
  {
    numa = 0;
    numb = 0;

  }else
  {
    numa = str.substring(0, 14)
    numa = numa.match(/[0-9]+/g);
  
    numb = str.substring(16, 26)
    numb = numb.match(/[0-9]+/g);
  }

}).on('end', function() {
  console.log("Socket closed!");
  process.exit();

});

conn.connect();

function update(){
    conn.send("list");
    if (typeof numa[0] === 'undefined'){
        bot.user.setActivity("Ajoute quelqu'un à la whitelist")
    }else{
        bot.user.setActivity(numa[0] + " / " + numb[0])
    }
}
setInterval(update, 2000);

bot.on('ready', function () {
  console.log("Je suis connecté !")
})

bot.login(config.token)

bot.on('message', message => {
    if (message.content.startsWith(prefix + "rand ")){
        var rip = message.content.substr("!rand ".length);
        byebye = Math.floor(Math.random() * rip);
        message.reply(byebye)
    }
    if (message.channel.id == config.channel){
        if (message.content.startsWith(prefix + "whitelist ")) {
            var pseudo = message.content.substr("!whitelist ".length);

            MinecraftAPI.uuidForName(pseudo).then(function(result){
                if (!result.includes("-")) {
                    result = result.substring(0, 8) + "-"
                        + result.substring(8, 12) + "-"
                        + result.substring(12, 16) + "-"
                        + result.substring(16, 20) + "-"
                        + result.substring(20, 32);
                }
                console.log(result)
                message.reply('Envoyé ! Tu peux maintenant te connecter au serveur')
                
                var content = fs.readFileSync(whitelist);
                var old = JSON.parse(content);

                let info = {
                    uuid: result,
                    name: pseudo
                }

                old.push(info);

                let rebuild = JSON.stringify(old, null, 2);
                fs.writeFileSync(whitelist, rebuild);

                conn.send("whitelist reload");
                
            });
        }
    }
})


