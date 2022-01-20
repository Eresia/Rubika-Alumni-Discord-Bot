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

	getGuildById : async function(client, id)
	{
		await client.guilds.fetch();

		for(let i = 0; i < client.guilds.cache.size; i++)
		{
			let guild = client.guilds.cache.at(i);

			if(guild.id == id)
			{
				return guild;
			}
		}

		return null;
	},

	getMemberById : function(guild, id)
	{
		for(let i = 0; i < guild.members.cache.size; i++)
		{
			let member = guild.members.cache.at(i);

			if(member.id == id)
			{
				return member;
			}
		}

		return null;
	},

	getRoleById : function(guild, id)
	{
		for(let i = 0; i < guild.roles.cache.size; i++)
		{
			let role = guild.roles.cache.at(i);

			if(role.id == id)
			{
				return role;
			}
		}

		return null;
	},

	getUserNameById : function(guild, id)
	{
		let user = module.exports.getMemberById(guild, id);
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
		let user = module.exports.getMemberById(guild, id);
		let result = "Unknow";

		if(user == null)
		{
			return "Unknow";
		}

		return user.user.username;
	},

	getUserTagById : function(guild, id)
	{
		let user = module.exports.getMemberById(guild, id);
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

	getChannelStringById : function(id)
	{
		return "<#" + id + ">";
	},

	getChannelIdByString : function(string)
	{

		let result = -1;

		if(string.substring(0, 2) == "<#")
		{
			if(string[string.length - 1] == ">")
			{
				result = string.substring(2, string.length - 1);
			}
		}
		return result;
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

	hasMemberRole : function(guildMember, roleId)
	{
		for(let i = 0; i < guildMember.roles.cache.size; i++)
		{
			let role = guildMember.roles.cache.at(i);

			if(role.id == roleId)
			{
				return true;
			}
		}

		return false;
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