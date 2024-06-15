const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const Discord = require("discord.js");
const ayarlar = require('../../ayarlar.json');
var img = ayarlar.img;
const fs = require('fs');
const path = require('path');
const fileKey = path.join(__dirname, '..', '..', 'database', 'keys.txt');
const filePath = path.join(__dirname, '..', '..', 'database', 'users.txt');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('key')
    .setDescription('Sử dụng key')
    .addStringOption(option => option
            .setName("key")
            .setDescription("Key của bạn")
            .setMaxLength(30)
            .setRequired(true)),

    run: async (client, interaction) => {
    await interaction.deferReply({
      ephemeral: true,
    });

    const key = interaction.options.getString('key');

    fs.readFile(fileKey, 'utf8', (err, data) => {
      if (err) {
          console.error('Error when reading user information from the database:', err);
          return;
      }

      const userData = data.split('\n').find(entry => entry.startsWith(`${interaction.user.id} `));

      if (userData) {
          const [userId, keys, links, haskey, claimed, expirationTime] = userData.split(' ');

          if (key != keys) {
            interaction.editReply({
              embeds: [
                new EmbedBuilder()
                  .setColor('Random')
                  .setTitle('ERROR')
                  .setDescription(`Your key is incorrect, please get another key.`)
                  .setFooter({ text: "© Developer: HuyXingum8K#4557", iconURL: img })
                  .setTimestamp(),
                  ], ephemeral: true 
            })
            return;
          }

          if (claimed === 'true') {
            interaction.editReply({
              embeds: [
                new EmbedBuilder()
                  .setColor('Random')
                  .setTitle('ERROR')
                  .setDescription(`The key has been used already, please get another key.`)
                  .setFooter({ text: "© Developer: HuyXingum8K#4557", iconURL: img })
                  .setTimestamp(),
                  ], ephemeral: true 
            })
            return;
          }
          fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) {
                console.error('Error when removing user information to the database:', err);
            } else {
              const userExists = data.includes(`${interaction.user.id} `);
              if (userExists) {
                interaction.editReply({
                  embeds: [
                    new EmbedBuilder()
                      .setColor('Random')
                      .setTitle(`ERROR`)
                      .setDescription(`You currently have a plan, so you cannot use the key.\n\nUse \`/user ifno\` to check.`)
                      .setFooter({ text: "© Developer: HuyXingum8K#4933", iconURL: img })
                      .setTimestamp(),
                    ], ephemeral: true 
                });
              } else {
                try {
                  fs.readFile(fileKey, 'utf8', (err, data) => {
                    if (err) {
                        console.error('Error when reading user information from the database:', err);
                        return;
                    } else {
                      const [userId, keys, links, haskey, claimed, expirationTime] = userData.split(' ');
                      const updatedData = data.replace(`${claimed}`, `true`);
                      fs.writeFile(fileKey, updatedData, 'utf8', (err) => {
                        if (err) {
                          console.error('Error when updating key information in the database:', err);
                        }
                      });
                    }
                  })

                  const currentTime = Date.now();
                  const expirationTimes = currentTime + 3 * 60 * 60 * 1000;

                  const expirationDate = new Date(expirationTimes);
                  const formattedExpirationDate = `${expirationDate.getDate()}/${expirationDate.getMonth() + 1}/${expirationDate.getFullYear()}`;
                  const dataToAdd = `${interaction.user.id} Free 1 60 ${expirationTimes} | ${interaction.user.username} - Expires on ${formattedExpirationDate}\n`;

                  fs.appendFile(filePath, '\n' + dataToAdd, 'utf8', (err) => {
                        if (err) {
                            console.error('Error when adding user information to the database:', err);
                        } else {
                          interaction.editReply({
                            embeds: [
                              new EmbedBuilder()
                              .setColor('Random')
                              .setTitle(`EXCELLENT`)
                              .setDescription(`You have successfully entered the key: \`${keys}\`\n\nYou have received the plan: **\`Free\`**\nThe plan will be valid for: **\`3 hours\`**\n\nUse \`/user ifno\` to check.`)
                              .setFooter({ text: "© Developer: HuyXingum8K#4933", iconURL: img })
                              .setTimestamp(),
                            ], ephemeral: true 
                        });
                      }
                  });
                } catch (error) {
                  console.error('Không thể gửi tin nhắn DM cho người dùng:', error);
                }
              }
            }
          })

      } else {
        interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setColor('Random')
              .setTitle('ERROR')
              .setDescription('You don\'t currently have a key in the database. Please use `/getkey` to obtain one')
              .setFooter({ text: "© Developer: HuyXingum8K#4557", iconURL: img })
              .setTimestamp(),
            ], ephemeral: true
        })
      }
    })

  },
};