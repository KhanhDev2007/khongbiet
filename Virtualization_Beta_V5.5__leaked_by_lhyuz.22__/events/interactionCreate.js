const { CommandInteraction, InteractionType, EmbedBuilder, Collection } = require('discord.js');
const ms = require('ms');
const fs = require('fs');
const path = require('path');
const fileWarn = path.join(__dirname, '..', 'database', 'warns.txt');
const FileMaintenance = path.join(__dirname, '..', 'database', 'maintenance.txt');
const ayarlar = require('../ayarlar.json');
var img = ayarlar.img;
var ownerID = ayarlar.ownerID;

module.exports = {
    name: "interactionCreate",

    run: async (client, interaction) => {
        if(!interaction.isChatInputCommand())return;

        const command = client.slashCommands.get(interaction?.commandName);

        if(!command){
            return interaction.reply({
                content: "Lỗi.",
                ephemeral: true
            });
        }

        fs.readFile(FileMaintenance, 'utf8', (err, data) => {
            if (err) {
                console.error('Lỗi khi đọc dữ liệu:', err);
                return;
            }
                if (data.trim() === 'true' && interaction.user.id !== ownerID) {
                    interaction.reply({
                        embeds: [
                            new EmbedBuilder()
                                .setColor('Random')
                                .setTitle(`:warning: MAINTENANCE :warning:`)
                                .setDescription(`Bot is currently under maintenance, please try again later!`)
                                .setFooter({ text: "© Developer: HuyXingum8K#4933", iconURL: img })
                                .setTimestamp(),
                        ], ephemeral: true
                    });
                } else {
                    fs.readFile(fileWarn, 'utf8', (err, data) => {
                            if (err) {
                                console.error('Lỗi khi đọc dữ liệu cảnh báo từ tệp:', err);
                                return;
                            }

                            const warnedUser = data.split('\n').find(entry => entry.startsWith(`${interaction.user.id} `));

                            if (warnedUser) {
                                const [userId, warns] = warnedUser.split(' ');
    
                                if (warns >= 3) {     
                                    return interaction.reply({
                                        embeds: [
                                            new EmbedBuilder()
                                                .setColor('Random')
                                                .setTitle(`:warning: WARNING :warning:`)
                                                .setDescription(`You are not allowed to use this command as you have received 3 warnings!`)
                                                .setFooter({ text: "© Developer: HuyXingum8K#4933", iconURL: img })
                                                .setTimestamp(),
                                        ], ephemeral: true
                                    });
                                }
                            }

                        if (!client.cooldowns.has(command.name)) client.cooldowns.set(command.name, new Collection());
                        const now = Date.now();
                        const timestamps = client.cooldowns.get(command.name);
                        const cooldownAmount = (command.cooldown || 3) * 1000;
                        if (timestamps.has(interaction.user.id)) {
                            const expirationTime = timestamps.get(interaction.user.id) + cooldownAmount;

                            if (now < expirationTime) {
                                const timeLeft = (expirationTime - now) / 1000;
                                return interaction.reply({
                                        embeds: [
                                                  new EmbedBuilder()
                                                    .setColor('Random')
                                                    .setDescription(`Please wait for ${timeLeft.toFixed(1)} seconds to use this command!`)
                                                    .setFooter({ text: "© Developer: HuyXingum8K#4557" })
                                                    .setTimestamp(),
                                               ], ephemeral: true 
                                              });
                            }
                        }
                    timestamps.set(interaction.user.id, now);
                    setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);
                        command.run(client, interaction)
                        });
                }
        });
    }
}