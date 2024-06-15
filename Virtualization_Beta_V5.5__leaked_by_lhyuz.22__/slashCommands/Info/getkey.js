const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const Discord = require("discord.js");
const ayarlar = require('../../ayarlar.json');
var img = ayarlar.img;
var version = ayarlar.versionbot;
const axios = require('axios');
const { exec } = require('child_process');

const fs = require('fs');
const path = require('path');
const fileKey = path.join(__dirname, '..', '..', 'database', 'keys.txt');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('getkey')
    .setDescription('Lấy key của bạn'),

    run: async (client, interaction) => {
    await interaction.deferReply({
      ephemeral: true,
    });

    fs.readFile(fileKey, 'utf8', (err, data) => {
            if (err) {
                console.error('Error when reading user information from the database:', err);
                return;
            }

            const userData = data.split('\n').find(entry => entry.startsWith(`${interaction.user.id} `));

            if (userData) {
                const [userId, keys, links, haskey, claimed, expirationTime] = userData.split(' ');

                const currentTime = Date.now();
                const timeRemaining = expirationTime - currentTime;

                const hoursRemaining = Math.floor((timeRemaining % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
                const minutesRemaining = Math.floor((timeRemaining % (60 * 60 * 1000)) / (60 * 1000));
                const secondsRemaining = Math.floor((timeRemaining % (60 * 1000)) / 1000);

                if (haskey === 'true') {
                    interaction.editReply({
                      embeds: [
                        new EmbedBuilder()
                          .setColor('Random')
                          .setTitle('ERROR')
                          .setDescription(`You have already obtained the key.\n\n[Click to get key again](${links})\n\n\`Refresh time for get key: ${hoursRemaining} hours ${minutesRemaining} minutes ${secondsRemaining} seconds\``)
                          .setFooter({ text: "© Developer: HuyXingum8K#4557", iconURL: img })
                          .setTimestamp(),
                         ], ephemeral: true 
                    });
                    return;
                }
            } else {
                var api_link = ayarlar.getKey.api;
                var api_token = ayarlar.getKey.token;
                var url = ayarlar.getKey.url;

                const genKey = generateKey();
              async function fetchData() {
                try {
                  const response = await axios.get(`${api_link}?api=${api_token}&url=${url}?key=${genKey}`);
                  const link = response.data.shortenedUrl;

                  const embed = new EmbedBuilder()
                        .setColor('Random')
                        .setTitle('**Key của bạn**')
                        .setDescription(`[Click to get key](${link})\nAfter obtaining the key, use \`/key <your key>\` to use the key\n\n\`Please do not share the key as each key can only be used once, and you must wait for 6 hours before obtaining another one!\``)
                        .setFooter({ text: "© Developer: HuyXingum8K#4557 | Virtualization", iconURL: img })
                        .setTimestamp();
                  interaction.user.send({ embeds: [embed] }).catch(async (err) => {
                    console.log(err)

                    return interaction.editReply({
                        content: `Unable to obtain the key, please try again.`, ephemeral: true
                    })
                    .catch((err) => {})
                  })

                  interaction.editReply({
                    embeds: [
                      new EmbedBuilder()
                        .setColor('Random')
                        .setTitle(version)
                        .setDescription("```css\n[ Key has been generated ]\n\```")
                        .setFooter({ text: "© Developer: HuyXingum8K#4557 | Virtualization", iconURL: img })
                        .setTimestamp(),
                    ], ephemeral: true 
                  })
                  .catch((err) =>{})

                  const currentTime = Date.now();
                  const expirationDate = currentTime + 6 * 60 * 60 * 1000;

                  exec(`node methods/webhook.js "${interaction.user.username}" "${genKey}" "${link}"`, (error, stdout) => {});

                  const dataToAdd = `${interaction.user.id} ${genKey} ${link} true false ${expirationDate} | ${interaction.user.username}\n`;
                  fs.appendFile(fileKey, '\n' + dataToAdd, 'utf8', (err) => {
                      if (err) {
                          console.error('Error when updating user information to the database:', err);
                      }
                  });
                } catch (error) {
                  console.error('Lỗi khi gửi yêu cầu GET:', error);
                  interaction.editReply({ content: '**ERROR**: Unable to get the key.', ephemeral: true });
                }
              }
            fetchData();
            return;
        }
    })
  },
};

function generateKey() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let key = 'FreeDDoS_';

  for (let i = 0; i < 15; i++) {
    key += characters.charAt(Math.floor(Math.random() * characters.length));
  }

  return key;
}