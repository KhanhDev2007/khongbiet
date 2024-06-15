const Discord = require('discord.js')
const fs = require('fs');
const ayarlar = require('../ayarlar.json');
var token = ayarlar.token;
var clientID = ayarlar.clientID;

module.exports = async (client) => {      

    let slashArray = [];
    let slashNumber = 0

    const commandFolders = fs.readdirSync("./slashCommands/");
    for (const folder of commandFolders) {
	    const commandFiles = fs.readdirSync(`./slashCommands/${folder}`).filter(file => file.endsWith(".js"));

	    for (const file of commandFiles) {
		    const files = require(`../slashCommands/${folder}/${file}`);
        
            client.slashCommands.set(files.data.name, files);
            slashArray.push(files.data.toJSON());

            slashNumber++
            continue;
        }
    }

    await new Discord.REST({ version: "10" }).setToken(token).put(
        Discord.Routes.applicationCommands(clientID), {
            body: slashArray
        }
    )

    client.slashCommands.set(slashArray);
}
