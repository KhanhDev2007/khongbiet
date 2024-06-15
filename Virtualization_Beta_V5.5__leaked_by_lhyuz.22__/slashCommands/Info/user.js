const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, EmbedBuilder } = require('discord.js');
const ayarlar = require('../../ayarlar.json');
const fs = require('fs');
const path = require('path');
const filePath = path.join(__dirname, '..', '..', 'database', 'users.txt');
var img = ayarlar.img;
var version = ayarlar.versionbot;
var pageSize = 5;

module.exports = {
    cooldown: 10,
    data: new SlashCommandBuilder()
    .setName('user')
    .setDescription('User command')
    .addSubcommand(subcommand =>
        subcommand
            .setName('info')
            .setDescription('To view user information')
            .addUserOption(option => option
                .setName('user')
                .setDescription('The name of the user you want to view')
                .setRequired(false)))
    .addSubcommand(subcommand =>
        subcommand
            .setName('all')
            .setDescription('To view all information of the people in the database')),

    run: async (client, interaction, async, bot) => {

    if (!interaction.guild) {
      return interaction.reply({
        content: 'Sorry, this command is not available in DMs.',
        ephemeral: true, // Set ephemeral to true to hide the message after some time
      });
    }

    if (interaction.options.getSubcommand() === 'info') {

        const selectUser = interaction.options.getUser('user') || interaction.user;

        if (!selectUser) selectUser = interaction.author;
        if (selectUser.bot) return interaction.reply({ content: `${selectUser} must be a user!`, ephemeral: true });

        const avatarURL = selectUser.displayAvatarURL({ dynamic: true });
        fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) {
                console.error('Error when removing user information to the database:', err);
            } else {

            const userData = data.split('\n').find(entry => entry.startsWith(`${selectUser.id} `));

            if (userData) {

                const [userId, plans, concurrents, attacktime, expirationTime] = userData.split(' ');

                // Kiểm tra thời gian hết hạn và tính toán thời gian còn lại
                const currentTime = Date.now();
                const remainingTime = expirationTime - currentTime;

                const daysRemaining = Math.floor(remainingTime / (24 * 60 * 60 * 1000));
                const hoursRemaining = Math.floor((remainingTime % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
                const minutesRemaining = Math.floor((remainingTime % (60 * 60 * 1000)) / (60 * 1000));
                const secondsRemaining = Math.floor((remainingTime % (60 * 1000)) / 1000);

                const expirationDate = new Date(Number(expirationTime));
                const formattedExpirationDate = `${expirationDate.getDate()}/${expirationDate.getMonth() + 1}/${expirationDate.getFullYear()}`;

                interaction.reply({
                  embeds: [
                    new EmbedBuilder()
                      .setColor('Random')
                      .setTitle(`${selectUser.username}'s information`)
                      .addFields(
                      {
                        name: "**💳 User ID:**",
                        value: `\`${selectUser.id}\``,
                        inline: false,
                      },
                      {
                        name: "**➕ Creation date:**",
                        value: `\`${selectUser.createdAt.toUTCString()}\``,
                        inline: false,
                      },
                      {
                        name: "**✨ Plan:**",
                        value: `\`${plans}\``,
                        inline: false,
                      },
                      {
                        name: "**💥 Concurrents:**",
                        value: `\`${concurrents}\``,
                        inline: false,
                      },
                      {
                        name: "**⏲ Attack time:**",
                        value: `\`${attacktime}\``,
                        inline: false,
                      },
                      {
                        name: "**⏰ Remaining time:**",
                        value: `\`${daysRemaining} days, ${hoursRemaining} hours, ${minutesRemaining} minutes, ${secondsRemaining} seconds\``,
                        inline: false,
                      },
                      {
                        name: "**❗ Expire on:**",
                        value: `\`${formattedExpirationDate}\``,
                        inline: false,
                      })
                      .setThumbnail(avatarURL)
                      .setFooter({ text: "© Developer: HuyXingum8K#4557", iconURL: img })
                      .setTimestamp(),
                    ], ephemeral: true
                });
            } else {
                interaction.reply({
                  embeds: [
                    new EmbedBuilder()
                      .setColor('Random')
                      .setTitle(`${selectUser.username}'s information`)
                      .addFields(
                      {
                        name: "**💳 User ID:**",
                        value: `\`${selectUser.id}\``,
                        inline: false,
                      },
                      {
                        name: "**➕ Creation date:**",
                        value: `\`${selectUser.createdAt.toUTCString()}\``,
                        inline: false,
                      })
                      .setThumbnail(avatarURL)
                      .setFooter({ text: "© Developer: HuyXingum8K#4557", iconURL: img })
                      .setTimestamp(),
                    ], ephemeral: true
                });
            }
        }
    });

    }

    if (interaction.options.getSubcommand() === 'all') {
    const page = interaction.options.getInteger('page') || 1;
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error when reading user information from the database:', err);
            return;
        }

        const users = data.split('\n');
        const userInfos = [];

        for (const userData of users) {
            const [userId, plans, concurrents, attacktime, expirationTime] = userData.split(' ');

            if (!userId) continue;

            const selectUser = client.users.cache.get(userId);
            if (!selectUser) continue;

            // Kiểm tra thời gian hết hạn và tính toán thời gian còn lại

            userInfos.push({
                username: selectUser.username,
                plan: plans,
                concurrents: concurrents,
                attacktime: attacktime
            });
        }

        const totalPages = Math.ceil(userInfos.length / pageSize);
        const start = (page - 1) * pageSize;
        const end = start + pageSize;
        const displayedUsers = userInfos.slice(start, end);

        const userFields = displayedUsers.map(user => ({
            name: `**${user.username}**`,
            value: `**✨ Plan:** \`${user.plan}\`
            **💥 Concurrents:** \`${user.concurrents}\`
            **⏲ Attack time:** \`${user.attacktime}\``,
            inline: false,
        }));

        const pageIndex = `Page ${page}/${totalPages}`;
        const pageInfo = `Showing users ${start + 1}-${end} of ${userInfos.length}`;

        const prevButton = new ButtonBuilder()
            .setCustomId('prev')
            .setLabel('Previous')
            .setStyle('Primary')
            .setDisabled(page === 1);

        const nextButton = new ButtonBuilder()
            .setCustomId('next')
            .setLabel('Next')
            .setStyle('Primary')
            .setDisabled(page === totalPages);

        const navigationRow = new ActionRowBuilder()
            .addComponents(prevButton, nextButton);

        interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setColor('Random')
                    .setTitle('All Users')
                    .addFields(userFields)
                    .setFooter({ text: `${pageIndex}` })
                    .setTimestamp(),
            ],
            components: [navigationRow],
            ephemeral: true
        });

        const filter = i => i.customId === 'prev' || i.customId === 'next';
        const collector = interaction.channel.createMessageComponentCollector({
            filter,
            time: 15000 // Thời gian tối đa cho phép phản hồi từ người dùng (15 giây)
        });

        collector.on('collect', async i => {
            if (i.customId === 'prev') {
                // Xử lý chuyển trang về trang trước đó
                const prevPage = page - 1;
                if (prevPage >= 1) {
                    interaction.editReply({
                        embeds: [
                            new EmbedBuilder()
                                .setColor('Random')
                                .setTitle('All Users')
                                .addFields(userFields)
                                .setFooter({ text: `Page ${prevPage}/${totalPages}` })
                                .setTimestamp(),
                        ],
                        components: [navigationRow],
                        ephemeral: true
                    });
                }
            } else if (i.customId === 'next') {
                // Xử lý chuyển trang tới trang kế tiếp
                const nextPage = page + 1;
                if (nextPage <= totalPages) {
                    interaction.editReply({
                        embeds: [
                            new EmbedBuilder()
                                .setColor('Random')
                                .setTitle('All Users')
                                .addFields(userFields)
                                .setFooter({ text: `Page ${nextPage}/${totalPages}` })
                                .setTimestamp(),
                        ],
                        components: [navigationRow],
                        ephemeral: true
                    });
                }
            }
        });

        collector.on('end', collected => {
            // Xóa nút điều hướng sau khi thời gian chờ phản hồi hết
            if (collected.size > 0) {
                interaction.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor('Random')
                            .setTitle('All Users')
                            .addFields(userFields)
                            .setFooter({ text: `Page ${page}/${totalPages}` })
                            .setTimestamp(),
                    ],
                    components: [],
                    ephemeral: true
                });
            }
        });
    });
}










    },
};