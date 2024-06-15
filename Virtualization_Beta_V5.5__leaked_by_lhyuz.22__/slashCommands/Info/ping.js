const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const ayarlar = require('../../ayarlar.json');
const { exec } = require('child_process');
var img = ayarlar.img;
var version = ayarlar.versionbot;

module.exports = {
    data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Kiểm tra ping')
    .addSubcommand((subcommand) =>
      subcommand
        .setName('bot')
        .setDescription('Kiểm tra ping bot'))
    .addSubcommand((subcommand) =>
      subcommand
        .setName('paping')
        .setDescription('Kiểm tra độ trễ của cổng')
        .addStringOption(option => option
                .setName('ip')
                .setDescription('Ip bạn muốn kiểm tra')
                .setMaxLength(15)
                .setRequired(true))
        .addNumberOption(option => option
                .setName('port')
                .setDescription('Cổng bạn muốn kiểm tra')
                .setMinValue(0)
                .setMaxValue(65535)
                .setRequired(true)))
    .addSubcommand((subcommand) =>
      subcommand
        .setName('default')
        .setDescription('Kiểm tra độ trễ của ip')
        .addStringOption(option => option
                .setName('ip')
                .setDescription('Ip bạn muốn kiểm tra')
                .setMaxLength(15)
                .setRequired(true))),

    run: async (client, interaction) => {

    if (interaction.options.getSubcommand() === 'bot') {
        const embed = new EmbedBuilder()
            .setTitle(`\`${client.user.username}'s Ping\``)
            .setDescription(`\`\`\`ini\n[ ${client.ws.ping}ms ]\n\`\`\``)
            .setColor('Random')
            .setFooter({ text: "© Developer: HuyXingum8K#4557", iconURL: img })
            .setTimestamp()
        interaction.reply({ embeds: [embed] });
    }

    if (interaction.options.getSubcommand() === 'paping') {

      const ip = interaction.options.getString('ip');
      const port = interaction.options.getNumber('port');

      await interaction.deferReply({
        ephemeral: false,
      });

      exec(`node methods/paping.js ${ip} ${port}`, (error, stdout) => {
      if (error) {
        console.error(`Error executing paping.js: ${error.message}`);
        interaction.editReply('An error occurred while executing the ping command.');
        return;
      }

      const embed = new EmbedBuilder()
        .setColor('Random')
        .setTitle('Paping Results')
        .setDescription(`\`\`\`${stdout}\`\`\``)
        .setFooter({ text: "© Developer: HuyXingum8K#4557", iconURL: img })
        .setTimestamp();

      interaction.editReply({ embeds: [embed] });
    });
    }

    if (interaction.options.getSubcommand() === 'default') {
      const ip = interaction.options.getString('ip');

      await interaction.deferReply({
        ephemeral: false,
      });

      exec(`ping ${ip} -c 10`, (error, stdout) => {
      if (error) {
        console.error(`Shit Error: ${error.message}`);
        interaction.editReply('An error occurred while executing the ping command.');
        return;
      }

      const embed = new EmbedBuilder()
        .setColor('Random')
        .setTitle('Ping Results')
        .setDescription(`\`\`\`${stdout}\`\`\``)
        .setFooter({ text: "© Developer: HuyXingum8K#4557", iconURL: img })
        .setTimestamp();
      interaction.editReply({ embeds: [embed] });
    });
    }
    },
};