const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, EmbedBuilder } = require('discord.js');
const ayarlar = require('../../ayarlar.json');
const fs = require('fs');
const path = require('path');
var img = ayarlar.img;
var version = ayarlar.versionbot;
var pageSize = 5;

module.exports = {
    cooldown: 10,
    data: new SlashCommandBuilder()
    .setName('history')
    .setDescription('Attack history')
    .addSubcommand(subcommand =>
        subcommand
            .setName('attack')
            .setDescription('To view user attack history')
            .addUserOption(option => option
                .setName('user')
                .setDescription('The name of the user you want to view')
                .setRequired(false))),

    run: async (client, interaction, async, bot) => {
    await interaction.deferReply({
      ephemeral: true,
    });

    if (interaction.options.getSubcommand() === 'attack') {

        const selectUser = interaction.options.getUser('user') || interaction.user;

        const userHistory = path.join(__dirname, '..', '..', 'database', 'logs', `${selectUser.id}.txt`);

        if (!selectUser) selectUser = interaction.author;
        if (selectUser.bot) return interaction.editReply({ content: `${selectUser} must be a user!`, ephemeral: true });

        const avatarURL = selectUser.displayAvatarURL({ dynamic: true });
        
        fs.access(userHistory, fs.constants.F_OK, (err) => {
        if (err) {
            interaction.editReply({ content: `There is no attack history for ${selectUser}.`, ephemeral: true });
        } else {
            try {
                const data = fs.readFileSync(userHistory, 'utf8');
                const lines = data.split('\n').slice(0, 10).join('\n');

                // Process the first 10 lines as needed, for example, send them as a reply
                interaction.editReply({ content: `Attack history for ${selectUser}:\n\`\`\`${lines}\`\`\`` });
            } catch (err) {
                console.error('Error while reading the user history:', err);
                interaction.editReply({ content: 'An error occurred while processing the command.', ephemeral: true });
            }
        }
    });

    }
    },
};