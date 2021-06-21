const Discord = require('discord.js');

let hasLoggingMessage = true;
let reactNumberArray = ["0️⃣", "1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣", "🔟"];

module.exports = {
	getUserStringById : function(id)
	{
		return "<@!" + id + ">";
	},

	getUserStringById_Repair : function(id)
	{
		return "<@" + id + ">";
	},

	getGuildById : function(bot, id)
	{
		let result = null;
		bot.guilds.cache.forEach(guild =>{
			if(guild.id == id)
			{
				result = guild;
			}
		});

		return result;
	},

	getUserById : function(guild, id)
	{
		let result = null;
		guild.members.cache.forEach(user =>{
			if(user.id == id)
			{
				result = user;
			}
		});

		return result;
	},

	getRoleById : function(guild, id)
	{
		let result = null;
		guild.roles.cache.forEach(role =>{
			if(role.id == id)
			{
				result = role;
			}
		});

		return result;
	},

	getUserNameById : function(guild, id)
	{
		let user = module.exports.getUserById(guild, id);
		let result = "Unknow";

		if(user == null)
		{
			return "Unknow";
		}
		
		if(("nickname" in user) && (user.nickname != null))
		{
			result = user.nickname;
		}
		else
		{
			result = user.user.username;
		}

		return result;
	},

	getUserBaseNameById : function(guild, id)
	{
		let user = module.exports.getUserById(guild, id);
		let result = "Unknow";

		if(user == null)
		{
			return "Unknow";
		}

		return user.user.username;
	},

	getUserTagById : function(guild, id)
	{
		let user = module.exports.getUserById(guild, id);
		let result = "Unknow";

		if(user == null)
		{
			return "Unknow";
		}

		return user.user.tag;
	},

	getRoleNameById : function(guild, id)
	{
		let role = module.exports.getRoleById(guild, id);

		if(role == null)
		{
			return "Unknow";
		}
		
		return role.name;
	},

	getRoleStringById : function(id)
	{
		return "<@&" + id + ">";
	},

	getUserIdByString : function(string)
	{
		let result = -1;

		if(string.substring(0, 3) == "<@!")
		{
			if(string[string.length - 1] == ">")
			{
				result = string.substring(3, string.length - 1);
			}
		}
		else if((string.substring(0, 2) == "<@") && (string[2] != '&'))
		{
			if(string[string.length - 1] == ">")
			{
				result = string.substring(2, string.length - 1);
			}
		}

		return result;
	},

	getRoleIdByString : function(string)
	{

		let result = -1;

		if(string.substring(0, 3) == "<@&")
		{
			if(string[string.length - 1] == ">")
			{
				result = string.substring(3, string.length - 1);
			}
		}
		return result;
	},

	getChannelById : function(bot, id)
	{
		let channel = null;

		bot.channels.cache.forEach(chan =>
		{
			if(chan.id == id)
			{
				channel = chan;
			}
		});

		return channel;
	},

	getMessageById : function(bot, channelId, messageId)
	{
		let result = null;
		let channel = this.getChannelById(bot, channelId);
		if(channel == null)
		{
			return null;
		}

		return channel.messages.fetch(messageId);
	},

	getRoleIdByGameId : function(array, gameId)
	{
		let result = -1;
		Object.keys(array).forEach(role =>
		{
			if(array[role] == gameId)
			{
				result = role;
			}
		});

		return result;
	},

	reactMessage : function(message, reaction, content)
	{
		message.react(reaction);
		if(content != null)
		{
			message.channel.send(content);
		}
	},

	reactWrongMessage: function(message, content = null)
	{
		module.exports.reactMessage(message, "❌", content);
	},

	reactRightMessage: function(message, content = null)
	{
		module.exports.reactMessage(message, '👌', content);
	},

	reactSorryMessage: function(message, content = null)
	{
		module.exports.reactMessage(message, "😳", content);
	},

	reactThinkingMessage: function(message, content = null)
	{
		module.exports.reactMessage(message, "🤔", content);
	},

	reactWarningMessage: function(message, content = null)
	{
		module.exports.reactMessage(message, "⚠", content);
	},

	logMessage : function(bot, logChannelId, message)
	{
		if(!hasLoggingMessage)
		{
			return null;
		}

		if(logChannelId == -1)
		{
			return null;
		}

		let channel = module.exports.getChannelById(bot, logChannelId);

		if(channel == null)
		{
			return null;
		}

		return channel.send(message);
	},

	createEmbedMessage : function(message, color = null)
	{
		let embed = new Discord.MessageEmbed();
		embed.setDescription(message);
		return embed;
	},

	logEmbedMessage : function(bot, logChannelId, message, color = null)
	{
		let embed = new Discord.MessageEmbed();
		embed.setDescription(message);
		if(color != null)
		{
			embed.setColor(color);
		}
		return this.logMessage(bot, logChannelId, embed);
	},

	editMessageById : function(bot, channelId, messageId, newMessage)
	{
		let messagePromise = this.getMessageById(bot, channelId, messageId);

		if(messagePromise == null)
		{
			return;
		}

		messagePromise.then(message =>
		{
			if(message == null)
			{
				return;
			}

			if(!("edit" in message))
			{
				return;
			}

			message.edit(newMessage);
		});		
	},

	getReactFromNumber : function(number)
	{
		return reactNumberArray[number];
	}
}