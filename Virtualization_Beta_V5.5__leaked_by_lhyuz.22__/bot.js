const { Client, Collection } = require('discord.js');
const ayarlar = require('./ayarlar.json');
var token = ayarlar.token;

const client = new Client({
    intents: ["Guilds", "GuildMembers", "GuildMessages", "MessageContent"],
    partials: ["User", "Message", "GuildMember", "ThreadMember"],
    shards: "auto"
});
var colors = require('colors');

client.aliases = new Collection();
client.categories = new Collection();
client.interactions = new Collection();
client.cooldowns = new Collection();

['collections', 'slashCommands', 'events'].forEach(handler => require(`./handlers/${handler}`)(client));

client.on('ready', message => {
  console.log(' ██░ ██  █    ██▓██   ██▓▒██   ██▒ ██▓ ███▄    █   ▄████  █    ██  ███▄ ▄███▓'.red);
  console.log('▓██░ ██▒ ██  ▓██▒▒██  ██▒▒▒ █ █ ▒░▓██▒ ██ ▀█   █  ██▒ ▀█▒ ██  ▓██▒▓██▒▀█▀ ██▒'.red);
  console.log('▒██▀▀██░▓██  ▒██░ ▒██ ██░░░  █   ░▒██▒▓██  ▀█ ██▒▒██░▄▄▄░▓██  ▒██░▓██    ▓██░'.red);
  console.log('░▓█ ░██ ▓▓█  ░██░ ░ ▐██▓░ ░ █ █ ▒ ░██░▓██▒  ▐▌██▒░▓█  ██▓▓▓█  ░██░▒██    ▒██ '.red);
  console.log('░▓█▒░██▓▒▒█████▓  ░ ██▒▓░▒██▒ ▒██▒░██░▒██░   ▓██░░▒▓███▀▒▒▒█████▓ ▒██▒   ░██▒'.red);
  console.log(' ▒ ░░▒░▒░▒▓▒ ▒ ▒   ██▒▒▒ ▒▒ ░ ░▓ ░░▓  ░ ▒░   ▒ ▒  ░▒   ▒ ░▒▓▒ ▒ ▒ ░ ▒░   ░  ░'.red);
  console.log(' ▒ ░▒░ ░░░▒░ ░ ░ ▓██ ░▒░ ░░   ░▒ ░ ▒ ░░ ░░   ░ ▒░  ░   ░ ░░▒░ ░ ░ ░  ░      ░'.red);
  console.log(' ░  ░░ ░ ░░░ ░ ░ ▒ ▒ ░░   ░    ░   ▒ ░   ░   ░ ░ ░ ░   ░  ░░░ ░ ░ ░      ░   '.red);
  console.log(' ░  ░  ░   ░     ░ ░      ░    ░   ░           ░       ░    ░            ░   '.red);
  console.log('                 ░ ░                                                         '.red);

});

client.login(token);
