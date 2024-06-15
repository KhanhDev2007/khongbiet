const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { spawn } = require('child_process');
const axios = require('axios');
const ayarlar = require('../../ayarlar.json');
const version = ayarlar.versionbot;
const img = ayarlar.img;

module.exports = {
    data: new SlashCommandBuilder()
        .setName('tool')
        .setDescription('Công cụ')
        .addSubcommand(subcommand =>
            subcommand
                .setName('check-info')
                .setDescription('Kiểm tra thông tin của IP')
                .addStringOption(option =>
                    option
                        .setName('ip')
                        .setDescription('Ip bạn muốn kiểm tra')
                        .setMaxLength(15)
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('masscan')
                .setDescription('Kiểm tra cổng IMAP4 trên tất cả các cổng')
                .addStringOption(option =>
                    option
                        .setName('ip')
                        .setDescription('Ip bạn muốn kiểm tra')
                        .setMaxLength(15)
                        .setRequired(true))),

    run: async (client, interaction) => {
        if (interaction.options.getSubcommand() === 'check-info') {
            const ipAddress = interaction.options.getString('ip');

            const ipTarget = /(?:[0-9]{1,3}\.){3}[0-9]{1,3}/g;

            if (!ipTarget.test(ipAddress)) {
                interaction.reply({
                    embeds: [
                      new EmbedBuilder()
                        .setColor('Random')
                        .setTitle('Invalid IP!')
                        .setDescription('`Format: 1.1.1.1`')
                        .setFooter({ text: "© Developer: HuyXingum8K#4557", iconURL: img })
                        .setTimestamp(),
                                    ], ephemeral: true 
                });
                setTimeout(() => { interaction.deleteReply()}, 5000);
                return;
            }

            try {
                const response = await axios.get(`https://api.ipgeolocation.io/ipgeo?apiKey=67787b0ff0b44bbd954f1972b3bcb356&ip=${ipAddress}&output=json`); // Changed output to json
                const ipInfo = response.data;

                const embed = new EmbedBuilder() // Use EmbedBuilder here
                    .setColor('Random')
                    .setTitle(version)
                    .addFields(
                        {
                            name: '**IP Address:**',
                            value: `\`${ipInfo.ip}\``,
                            inline: false,
                        },
                        {
                            name: '**ISP:**',
                            value: `\`${ipInfo.isp}\``,
                            inline: false,
                        },
                        {
                            name: '**Organization:**',
                            value: `\`${ipInfo.organization}\``,
                            inline: false,
                        },
                        {
                            name: '**Country:**',
                            value: `\`${ipInfo.country_name}\``, // Fixed variable names
                            inline: false,
                        })
                    .setThumbnail(ipInfo.country_flag)
                    .setFooter({ text: "© Developer: HuyXingum8K#4557", iconURL: img })
                    .setTimestamp();

                // Send the constructed embed to the channel
                await interaction.reply({ embeds: [embed] });
            } catch (error) {
                console.error(error);
                await interaction.reply('An error occurred while fetching IP information.');
            }
        }

        if (interaction.options.getSubcommand() === 'masscan') {
            const ipAddress = interaction.options.getString('ip');
            
            const masscanProcess = spawn('masscan', [ipAddress, '-p0-65535', '--rate=1000']);

            let remainingTime = null;

            masscanProcess.stdout.on('data', data => {
                const output = data.toString();
                
                const remainingMatch = output.match(/(\d{2}:\d{2}:\d{2}) remaining/g);
                if (remainingMatch && remainingMatch.length > 0) {
                    remainingTime = remainingMatch[0];
                }

                const resultEmbed = new EmbedBuilder()
                    .setColor('Random')
                    .setTitle('Masscan Progress')
                    .setDescription(`IMAP4 scan progress for ${ipAddress}:\n\n\`\`\`${output}\`\`\`\nRemaining time: ${remainingTime}`)
                    .setFooter('© Developer: HuyXingum8K#4557', img)
                    .setTimestamp();
                
                interaction.followUp({ embeds: [resultEmbed] });
            });

            masscanProcess.on('exit', (code) => {
                console.log(`Masscan process exited with code ${code}`);
            });
        }
    },
};
