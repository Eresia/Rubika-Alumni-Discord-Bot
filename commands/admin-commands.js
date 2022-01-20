const { SlashCommandBuilder } = require('@discordjs/builders');
const DiscordUtils = require('../scripts/discord-utils.js');
const AlumniCheck = require('../scripts/alumni-check.js');
const { Permissions } = require('discord.js');

let allCommands = [];

// const newCityChannelId = '852099541079556096';
// const newCityMessageId = '875426135511547974';

const newCityChannelId = '720705145289310289';
const newCityMessageId = '933416978759164034';

allCommands.push({
	data: new SlashCommandBuilder()
			.setName('new-city')
			.setDescription('Add new city role and channels')
			.addStringOption(option => 
				option
					.setName('emoji')
					.setDescription('Emoji for the city')
					.setRequired(true)
			)
			.addStringOption(option => 
				option
					.setName('location')
					.setDescription('Where the city is in the world')
					.setRequired(true)
					.addChoice('Europe', 'Europe')
					.addChoice('North America', 'NA')
					.addChoice('Asia', 'Asia')
			)
			.addStringOption(option =>
				option
				.setName('city-name')
				.setDescription('The name of the city')
				.setRequired(true)
			),

	async execute(interaction, dataManager) {
		dataManager.initGuildData(interaction.guild.id);

		if(!interaction.member.permissions.has("ADMINISTRATOR"))
		{
			if(!DiscordUtils.hasMemberRole(interaction.member, dataManager.getServerData(interaction.guild.id).botManagerRole))
			{
				await interaction.reply('You don\'t have permission for this command');
				return;
			}
		}

		let guildData = dataManager.getServerData(interaction.guild.id);

		let emoji = interaction.options.getString('emoji');
		let locationString = interaction.options.getString('location');
		let city = interaction.options.getString('city-name');

		const regexEmoji = /(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])/gi;
		if(!regexEmoji.test(emoji) && ((emoji.charAt(0) != ':' ) || (emoji.charAt(emoji.length - 1) != ':' )))
		{
			await interaction.reply("emoji not valid");
			return;
		}

		let location = -1;

		switch(locationString)
		{
			case 'Europe':
				location = 0;
				break;

			case 'NA':
				location = 1;
				break;

			case 'Asia':
				location = 2;
				break;
		}

		let gameRolePosition = DiscordUtils.getRoleById(interaction.guild, guildData.gameRole).position;

		let role = await interaction.guild.roles.create({
			reason: 'Add Role for city ' + city,
			name: city,
			position: gameRolePosition + 1,
			mentionable: false,
			hoist: true
		});
		
		let category = await interaction.guild.channels.create(city, 
		{
			type: 'GUILD_CATEGORY',
			reason: 'Create Category for city ' + city,
			permissionOverwrites: 
			[
				{
					id: interaction.guild.id,
					deny: 
					[
						Permissions.FLAGS.VIEW_CHANNEL, 
						Permissions.FLAGS.SEND_MESSAGES
					]
				},
				{
					id: role.id,
					allow: 
					[
						Permissions.FLAGS.VIEW_CHANNEL, 
						Permissions.FLAGS.SEND_MESSAGES
					]
				}
			]
		});

		await interaction.guild.channels.create("🎉events-" + city, 
		{
			type: 'GUILD_TEXT',
			reason: 'Create event channel for city ' + city,
			parent: category,
			permissionOverwrites:
			[
				{
					id: interaction.guild.id,
					deny: 
					[
						Permissions.FLAGS.VIEW_CHANNEL, 
						Permissions.FLAGS.SEND_MESSAGES
					]
				},
				{
					id: role.id,
					allow: 
					[
						Permissions.FLAGS.VIEW_CHANNEL
					]
				},
				{
					id: guildData.ambassadorRole,
					allow: 
					[
						Permissions.FLAGS.SEND_MESSAGES
					]
				},
				{
					id: guildData.botEventRole,
					allow: 
					[
						Permissions.FLAGS.VIEW_CHANNEL,
						Permissions.FLAGS.SEND_MESSAGES
					]
				}
			]
		});

		await interaction.guild.channels.create("💬general-" + city, 
		{
			type: 'GUILD_TEXT',
			reason: 'Create general channel for city ' + city,
			parent: category
		});

		await interaction.guild.channels.create("💼serious-" + city, 
		{
			type: 'GUILD_TEXT',
			reason: 'Create serious channel for city ' + city,
			parent: category,
			rateLimitPerUser: 30
		});

		await interaction.guild.channels.create("💡idées-" + city, 
		{
			type: 'GUILD_TEXT',
			reason: 'Create idées channel for city ' + city,
			parent: category,
			rateLimitPerUser: 120
		});

		let eventMessage = await DiscordUtils.getMessageById(interaction.client, newCityChannelId, newCityMessageId);

		let baseEmbed = eventMessage.embeds[0];
		
		let title = baseEmbed.title.replace(/\n/g, "\\n");
		let description = null;
		
		if(baseEmbed.description != null)
		{
			description = baseEmbed.description.replace(/\n/g, "\\n");
		}
		
		let fields = "";

		for(let i = 0; i < baseEmbed.fields.length; i++)
		{
			if(i != 0)
			{
				fields += ",";
			}

			fields += '{"name": "' + baseEmbed.fields[i].name.replace(/\n/g, "\\n") + '", "value": "';

			if(location != i)
			{
				if(baseEmbed.fields[i].value == "\u200B")
				{
					fields += "\\u200B";
				}
				else
				{
					fields += baseEmbed.fields[i].value.replace(/\n/g, "\\n");
				}
			}
			else
			{
				let allCities = [];

				if(baseEmbed.fields[i].value != "\u200B")
				{
					let split = baseEmbed.fields[i].value.split("\n");

					for(let j = 0; j < split.length; j++)
					{
						allCities.push({"name": split[j].split(" - ")[1], "value": split[j]});
					}
				}

				allCities.push({"name": city.toUpperCase(), "value": emoji + " - " + city.toUpperCase()});

				allCities.sort((a, b) => a.name.localeCompare(b.name));

				for(let j = 0; j < allCities.length; j++)
				{
					if(j != 0)
					{
						fields += "\\n";
					}

					fields += allCities[j].value;
				}
			}

			fields += '", "inline": true}';
		}
		
		+ "\\n" + emoji + " - " + city.toUpperCase();
		let constructMessage = '\u200B\n**==Ces deux commandes sont à copier coller==**\n\nCommande 1 : \n```'
			+ 'z/edit ' + newCityMessageId + ' {\n"color": 0,\n"title": "'+ title + '",\n';

		if(description != null)
		{
			constructMessage += '"description": "' + description + '"\n';
		}
			
		constructMessage += '"fields": [' + fields + ']}'
			+ "```\nCommande 2 : \n```"
			+ "z/normal " + emoji + " " + DiscordUtils.getRoleStringById(role.id)
			+ "\n```";

		await interaction.reply('Création du rôle ' + DiscordUtils.getRoleStringById(role.id) + ' avec succès');
		await interaction.followUp(constructMessage);
	}
});

allCommands.push({
	data: new SlashCommandBuilder()
			.setName('ask-user-pm')
			.setDescription('Ask user informations in private message')
			.addUserOption(option =>
				option
					.setName('user')
					.setDescription('The user')
					.setRequired(true)
			),

	async execute(interaction, dataManager) {
		let user = interaction.options.getUser('user');

		await AlumniCheck.askMemberInformations(interaction.client, dataManager, interaction.guild, user);
		await interaction.reply('Message send to ' + DiscordUtils.getUserStringById(user.id) + ' (' + user.tag + ')');
	}
});

allCommands.push({
	data: new SlashCommandBuilder()
			.setName('register-user')
			.setDescription('Register user with informations')
			.addUserOption(option =>
				option
					.setName('user')
					.setDescription('The user')
					.setRequired(true)
			)
			.addStringOption(option =>
				option
					.setName('school')
					.setDescription('Which speciality')
					.setRequired(true)
					.addChoice('Animation', 'COM')
					.addChoice('Design', 'ISD')
					.addChoice('Game', 'GAME')
			)
			.addStringOption(option =>
				option
					.setName('display-name')
					.setDescription('If the user need a rename')
					.setRequired(false)
			),

	async execute(interaction, dataManager) {

		let user = interaction.options.getUser('user');
		let school = interaction.options.getString('school');
		let pseudo = interaction.options.getString('display-name');

		if(await AlumniCheck.registerMember(dataManager, interaction.guild, user, pseudo))
		{
			await AlumniCheck.setMemberSchool(dataManager, user, interaction.guild, school);
			await interaction.reply('Register ' + DiscordUtils.getUserStringById(user.id));
		}
		else
		{
			await interaction.reply(await interaction.reply({ content: 'Can\'t register ' + DiscordUtils.getUserStringById(user.id), ephemeral: true }));
		}
	}
});

allCommands.push({
	data: new SlashCommandBuilder()
			.setName('remove-user')
			.setDescription('Remove user informations')
			.addUserOption(option =>
				option
					.setName('user')
					.setDescription('The user')
					.setRequired(true)
			),

	async execute(interaction, dataManager) {

		let user = interaction.options.getUser('user');

		if(await AlumniCheck.removeMember(dataManager, interaction.guild, user))
		{
			await interaction.reply('Remove ' + DiscordUtils.getUserStringById(user.id) + ' (' + user.tag + ')');
		}
		else
		{
			await interaction.reply(await interaction.reply({ content: 'Can\'t remove ' + DiscordUtils.getUserStringById(user.id) + ' (' + user.tag + ')', ephemeral: true }));
		}
	}
});

module.exports = {
	allCommands
};