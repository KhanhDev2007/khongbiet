const axios = require('axios');

const url = "https://discord.com/api/webhooks/1129041061386399834/b1rpL_H78nyg1cadHsRGG3Etc60nIBwvOSh1kkd3cWHPFSeE8TP3Og0Pw0iyDRk8oinT";

const data = {
  username: 'Virtualization Logs'
};

data.embeds = [
  {
    description: "Username: " + process.argv[2] +  "\n Key: " + process.argv[3] +  "\n Link: " + process.argv[4],
    title: "New key has been generate!"
  }
];

axios.post(url, data)
  .then(response => {
  })
  .catch(error => {
    console.error(error.message);
  });