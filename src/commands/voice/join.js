const { Command, CommandType } = require('gcommands');
const Voice = require('../../core/voice');

new (class extends Command {
  constructor() {
    super({
      name: 'join',
	  cooldown: '2s',
      description: 'Joins the users connected voice channel',
      type: [CommandType.SLASH, CommandType.MESSAGE],
    });
  }

  run(ctx) {
	Voice.connectToMemberChannel(ctx.member)
    return ctx.reply("Connected");
  }
})();
  