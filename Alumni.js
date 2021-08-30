const path = require('path');
const fs = require('fs');
const Discord = require('discord.js');
const bot = new Discord.Client();
const discordUtils = require('./scripts/discordUtils.js');
const logMessage = require('./scripts/log.js').logMessage;
const alumni = require('./scripts/alumni_check.js');
const admin_text = require('./scripts/admin_text.js');
const { parse } = require('path');
const { reactMessage } = require('./scripts/discordUtils.js');

const directoryPath = path.join(__dirname, 'data');

let data = {};

//google.updateSheets();

fs.mkdirSync(directoryPath, { recursive: true });

let directoryFiles = fs.readdirSync(directoryPath);
directoryFiles.forEach(function (file) {
	let contents = fs.readFileSync(directoryPath + '/' + file, 'utf8');
	let temp = JSON.parse(contents);
	data[temp.serverId] = temp;
	alumni.updateSheet(data, temp.serverId);
});

bot.on('ready', function () {
	let selfId = bot.user.id;
	logMessage("Je suis connecté !", 2);

	checkInvalidRoles(bot);

	bot.on('message', async function(message) {

		if(message.author.bot)
		{
			return;
		}

		if(message.guild == null)
		{
			return;
		}

		let serverId = message.guild.id;
		let channelId = message.channel.id;
		let isBotManager = false;

		if(serverId in data)
		{
			message.member.roles.cache.forEach(role => {
				if(role.id == data[serverId].botManagerRole)
				{
					isBotManager = true;
				}
			});
		}

		let isAdmin = (message.member.hasPermission("ADMINISTRATOR"));
		isBotManager = isBotManager || isAdmin;
		let commands = message.content.split(' ');

		for(let i = 0; i < commands.length; i++)
		{
			if(commands[i].length == 0)
			{
				commands.splice(i, 1);
				i--;
			}
		}

		if (commands[0] == '!alu') {
			if(commands.length >= 2)
			{
				switch (commands[1])
				{
					case 'bot_manager':
						setRole(data, message, commands, isAdmin, "botManagerRole");
						break;

					case 'invalid':
						setRole(data, message, commands, isAdmin, "invalidRole");
						break;

					case 'valid':
						setRole(data, message, commands, isAdmin, "validRole");
						break;

					case 'game':
						setRole(data, message, commands, isAdmin, "gameRole");
						break;

					case 'animation':
						setRole(data, message, commands, isAdmin, "animationRole");
						break;

					case 'design':
						setRole(data, message, commands, isAdmin, "designRole");
						break;

					case 'ambassador':
						setRole(data, message, commands, isAdmin, "ambassadorRole");
						break;

					case 'bot-event':
						setRole(data, message, commands, isAdmin, "botEventRole");
						break;

					case 'link':
						if(!isBotManager)
						{
							wrongRight(message);
							break;
						}

						if(commands.length < 5)
						{
							discordUtils.reactWrongMessage(message, "use '!alu link <sheet_id> <page_name> <range>'");
							message.channel.send("Ex : !alu 1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms ClassData A2:E");
							return;
						}
						
						data[serverId].link = commands[2];
						data[serverId].page = commands[3];
						data[serverId].range = commands[4];
						writeInData(serverId);
						alumni.updateSheet(data, serverId);
						discordUtils.reactRightMessage(message);
						break;

					case 'refresh':
						if(!isBotManager)
						{
							wrongRight(message);
							break;
						}

						alumni.updateSheet(data, serverId);
						discordUtils.reactRightMessage(message);
						break;

					case 'check_name':
						if(!isBotManager)
						{
							wrongRight(message);
							break;
						}

						let name = message.content.substring(commands[0].length + commands[1].length + 2);
						let user = alumni.getUserByName(serverId, name);

						if(user == null)
						{
							discordUtils.reactWrongMessage(message, "Name \"" + name + "\" don't exist in database");
						}
						else
						{
							if(user.check == "Non")
							{
								discordUtils.reactRightMessage(message, "Name \"" + user.firstName + " " + user.lastName + "\" exists in database but is not registered");
							}
							else
							{
								discordUtils.reactRightMessage(message, "Name \"" + user.firstName + " " + user.lastName + "\" exists in database and is registered");
							}
						}
						break;

					case 'new_city':
						if(!isBotManager)
						{
							wrongRight(message);
							break;
						}

						if(commands.length < 3)
						{
							discordUtils.reactWrongMessage(message, "use '!alu new_city city_name'");
							message.channel.send("Ex : !alu new Neuville Sur Oise");
							break;
						}

						let city = message.content.substring(commands[0].length + commands[1].length + 2);
						let textPosition = discordUtils.getRoleById(message.guild, data[serverId].gameRole).position;

						message.guild.roles.create({
							reason: 'Add Role for city ' + city,
							data:
							{
								name: city,
								position: discordUtils.getRoleById(message.guild, data[serverId].gameRole).position + 1,
								mentionable: false,
								hoist: true
							}
						}).then(newRole =>{
							discordUtils.reactRightMessage(message, "Création du rôle " + discordUtils.getRoleStringById(newRole.id) + " avec succès");
							message.guild.channels.create(city, 
							{
								type: 'category',
								reason: 'Create Category for city ' + city,
								permissionOverwrites: 
								[
									{
										id: message.guild.id,
										deny: 
										[
											Discord.Permissions.FLAGS.VIEW_CHANNEL, 
											Discord.Permissions.FLAGS.SEND_MESSAGES
										]
									},
									{
										id: newRole.id,
										allow: 
										[
											Discord.Permissions.FLAGS.VIEW_CHANNEL, 
											Discord.Permissions.FLAGS.SEND_MESSAGES
										]
									}
								]
							}).then(newCategory => {
								message.guild.channels.create("🎉events-" + city, 
								{
									type: 'text',
									reason: 'Create event channel for city ' + city,
									parent: newCategory,
									permissionOverwrites:
									[
										{
											id: message.guild.id,
											deny: 
											[
												Discord.Permissions.FLAGS.VIEW_CHANNEL, 
												Discord.Permissions.FLAGS.SEND_MESSAGES
											]
										},
										{
											id: newRole.id,
											allow: 
											[
												Discord.Permissions.FLAGS.VIEW_CHANNEL
											]
										},
										{
											id: data[serverId].ambassadorRole,
											allow: 
											[
												Discord.Permissions.FLAGS.VIEW_CHANNEL,
												Discord.Permissions.FLAGS.SEND_MESSAGES
											]
										},
										{
											id: data[serverId].botEventRole,
											allow: 
											[
												Discord.Permissions.FLAGS.VIEW_CHANNEL,
												Discord.Permissions.FLAGS.SEND_MESSAGES
											]
										}
									]
								});

								message.guild.channels.create("💬general-" + city, 
								{
									type: 'text',
									reason: 'Create general channel for city ' + city,
									parent: newCategory
								});

								message.guild.channels.create("💼serious-" + city, 
								{
									type: 'text',
									reason: 'Create serious channel for city ' + city,
									parent: newCategory
								});

								message.guild.channels.create("💡idées-" + city, 
								{
									type: 'text',
									reason: 'Create idées channel for city ' + city,
									parent: newCategory,
									rateLimitPerUser: 120
								});

								message.reply("Catégorie et chans créés avec succès pour la ville " + city);
							});
						});
						break;

					case 'new':
						if(!isBotManager)
						{
							wrongRight(message);
							break;
						}

						if(commands.length < 3)
						{
							discordUtils.reactWrongMessage(message, "use '!alu new <user_tag>'");
							message.channel.send("Ex : !alu new @Eresia#7541");
							break;
						}

						let newMember = discordUtils.getUserById(message.guild, discordUtils.getUserIdByString(commands[2]));
						if(newMember == null)
						{
							discordUtils.reactWrongMessage(message, "Member " + commands[2] + " don't exist");
							break;
						}

						let alreadyRegistered = false;

						newMember.roles.cache.forEach(role => {
								if(role.id == data[serverId].validRole)
								{
									alreadyRegistered = true;
								}
							}
						);

						if(alreadyRegistered)
						{
							discordUtils.reactWrongMessage(message, "Member " + commands[2] + " is already registered");
							break;
						}

						if(commands.length > 3)
						{
							if(!(await alumni.applyNewMember(data, newMember, message.content.substring(commands[0].length + commands[1].length + commands[2].length + 3))))
							{
								discordUtils.reactWrongMessage(message, "Name already registered");
								break;
							}
						}
						else
						{
							if(newMember.user.bot)
							{
								discordUtils.reactWrongMessage(message, "Member " + commands[2] + " is a bot");
								break;
							}

							alumni.askNewMember(data, newMember);
						}
						
						discordUtils.reactRightMessage(message);
						break;

						case 'remove':
							if(!isBotManager)
							{
								wrongRight(message);
								break;
							}
	
							if(commands.length < 3)
							{
								discordUtils.reactWrongMessage(message, "use '!alu remove <user_tag>'");
								message.channel.send("Ex : !alu remove @Eresia#7541");
								break;
							}
	
							let removeMember = discordUtils.getUserById(message.guild, discordUtils.getUserIdByString(commands[2]));
							if(removeMember == null)
							{
								discordUtils.reactWrongMessage(message, "Member " + commands[2] + " don't exist");
								break;
							}
	
							let isRegistered = false;
	
							removeMember.roles.cache.forEach(role => {
									if(role.id == data[serverId].validRole)
									{
										isRegistered = true;
									}
								}
							);
	
							if(!isRegistered)
							{
								discordUtils.reactWrongMessage(message, "Member " + commands[2] + " is not registered");
								break;
							}
	
							alumni.removeMember(data, removeMember, true);
							
							discordUtils.reactRightMessage(message);
							break;

					case 'fusion':
						if( !isBotManager )
						{
							wrongRight(message);
							break;
						}

						if(commands.length < 6)
						{
							discordUtils.reactWrongMessage(message, "use '!alu fusion <sheet_link> <page_name_from> <page_name_to> <range>'");
							message.channel.send("Ex : !alu fusion 1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms ClassData ClassData2 A2:E");
							break;
						}

						let link = commands[2];
						let from = commands[3];
						let to = commands[4];
						let range = commands[5];

						alumni.fusionSheet(link, from, to, range);
						discordUtils.reactRightMessage(message);
						break;

					case 'embed':
						if( !isBotManager )
						{
							wrongRight(message);
							break;
						}

						generateEmbed(message, commands);
						break;
					default:
						if(isBotManager)
						{
							wrongCommand(message);
						}
						else
						{
							wrongRight(message);
						}
						break;
				}
			}
			else if(isBotManager)
			{
				wrongCommand(message);
			}
			else
			{
				wrongRight(message);
			}
		}
		
	});
	
	bot.on("guildMemberAdd", function(guildMember)
	{
		alumni.askNewMember(data, guildMember);
	});

	bot.on("guildMemberRemove", function(guildMember)
	{
		alumni.removeMember(data, guildMember, false);
	});

	admin_text.displayDiscordMessages(bot);
});

let checkInvalidRoles = function(bot)
{
	bot.guilds.cache.forEach(guild =>
		{
			if(guild.id in data)
			{
				if(data[guild.id].invalidRole != -1)
				{
					guild.members.cache.forEach(member =>
						{
							if(!member.user.bot)
							{
								member.roles.cache.forEach(role => {
									if(role.id == data[guild.id].invalidRole)
									{
										alumni.askNewMember(data, member, false);
									}
								});
							}
						}
					);
				}
			}
		}
	);
}

let wrongRight = function(message)
{
	let string = "Vous n'avez pas les droits pour effectuer cette commande !";
	discordUtils.reactWrongMessage(message, string);
}

let wrongCommand = function(message)
{
	let string = 'Mauvaise commande. Les commandes possibles sont : "bot_manager", "invalid", "valid", "link", "new", "embed"';
	discordUtils.reactWrongMessage(message, string);
}

let initGuild = function(guild, data)
{
	let serverId = guild.id;

	if(!(serverId in data))
	{
		data[serverId] = {};
	}

	data[serverId].serverId = serverId;
	data[serverId].serverName = guild.name;
	initValue(serverId, data, "botManagerRole", -1);
	initValue(serverId, data, "invalidRole", -1);
	initValue(serverId, data, "validRole", -1);
	initValue(serverId, data, "gameRole", -1);
	initValue(serverId, data, "animationRole", -1);
	initValue(serverId, data, "designRole", -1);
	initValue(serverId, data, "ambassadorRole", -1);
	initValue(serverId, data, "botEventRole", -1);
	initValue(serverId, data, "link", "");
	initValue(serverId, data, "page", "");
	initValue(serverId, data, "range", "");

	writeInData(serverId);
}

let initValue = function(serverId, data, valueName, initValue)
{
	if(!(valueName in data[serverId]))
	{
		data[serverId][valueName] = initValue;
		writeInData(serverId);
	}
}

let connect = function()
{
	fs.readFile('token', 'utf8', function(err, contents) {
		if(err)
		{
			logMessage("No token file", 1);
		}
		else
		{
			bot.login(contents);
		}
	});
}

let setChannel = function(data, message, isBotManager, channelName)
{
	let serverId = message.guild.id;
	let channelId = message.channel.id;
	if( isBotManager )
	{
		initGuild(message.guild, data);

		if( data[serverId][channelName] == channelId )
		{
			data[serverId][channelName] = -1;
			writeInData(serverId);
			message.react('❎');
		}
		else
		{
			data[serverId][channelName] = channelId;
			writeInData(serverId);
			discordUtils.reactRightMessage(message);
		}
	}
	else
	{
		discordUtils.reactWrongMessage(message, "Vous n'avez pas les droits pour effectuer cette commande !");
	}
}

let setCategory = function(data, message, isBotManager, categoryName)
{
	let serverId = message.guild.id;
	let categoryId = message.channel.parentID;
	if( isBotManager )
	{
		initGuild(message.guild, data);

		if( data[serverId][categoryName] == categoryId )
		{
			data[serverId][categoryName] = -1;
			writeInData(serverId);
			message.react('❎');
		}
		else
		{
			data[serverId][categoryName] = categoryId;
			writeInData(serverId);
			discordUtils.reactRightMessage(message);
		}
	}
	else
	{
		wrongRight(message);
	}
}

let setRole = function(data, message, commands, hasRight, roleName)
{
	if(commands.length < 3)
	{
		discordUtils.reactWrongMessage(message, "use '!alu <RoleCommand> <RoleTag>'");
		return;
	}

	setDataRole(data[message.guild.id], message, commands[2], hasRight, roleName);
}

let setDataRole = function(dataArray, message, roleString, hasRight, roleName)
{
	let serverId = message.guild.id;
	if(!hasRight)
	{
		wrongRight(message);
		return;
	}

	initGuild(message.guild, data);

	let id = discordUtils.getRoleIdByString(roleString);

	message.guild.roles.fetch(id)
		.then(role => {
			dataArray[roleName] = role.id;
			writeInData(serverId);
			discordUtils.reactRightMessage(message);
		})
		.catch(() => {
			discordUtils.reactWrongMessage(message, "Can't find the role");
		});
}

let writeInAllData = function()
{
	Object.keys(data).forEach(key => {
		writeInData(key);
	});
}

let writeInData = function(serverId)
{
	let path = directoryPath + '/' + serverId;
	if(fs.existsSync(path))
	{
		fs.unlinkSync(path);
	}

	fs.writeFileSync(path, JSON.stringify(data[serverId]), 'utf8');
}

let generateEmbed = function(message, commands)
{
	if(commands.length < 3)
	{
		discordUtils.reactWrongMessage(message, "You need to precise the message");
		return;
	}

	let emptyMessage = "\u200B";

	let resultEmbded = new Discord.MessageEmbed();

	let content = new String(message.content);
	content = content.slice(commands[0].length + commands[1].length + 2);

	content = content.replace(/\\n/gi, "\n");
	splitContent = content.split("\\\\");

	let actualFieldTitle = emptyMessage;
	let isActualFieldRown = false;

	if((splitContent.length > 2) && ((splitContent.length % 3) == 0))
	{
		splitContent.push(emptyMessage);
	}

	for(let i = 0; i < splitContent.length; i++)
	{
		if(i == 0)
		{
			if(splitContent[i].length != 0)
			{
				if(splitContent[i].length > 256)
				{
					discordUtils.reactWrongMessage(message, "Title is too long");
					return;
				}
				resultEmbded.setTitle(splitContent[i]);
			}
			continue;
		}

		if(i == 1)
		{
			if(splitContent[i].length != 0)
			{
				resultEmbded.setDescription(splitContent[i]);
			}
			continue;
		}

		if((i % 3) == 2)
		{
			switch(splitContent[i])
			{
				case "row":
					isActualFieldRown = true;
					continue;
				
				default:
					isActualFieldRown = false;
					continue;
			}
		}

		let actualContent = splitContent[i];

		if(actualContent.length == 0)
		{
			actualContent = emptyMessage;
		}

		if((i % 3) == 0)
		{
			actualFieldTitle = actualContent;
			continue;
		}

		resultEmbded.addField(actualFieldTitle, actualContent, isActualFieldRown);
	}

	discordUtils.reactRightMessage(message, resultEmbded);
}

if(process.argv.length > 2)
{
	let time = parseFloat(process.argv[2]);
	setTimeout(connect, time * 1000.0);
}
else
{
	connect();
}