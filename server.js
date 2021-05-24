require('dotenv').config();
const tmi = require('tmi.js');
const client = new tmi.Client({
  connection: {
    reconnect: true
  },
  channels: [
    'jh0n_c'
  ],
  identity: {
    username: process.env.USERNAME,
    password: process.env.OAUTH
  }
});

client.connect();

client.on('message', (channel, tags, message, self) => {
	// Ignore echoed messages.
	if(self) return;
	switch(message.toLowerCase()) {
        case '!hello':
		client.say(channel, `@${tags.username}, heya!`);
        break;
        case '!site':
            client.say(channel, `Visite o site: http://zmlabs.com.br`);
        break;
        default:break;
	}
});
