const Discord = require('discord.js');
const moment = require('moment');
const { ActivityType } = require('discord.js');
const { QuickDB } = require('quick.db');
const db = new QuickDB({ filePath: 'database.sqlite' });
const ayarlar = require('../ayarlar.json');

const fs = require('fs');
const path = require('path');
const filePath = path.join(__dirname, '..', 'database', 'users.txt');
const fileWarn = path.join(__dirname, '..', 'database', 'warns.txt');
const fileKey = path.join(__dirname, '..', 'database', 'keys.txt');
const fileOngoing = path.join(__dirname, '..', 'database', 'ongoing.txt');
var ownerID = ayarlar.ownerID;

module.exports = {
  name: 'ready',
  run: async (client) => {
    let serverCount = client.guilds.cache.size;

    console.log(`[${moment().format('YYYY-MM-DD HH:mm:ss')}] BOT: Kích Hoạt, Lệnh đã tải thành công!`);
    console.log(`[${moment().format('YYYY-MM-DD HH:mm:ss')}] BOT: Đã kết nối với tên ${client.user.username}!`);

    await db.delete(`conc_22008`);
    const currentTime = Date.now();
    const expirationTime = currentTime + 365 * 24 * 60 * 60 * 1000;

    //Database
    if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, '', 'utf8');
    }

    if (!fs.existsSync(fileWarn)) {
        fs.writeFileSync(fileWarn, '', 'utf8');
    }

    if (!fs.existsSync(fileKey)) {
        fs.writeFileSync(fileKey, '', 'utf8');
    }

    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        console.error('Error while reading the database:', err);
      } else {
        // Kiểm tra xem ownerID đã tồn tại trong tệp hay chưa
        const ownerData = data.split('\n').find(entry => entry.startsWith(`${ownerID} `));

        if (!ownerData) {
          // Nếu ownerID chưa tồn tại, thêm thông tin của họ vào tệp
          const newData = `${ownerID} Admin 10 600 ${expirationTime} | BOT OWNER\n`;
          fs.appendFile(filePath, newData, 'utf8', (err) => {
            if (err) {
              console.error('Error when adding user information to the database:', err);
            } else {
              console.log(`[${moment().format('YYYY-MM-DD HH:mm:ss')}] Added points for the owner.`);
            }
          });
        }
      }
    });

    setInterval(() => {
        fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
          console.error('Error while reading the database:', err);
        } else {
          const lines = data.split('\n');
          const updatedLines = [];

          for (const line of lines) {
            const [userId, plans, concurrents, attacktime, expirationTime] = line.split(' ');
            if (userId && plans && concurrents && attacktime && expirationTime) {
              if (Number(expirationTime) >= Date.now()) {
                updatedLines.push(line);
              }
            }
          }

          const updatedData = updatedLines.join('\n');
          fs.writeFile(filePath, updatedData, 'utf8', (err) => {
            if (err) {
              console.error('Lỗi khi ghi tệp users.txt:', err);
            }
          });
        }
      });
    }, 5000);

    setInterval(() => {
        fs.readFile(fileKey, 'utf8', (err, data) => {
        if (err) {
          console.error('Error while reading the database:', err);
        } else {
          const lines = data.split('\n');
          const updatedLines = [];

          for (const line of lines) {
            const [userId, keys, links, haskey, claimed, expirationTime] = line.split(' ');
            if (userId && keys && links && haskey && claimed && expirationTime) {
              if (Number(expirationTime) >= Date.now()) {
                updatedLines.push(line);
              }
            }
          }

          const updatedData = updatedLines.join('\n');
          fs.writeFile(fileKey, updatedData, 'utf8', (err) => {
            if (err) {
              console.error('Lỗi khi ghi tệp keys.txt:', err);
            }
          });
        }
      });
    }, 5000);

    setInterval(() => {
      fs.readFile(fileOngoing, 'utf8', (err, data) => {
        if (err) {
          console.error('Error while reading the database:', err);
        } else {
          const lines = data.split('\n');
          const currentTime = Date.now();
          const updatedLines = lines.filter((line) => {
            const match = line.match(/([^ ]+) ([^ ]+) ([^ ]+) (\d+)/);
            if (match) {
              const [, username, method, target, time] = match;
              return time > currentTime; // Chỉ giữ lại các dòng có thời gian hợp lệ (chưa hết hạn)
            }
            return false; // Không phải định dạng hợp lệ, bỏ qua dòng này
          });

          const updatedData = updatedLines.join('\n');
          fs.writeFile(fileOngoing, updatedData, 'utf8', (err) => {
            if (err) {
              console.error('Lỗi khi ghi tệp ongoing.txt:', err);
            }
          });
        }
      });
    }, 5000);
    //End

    const activities = [
      { name: `${serverCount} servers`, type: ActivityType.Streaming, url: 'https://www.twitch.tv/huyxingum8k' },
      { name: 'HuyXingum8K#4557', type: ActivityType.Listening },
      { name: 'Discord.js v14', type: ActivityType.Competing }
    ];
    const status = ['online', 'dnd', 'idle'];
    let i = 0;

    setInterval(() => {
      if (i >= activities.length) i = 0;
      client.user.setActivity(activities[i]);
      i++;
    }, 5000);

    let s = 0;
    setInterval(() => {
      if (s >= activities.length) s = 0;
      client.user.setStatus(status[s]);
      s++;
    }, 30000);
  }
};