const { SlashCommandBuilder, EmbedBuilder} = require('discord.js');
const ayarlar = require('../../ayarlar.json');
const axios = require('axios');
const https = require('https');
var version = ayarlar.versionbot;
var img = ayarlar.img;

module.exports = {
    data: new SlashCommandBuilder()
    .setName('resolver')
    .setDescription('Xem trạng thái máy chủ Minecraft')
    .addStringOption(option => option
            .setName("target")
            .setDescription("IP Server")
            .setMaxLength(64)
            .setRequired(true))
    .addNumberOption(option => option
            .setName("port")
            .setDescription("Port Server")
            .setMinValue(0)
            .setMaxValue(65535)
            .setRequired(false)),
    run: async (client, interaction) => {
    await interaction.deferReply({
      ephemeral: false,
    });

      var photovip = ayarlar.photovip;
      var randomgifvip = photovip[Math.floor((Math.random() * photovip.length))];

      const target = interaction.options.getString('target');
      const ports = (interaction.options.getNumber('port') || '25565');


const options = {
    hostname: 'api.mcsrvstat.us',
    port: 443,
    path: '/2/' + target + ':' +ports,
    method: 'GET'
}

const request = https.request(options, response => {
    let str = '';
    response.on('data', data => {
        str += data;
    });
    response.on('end', () => {
        resp = JSON.parse(str);

        let embed = {
            title: target,
            thumbnail: {
                url: 'https://api.mcsrvstat.us/icon/' + target +':' +ports
            },
            fields: [{ name: 'Trạng thái', value: 'Không tín hiệu' }],
            image: {
                url: `http://status.mclive.eu/LegendBot/${target}/${ports}/banner.png`
            },
            footer: {
                text: "© Developer: HuyXingum8K#4933 | Virtualization", iconURL: img 
            }
        };
        if(resp.online) {
            embed.fields[0].value = 'Trực tuyến';
            embed.fields.push({
                name: 'Địa Chỉ',
                value: resp.ip,
                inline: true
            });
            embed.fields.push({
                name: 'Cổng',
                value: resp.port,
                inline: true
            });
            embed.fields.push({
                name: 'MOTD',
                value: (resp.motd) ? resp.motd.clean.join('\n') : 'Thiếu',
                inline: true
            });
            embed.fields.push({
                name: 'Người chơi',
                value: resp.players.online + '/' + resp.players.max,
                inline: true
            });
            embed.fields.push({
                name: 'Phiên bản',
                value: resp.protocol,
                inline: true
            });
        }
        interaction.editReply({ embeds: [embed] });
    });
});
request.on('error', err => {
    console.log(err);
    interaction.editReply('Không thể lấy thông tin máy chủ!');
})
request.end()
    }
}