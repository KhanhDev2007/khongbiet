const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const ayarlar = require('../../ayarlar.json');
const fs = require('fs');
const path = require('path');
const fileOngoing = path.join(__dirname, '..', '..', 'database', 'ongoing.txt');
var img = ayarlar.img;
var ownerID = ayarlar.ownerID;

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ongoing')
        .setDescription('View ongoing attacks" or "Check ongoing attacks'),

    run: async (client, interaction) => {
        await interaction.deferReply({
            ephemeral: false,
        });

        fs.access(fileOngoing, fs.constants.F_OK, (err) => {
            if (err) {
                interaction.editReply('**ERROR**: Please try again.');
            } else {
                fs.readFile(fileOngoing, 'utf8', (err, data) => {
                    if (err) throw err;

                    const lines = data.split('\n');
                    const formattedData = lines.map(line => {
                        const match = line.match(/([^ ]+) ([^ ]+) ([^ ]+) (\d+)/);
                        if (match) {
                            const [, username, method, target, time] = match;
                            const usertag = client.users.cache.get(username);
                            const currentTime = Date.now();
                            const expirationTime = (time - currentTime)/1000;
                            return `User: ${usertag.username} | Method: ${method} | Target: ${target} | Time: ${expirationTime.toFixed(0)} seconds`;
                        } else {
                            return 'Currently, there are no ongoing attacks';
                        }
                    });

                    interaction.editReply({ content:'Ongoing:\n```' + formattedData.join('\n') + '```', ephemeral: true });
                });
            }
        });

    }
}
