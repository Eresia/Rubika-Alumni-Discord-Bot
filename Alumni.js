const path = require('path');
const fs = require('fs');
const { Client, Events, Collection, GatewayIntentBits, REST } = require('discord.js');
const { Routes } = require('discord-api-types/v9');
const LogMessage = require('./scripts/log.js').logMessage;
const AdminText = require('./scripts/admin-text.js');
const DataManager = require('./scripts/data-manager.js');
const AlumniCheck = require('./scripts/alumni-check.js');
const DiscordUtils = require('./scripts/discord-utils.js');
const { exit } = require('process');

const needRefreshCommands = false;
const caughtException = true;
const sendInitError = true;

if(!fs.existsSync('config.json'))
{
	let basic_config = {};
	basic_config.clientId = "";
	basic_config.token = "";
	basic_config.errorLogGuild = "";

	fs.writeFileSync('config.json', JSON.stringify(basic_config, null, 4));

	console.log('Need to fill config.json with discord bot informations');
	exit(0);
}

const config = JSON.parse(fs.readFileSync('./config.json'));

if(!('clientId' in config) || !('token' in config))
{
	if(!('clientId' in config))
	{
		config.clientId = "";
	}

	if(!('token' in config))
	{
		config.token = "";
	}

	fs.writeFileSync('config.json', JSON.stringify(config, null, 4));
	console.log('Need to fill config.json with discord bot informations');
	return;
}

if(config.clientId.length == 0 || config.token.length == 0)
{
	console.log('Need to fill config.json with discord bot informations');
	exit(0);
}

if(!('errorLogGuild' in config) || config.errorLogGuild.length == 0)
{
	config.errorLogGuild = "";
	fs.writeFileSync('config.json', JSON.stringify(config, null, 4));
	console.log('No error log guild specified');
}

const guildValues = 
[
	{name : 'errorLogChannel', defaultValue : -1},
	{name : 'botManagerRole', defaultValue : -1},
	{name : 'gameRole', defaultValue : -1},
	{name : 'animationRole', defaultValue : -1},
	{name : 'designRole', defaultValue : -1},
	{name : 'ambassadorRole', defaultValue : -1},
	{name : 'botEventRole', defaultValue : -1},
	{name : 'alumniRole', defaultValue : -1},
	{name : 'validatorRole', defaultValue : -1},
	{name : 'inviteChannel', defaultValue : -1},
	{name : 'validMemberChannel', defaultValue : -1},
	{name : 'sheetInformations', defaultValue : {}}
];

const invites = new Collection();
const inviteResolvers = {}

const rest = new REST({ version: '9' }).setToken(config.token);
const client = new Client({ intents: 
	[
		GatewayIntentBits.Guilds, 
		GatewayIntentBits.GuildMessages, 
		GatewayIntentBits.GuildMessageReactions, 
		GatewayIntentBits.GuildInvites, 
		GatewayIntentBits.GuildMembers, 
		GatewayIntentBits.DirectMessages 
	] 
});

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

client.commands = new Collection();
let commandData = [];

for (const file of commandFiles) {
	const allCommands = require(`./commands/${file}`).allCommands;

	for(let i = 0; i < allCommands.length; i++)
	{
		client.commands.set(allCommands[i].data.name, allCommands[i]);
		commandData.push(allCommands[i].data.toJSON());
	}
}

DataManager.initData(path.join(__dirname, 'data'), guildValues);
DataManager.AlumniCheck = AlumniCheck;

client.on('ready', async function () {
	LogMessage("Je suis connecté !", 2);

	if (!client.application?.owner) await client.application?.fetch();

	await refreshCommands();

	client.on(Events.InteractionCreate, async function(interaction)
	{		
		if(!interaction.isCommand() && !interaction.isUserContextMenuCommand())
		{
			return;
		}

		const command = client.commands.get(interaction.commandName);

		if (!command)
		{
			return;
		}

		try 
		{
			await command.execute(interaction, DataManager);
		} 
		catch (executionError) {
			console.error(executionError);
			try 
			{
				await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
				DataManager.logError(interaction.guild, 'Command ' + interaction.commandName + ' Error :\n\n' + executionError);
			} 
			catch(replyError)
			{
				try 
				{
					await interaction.editReply('There was an error while executing this command!');
					DataManager.logError(interaction.guild, 'Command ' + interaction.commandName + ' Error :\n\n' + replyError + '\n' + executionError);
				}
				catch(cantReplyError)
				{
					DataManager.logError(interaction.guild, 'Command ' + interaction.commandName + ' Error : Answer is too long');
				}
			}
		}
	});
	
	AdminText.displayDiscordMessages(client);

	client.on(Events.GuildCreate, function(guild)
	{
		DataManager.initGuildData(guild.id);
		refreshCommandForGuild(guild);

		guild.invites.fetch().then(guildInvites => {
			invites.set(guild.id, new Map(guildInvites.map((invite) => [invite.code, invite.maxUses, invite.uses, invite.inviter.id])));
		})
	});

	client.on(Events.GuildDelete, function(guild)
	{
		DataManager.removeGuildData(guild.id);

		invites.delete(guild.id);
	});

	client.on(Events.GuildMemberAdd, async function(guildMember)
	{
		if(!(guildMember.guild.id in inviteResolvers))
		{
			inviteResolvers[guildMember.guild.id] = [];
		}

		let guildData = DataManager.getServerData(guildMember.guild.id);
		let resolver;

		let promise = new Promise(function(resolve){resolver = resolve;});

		inviteResolvers[guildMember.guild.id].push(resolver);

		if(guildData.alumniRole != -1)
		{
			await guildMember.roles.add(guildData.alumniRole);
		}

		AlumniCheck.askMemberInformations(client, DataManager, promise, guildMember.guild, guildMember);

		await new Promise(function(resolve)
		{
			setTimeout(() => resolve(), 5000);
		});

		for(let i = 0; i < inviteResolvers[guildMember.guild.id].length; i++)
		{
			if(inviteResolvers[guildMember.guild.id][i] == resolver)
			{
				inviteResolvers[guildMember.guild.id].splice(i, 1);
				resolver(undefined);
			}
		}
	});

	client.on(Events.InviteCreate, (invite) => {
		invites.get(invite.guild.id).set(invite.code, {maxUses: invite.maxUses, inviterId: invite.inviter.id});
	});

	client.on(Events.InviteDelete, function(invite) {
		if(!(invite.guild.id in inviteResolvers))
		{
			return;
		}

		if(inviteResolvers[invite.guild.id].length == 0)
		{
			return;
		}

		let guildInvites = invites.get(invite.guild.id);
		let inviteInfo = guildInvites.get(invite.code);

		if(inviteInfo.maxUses == 1)
		{
			let resolver = inviteResolvers[invite.guild.id].shift();
			resolver(invite.code);
		}

		guildInvites.delete(invite.code);
	});

	await client.guilds.fetch();

	client.guilds.cache.forEach(async (guild) => {
		let firstInvites = await guild.invites.fetch();
		invites.set(guild.id, new Collection(firstInvites.map((invite) => [invite.code, {maxUses: invite.maxUses, inviterId: invite.inviter.id}])));
		AlumniCheck.init(DataManager, guild);
		AlumniCheck.initValidationCollector(DataManager, guild);
		AlumniCheck.initUserData(DataManager, guild);

		if(sendInitError)
		{
			DataManager.logError(guild, 'Initialisation');
		}
	});
});

async function refreshCommands()
{
	await client.guilds.fetch();

	for(let[guildId, guild] of client.guilds.cache)
	{
		if(needRefreshCommands || DataManager.getServerData(guildId) == null)
		{
			DataManager.initGuildData(guildId);
			await refreshCommandForGuild(guild);
		}
	}
}

async function refreshCommandForGuild(guild)
{
	try
	{
		await rest.put(Routes.applicationGuildCommands(config.clientId, guild.id), { body: commandData });
		console.log('Successfully registered application commands for guild ' + guild.name);
	}
	catch
	{
		console.log('Can\'t registered command for guild ' + guild.name);
	}
}

async function logError(guild, error)
{
	let guildData = DataManager.getServerData(guild.id);
	let channel = await DiscordUtils.getChannelById(guild.client, guildData.errorLogChannel);

	if(channel != null)
	{
		await channel.send('Info: ' + error);
	}
}

if(caughtException && config.errorLogGuild.length > 0)
{
	process.once('uncaughtException', async function (err)
	{
		await DataManager.logError(await DiscordUtils.getGuildById(client, config.errorLogGuild), 'Uncaught exception: ' + err.message + '\Exception stack: ' + err.stack);
		console.log('Uncaught exception: ' + err.message);
		console.log('Exception stack: ' + err.stack);
		exit(1);
	});
}

DataManager.logError = logError;

client.login(config.token);