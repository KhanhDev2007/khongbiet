const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const ayarlar = require('../../ayarlar.json');
const fs = require('fs');
const path = require('path');
const filePath = path.join(__dirname, '..', '..', 'database', 'users.txt');
const FileMaintenance = path.join(__dirname, '..', '..', 'database', 'maintenance.txt');
var img = ayarlar.img;

module.exports = {
    data: new SlashCommandBuilder()
        .setName('admin')
        .setDescription('The command of the admin')
        .addSubcommand(subcommand =>
            subcommand
                .setName('usersadd')
                .setDescription('To add a user')
                .addUserOption(option => option
                    .setName('user')
                    .setDescription('The name of the user you want to add')
                    .setRequired(true))
                .addStringOption(option => option
                    .setName('plan')
                    .setDescription('Plan')
                    .setRequired(true)
                    .addChoices(
                        { name: 'Free', value: 'Free' },
                        { name: 'SmS', value: 'SmS' },
                        { name: 'Vip', value: 'Vip' },
                        { name: 'Admin', value: 'Admin' },
                    ))
                .addNumberOption(option => option
                    .setName('concurrents')
                    .setDescription('Concurrents')
                    .setMinValue(0)
                    .setMaxValue(10)
                    .setRequired(true))
                .addNumberOption(option => option
                    .setName('attacktime')
                    .setDescription('Attack time | Measured in seconds')
                    .setMinValue(0)
                    .setMaxValue(300)
                    .setRequired(true))
                .addStringOption(option => option
                    .setName('duration')
                    .setDescription('Expiration time (Ex: 30d 24h 60m 60s)')
                    .setRequired(false)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('usersremove')
                .setDescription('To delete a user.')
                .addUserOption(option => option
                    .setName('user')
                    .setDescription('Tên người bạn muốn xóa điểm')
                    .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('maintenance')
                .setDescription('Turn on/off maintenance bot.')
                .addBooleanOption(option => option
                    .setName('status')
                    .setDescription('On/Off maintenance bot')
                    .setRequired(true))),

    run: async (client, interaction) => {
        fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) {
                console.error('Error when reading user information from the database:', err);
                return;
            }

            const userData = data.split('\n').find(entry => entry.startsWith(`${interaction.user.id} `));

            if (userData) {
                const [userId, plans, concurrents, attacktime, expirationTime] = userData.split(' ');

                if (plans !== 'Admin') {
                    interaction.reply({ content: '**ERROR**: You need to have at least a \`Admin\` plan to use this command.', ephemeral: true });
                    return;
                }
            } else {
                interaction.reply({ content: '**ERROR**: You need to have the **`Admin`** plan to use this command.', ephemeral: true });
            return;
        }

        if (interaction.options.getSubcommand() === 'usersadd') {
            const selectUser = interaction.options.getUser('user');
            if (!selectUser) selectUser = interaction.author;
            if (selectUser.bot) return interaction.reply({ content: `${selectUser} must be a user!!`, ephemeral: true });
            const plan = interaction.options.getString('plan');
            const concurrents = interaction.options.getNumber('concurrents');
            const attacktime = interaction.options.getNumber('attacktime');
            const duration = interaction.options.getString('duration') || '30d';
            const durationDays = convertDurationToDays(duration);

            if (!/\d+[dhms]/.test(duration)) {
                interaction.reply({ content: '**ERROR**: Please enter the correct value (Ex: 30d 24h 60m 60s)', ephemeral: true });
            return;
            }

            function convertDurationToDays(durationString) {
                const regex = /(\d+)([dhms])/g;
                let match;
                let totalDays = 0;

            while ((match = regex.exec(durationString))) {
                const value = parseInt(match[1]);
                const unit = match[2];

                if (unit === 'd') {
                    totalDays += value;
                } else if (unit === 'h') {
                   totalDays += value / 24;
                } else if (unit === 'm') {
                    totalDays += value / (24 * 60);
                } else if (unit === 's') {
                    totalDays += value / (24 * 60 * 60);
                }
            }

            return totalDays;
            }
            const currentTime = Date.now();
            const expirationTime = currentTime + durationDays * 24 * 60 * 60 * 1000;

            const expirationDate = new Date(expirationTime);
            const formattedExpirationDate = `${expirationDate.getDate()}/${expirationDate.getMonth() + 1}/${expirationDate.getFullYear()}`;

            const dataToAdd = `${selectUser.id} ${plan} ${concurrents} ${attacktime} ${expirationTime} | ${selectUser.username} - Expires on ${formattedExpirationDate}\n`;

            fs.readFile(filePath, 'utf8', (err, data) => {
                if (err) {
                    console.error('Error when reading user information from the database:', err);
                } else {

                    const userExists = data.includes(`${selectUser.id} `);

                    if (userExists) {

                        const newData = '\n' + data.replace(new RegExp(`${selectUser.id} \\S+ \\d+ \\d+ \\d+\\n?`), dataToAdd) + '\n';
                        fs.writeFile(filePath, newData, 'utf8', (err) => {
                            if (err) {
                                console.error('Error when updating user information to the database:', err);
                            } else {
                            
                                interaction.reply({ content: `**DONE**: The user was updated successfully. \`/user info @${selectUser.tag}\` to view more details.`, ephemeral: true });
                                try {
                                    selectUser.send({
                                        embeds: [
                                          new EmbedBuilder()
                                          .setColor('Random')
                                          .setTitle(`EXCELLENT`)
                                          .setDescription(`You have received the \`${plan}\` plan from \`${interaction.user.username}\`\n\nPlan have \`${concurrents}\` concurrents and \`${attacktime}\` second attack.\nThe plan will be valid for: **\`${formattedExpirationDate}\`**\n\nUse \`/user ifno\` to check.`)
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
                    
                        fs.appendFile(filePath, '\n' + dataToAdd, 'utf8', (err) => {
                            if (err) {
                                console.error('Error when adding user information to the database:', err);
                            } else {
                            
                                interaction.reply({ content: `**DONE**: The user was added successfully. \`/user info @${selectUser.tag}\` to view more details`, ephemeral: true });
                                try {
                                    selectUser.send({
                                        embeds: [
                                          new EmbedBuilder()
                                          .setColor('Random')
                                          .setTitle(`EXCELLENT`)
                                          .setDescription(`You have received the \`${plan}\` plan from \`${interaction.user.username}\`\n\nPlan have \`${concurrents}\` concurrents and \`${attacktime}\` second attack.\nThe plan will be valid for: **\`${formattedExpirationDate}\`**\n\nUse \`/user ifno\` to check.`)
                                          .setFooter({ text: "© Developer: HuyXingum8K#4933", iconURL: img })
                                          .setTimestamp(),
                                        ], ephemeral: true 
                                    });
                                } catch (error) {
                                  console.error('Không thể gửi tin nhắn DM cho người dùng:', error);
                                }
                            }
                        });
                        }
                }
            });
        }

        if (interaction.options.getSubcommand() === 'usersremove') {
            const selectUser = interaction.options.getUser('user');

            fs.readFile(filePath, 'utf8', (err, data) => {
                if (err) {
                    console.error('Error when removing user information to the database:', err);
                } else {
                    const userExists = data.includes(`${selectUser.id} `);

                    if (userExists) {
                        const newData = data.replace(new RegExp(`${selectUser.id} \\S+ \\d+ \\d+ \\d+\\n?`), '');
                        fs.writeFile(filePath, newData, 'utf8', (err) => {
                            if (err) {
                                console.error('Error when removing user information to the database:', err);
                            } else {
                                interaction.reply({ content: `**DONE**: User ${selectUser} have been deleted`, ephemeral: true });
                                try {
                                    selectUser.send({
                                        embeds: [
                                          new EmbedBuilder()
                                          .setColor('Random')
                                          .setTitle(`NO WAY`)
                                          .setDescription(`You have been removed from the data by \`${interaction.user.username}.`)
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

        if (interaction.options.getSubcommand() === 'maintenance') {
            const maintenanceOption = interaction.options.getBoolean('status');
            let currentMaintenanceStatus = '';

            try {
                currentMaintenanceStatus = fs.readFileSync(FileMaintenance, 'utf8').trim();
            } catch (err) {
                console.error('Lỗi khi đọc tệp maintenance.txt:', err);
            }

            if (maintenanceOption === (currentMaintenanceStatus === 'true')) {
                if (maintenanceOption) {
                    interaction.reply({
                        content: 'Maintenance mode has been turned on.',
                        ephemeral: true
                    });
                } else {
                    interaction.reply({
                        content: 'Maintenance mode has been turned off.',
                        ephemeral: true
                    });
                }
            } else {
                fs.writeFile(FileMaintenance, maintenanceOption ? 'true' : 'false', (err) => {
                    if (err) {
                        console.error('Lỗi khi ghi vào tệp maintenance:', err);
                        return;
                    }
                });

                interaction.reply({
                    content: `Maintenance mode has been turned ${maintenanceOption ? 'on' : 'off'}.`,
                    ephemeral: true
                });
            }
        }
        });
    }
}

function getUserPoints(userId) {
    const data = fs.readFileSync(filePath, 'utf8');
    const userData = data.split('\n').find(entry => entry.startsWith(`${userId} `));

    if (userData) {
        return parseInt(userData.split(' ')[1]);
    }

    return 0;
}