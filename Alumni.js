const path = require('path');
const fs = require('fs');
const { Client, Collection, Intents } = require('discord.js');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const DiscordUtils = require('./scripts/discord-utils.js');
const LogMessage = require('./scripts/log.js').logMessage;
const AdminText = require('./scripts/admin-text.js');
const DataManager = require('./scripts/data-manager.js');
const AlumniCheck = require('./scripts/alumni-check.js');
const { clientId, token } = require('./config.json');

const needRefreshCommands = true;

const guildValues = 
[
	{name : 'botManagerRole', defaultValue : -1},
	{name : 'invalidRole', defaultValue : -1},
	{name : 'validRole', defaultValue : -1},
	{name : 'gameRole', defaultValue : -1},
	{name : 'animationRole', defaultValue : -1},
	{name : 'designRole', defaultValue : -1},
	{name : 'ambassadorRole', defaultValue : -1},
	{name : 'botEventRole', defaultValue : -1}
];

const invites = new Collection();
const inviteResolvers = {}

const rest = new REST({ version: '9' }).setToken(token);
const client = new Client({ intents: 
	[
		Intents.FLAGS.GUILDS, 
		Intents.FLAGS.GUILD_MESSAGES, 
		Intents.FLAGS.GUILD_MESSAGE_REACTIONS, 
		Intents.FLAGS.GUILD_INVITES, 
		Intents.FLAGS.GUILD_MEMBERS, 
		Intents.FLAGS.DIRECT_MESSAGES ] });

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

client.on('ready', async function () {
	LogMessage("Je suis connecté !", 2);

	if (!client.application?.owner) await client.application?.fetch();

	await refreshCommands();

	//checkInvalidRoles(client);

	client.on('interactionCreate', async function(interaction)
	{
		if(!interaction.isCommand())
		{
			return;
		}

		const command = client.commands.get(interaction.commandName);

		if (!command)
		{
			return;
		}

		try {
			await command.execute(interaction, DataManager);

			if('needRefreshCommands' in command && command.needRefreshCommands)
			{
				addCommandPermissionsForGuild(interaction.guild);
			}
		} catch (error) {
			console.error(error);
			await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
		}
	});
	
	AdminText.displayDiscordMessages(client);

	client.on('guildCreate', function(guild)
	{
		DataManager.initGuildData(guild.id);
		refreshCommandForGuild(guild);

		guild.invites.fetch().then(guildInvites => {
			invites.set(guild.id, new Map(guildInvites.map((invite) => [invite.code, invite.maxUses, invite.uses, invite.inviter.id])));
		})
	});

	client.on('guildDelete', function(guild)
	{
		DataManager.removeGuildData(guild.id);

		invites.delete(guild.id);
	});

	client.on('guildMemberAdd', function(guildMember)
	{
		if(!(guildMember.guild.id in inviteResolvers))
		{
			inviteResolvers[guildMember.guild.id] = [];
		}

		let resolver;

		let promise = new Promise(function(resolve){resolver = resolve;});

		inviteResolvers[guildMember.guild.id].push(resolver);

		AlumniCheck.askMemberInformations(client, DataManager, promise, guildMember.guild, guildMember);
	});

	client.on("inviteCreate", (invite) => {
		invites.get(invite.guild.id).set(invite.code, {maxUses: invite.maxUses, inviterId: invite.inviter.id});
	});

	client.on("inviteDelete", function(invite) {
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
	await rest.put(Routes.applicationGuildCommands(clientId, guild.id), { body: commandData });
	console.log('Successfully registered application commands for guild ' + guild.name);

	addCommandPermissionsForGuild(guild);
}

async function addCommandPermissionsForGuild(guild)
{
	return;

	await guild.commands.fetch();

	let guildData = DataManager.getServerData(guild.id);

	for(let[commandId, command] of guild.commands.cache)
	{
		const interneCommand = client.commands.get(command.name);

		if (!interneCommand)
		{
			continue;
		}

		command.defaultPermission = false;

		if(('everyonePermission' in interneCommand) && (interneCommand.everyonePermission))
		{
			await command.permissions.set({permissions: 
			[
				{
					id: guild.roles.everyone.id,
					type: 'ROLE',
					permission: true
				}
			]});

			continue;
		}

		if(guildData.botManagerRole != -1)
		{
			await command.permissions.set({permissions: 
			[
				{
					id: guild.roles.everyone.id,
					type: 'ROLE',
					permission: false
				},
				{
					id: guildData.botManagerRole,
					type: 'ROLE',
					permission: true
				}
			]});

			continue;
		}

		await command.permissions.set({permissions: 
		[
			{
				id: guild.roles.everyone.id,
				type: 'ROLE',
				permission: false
			}
		]});
	}

	console.log('Successfully set command permissions for guild ' + guild.name);
}

client.login(token);