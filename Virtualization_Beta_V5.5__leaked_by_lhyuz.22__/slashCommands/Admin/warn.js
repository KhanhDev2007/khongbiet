const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const ayarlar = require('../../ayarlar.json');
const { QuickDB } = require("quick.db");
const db = new QuickDB({ filePath: "database.sqlite" });
const fs = require('fs');
const path = require('path');
const filePath = path.join(__dirname, '..', '..', 'database', 'users.txt');
const fileWarn = path.join(__dirname, '..', '..', 'database', 'warns.txt');
var img = ayarlar.img;
var ownerID = ayarlar.ownerID;

module.exports = {
  data: new SlashCommandBuilder()
    .setName('warn')
    .setDescription('Cảnh báo người dùng')
    .addSubcommand(subcommand =>
      subcommand
        .setName('add')
        .setDescription('Thêm cảnh báo cho người dùng')
        .addUserOption(option => option
            .setName('user')
            .setDescription('Người dùng bạn muốn cảnh báo')
            .setRequired(true))
        .addStringOption(option => option
            .setName('reason')
            .setDescription('Lý do')
            .setRequired(true)))
    .addSubcommand(subcommand =>
      subcommand
        .setName('remove')
        .setDescription('Xóa cảnh báo của người dùng')
        .addUserOption(option => option
            .setName('user')
            .setDescription('Người dùng bạn muốn xóa cảnh báo')
            .setRequired(true))),

  run: async (client, interaction, args) => {
    fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) {
                console.error('Error when reading user information from the database:', err);
                return;
            }

            const userData = data.split('\n').find(entry => entry.startsWith(`${interaction.user.id} `));

            if (userData) {
                const [userId, plans, concurrents, attacktime, expirationTime] = userData.split(' ');

                if (plans !== 'Admin') {
                    interaction.reply({ content: '**ERROR**: You need to have the **`Admin`** plan to use this command.', ephemeral: true });
                    return;
                }
            } else {
                interaction.reply({ content: '**ERROR**: You need to have the **`Admin`** plan to use this command.', ephemeral: true });
        return;
    }

    if (interaction.options.getSubcommand() === 'add') {
      
            const selectUser = interaction.options.getUser('user');
            if (!selectUser) selectUser = interaction.author;
            if (selectUser.bot) return interaction.reply({ content: `${selectUser} must be a user!`, ephemeral: true });
            const reason = interaction.options.getString('reason');

            // Đọc dữ liệu cảnh báo hiện tại từ tệp "warns.txt"
            fs.readFile(fileWarn, 'utf8', (err, data) => {
                if (err) {
                    console.error('Lỗi khi đọc dữ liệu cảnh báo từ tệp:', err);
                    return;
                }

                // Tách thông tin cảnh báo của các người dùng thành mảng
                const userWarnings = data.split('\n').map(entry => entry.split(' '));
                
                // Tìm thông tin cảnh báo của người dùng được cảnh báo
                const warnedUser = userWarnings.find(entry => entry[0] === selectUser.id);

                // Nếu người dùng đã tồn tại trong danh sách cảnh báo
                if (warnedUser) {
                    warnedUser[1]++; // Tăng số lần cảnh báo
                } else {
                    // Nếu người dùng chưa có cảnh báo trước đó, thêm mới vào danh sách
                    userWarnings.push([selectUser.id, 1]);
                }

                // Ghi lại dữ liệu cảnh báo mới vào tệp "warns.txt"
                fs.writeFile(fileWarn, userWarnings.map(entry => entry.join(' ')).join('\n'), 'utf8', (err) => {
                    if (err) {
                        console.error('Lỗi khi ghi dữ liệu cảnh báo vào tệp:', err);
                        return;
                    }
                    
                    // Nếu người dùng đã nhận đủ 3 lần cảnh báo
                    if (warnedUser && warnedUser[1] >= 3) {
                        interaction.reply({ content: `${selectUser} have been banned from using the bot's commands due to receiving 3 warnings.`, ephemeral: true });

                        try {
                            selectUser.send({
                                embeds: [
                                    new EmbedBuilder()
                                        .setColor('Random')
                                        .setTitle(`:warning: WARNING :warning:`)
                                        .setDescription(`You have been banned from using the bot because you have received 3 warnings!`)
                                        .setFooter({ text: "© Developer: HuyXingum8K#4933", iconURL: img })
                                        .setTimestamp(),
                                ], ephemeral: true
                            });
                        } catch (error) {
                            console.error('Không thể gửi tin nhắn DM cho người dùng:', error);
                        }
                    } else {
                        // Nếu chưa đạt đến 3 lần cảnh báo, thông báo số lần cảnh báo còn lại
                        const remainingWarnings = 3 - (warnedUser ? warnedUser[1] : 0);
                        interaction.reply({ content: `**Warning successful:** ${selectUser} has received ${warnedUser ? warnedUser[1] : 1} warning. ${remainingWarnings} more warnings before being banned.`, ephemeral: true });

                        selectUser.send({
                            embeds: [
                                new EmbedBuilder()
                                    .setColor('Random')
                                    .setTitle(`**:warning: WARNING** :warning:`)
                                    .setDescription(`You have been warned by:: \`${interaction.user.username}\`
              \nReason: \`${reason}\`
              \nYou have currently received: \`${warnedUser ? warnedUser[1] : 1}\`
              \n\nYou will be banned from using the bot upon receiving 3 warnings!`)
                                    .setFooter({ text: "© Developer: HuyXingum8K#4933", iconURL: img })
                                    .setTimestamp(),
                            ], ephemeral: true
                        });
                    }
                });
            });
        } //End

    if (interaction.options.getSubcommand() === 'remove') {

    const selectUser = interaction.options.getUser('user');
    if (!selectUser) selectUser = interaction.author;
    if (selectUser.bot) return interaction.reply({ content: `${selectUser} must be a user!`, ephemeral: true });

    fs.readFile(fileWarn, 'utf8', (err, data) => {
      if (err) {
        console.error('Error when removing user information to the database:', err);
      } else {
        const userExists = data.includes(`${selectUser.id} `);

        if (userExists) {
          const newData = data.replace(new RegExp(`${selectUser.id} \\d+`), '');
          fs.writeFile(fileWarn, newData, 'utf8', (err) => {
            if (err) {
              console.error('Error when removing user information to the database:', err);
            } else {
              interaction.reply({ content: `**Warning successfully removed:** ${selectUser}' warning has been removed.`, ephemeral: true });
            try {
              selectUser.send({
              embeds: [
                      new EmbedBuilder()
                        .setColor('Random')
                        .setTitle(`EXCELLENT`)
                        .setDescription(`You have been cleared of the warning by ${interaction.user}!`)
                        .setFooter({ text: "© Developer: HuyXingum8K#4933", iconURL: img })
                        .setTimestamp(),
                      ], ephemeral: true 
                  });
            } catch (error) {
              console.error('Không thể gửi tin nhắn DM cho người dùng:', error);
            }
            }
        });
      } else {
        interaction.reply({ content: `**ERROR**: ${selectUser} is not found in the database.`, ephemeral: true });
      }
      }
    });
    }
    });
  },
};
