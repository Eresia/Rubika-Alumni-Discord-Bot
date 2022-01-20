const { SlashCommandBuilder } = require('@discordjs/builders');
const DiscordUtils = require('../scripts/discord-utils.js');
const { Permissions } = require('discord.js');

let allCommands = [];

const newCityChannelId = '852099541079556096';
const newCityMessageId = '875426135511547974';

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
			await interaction.reply({ content: 'The emoji is not valid', ephemeral: true });
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

		await interaction.reply('Création du rôle ' + DiscordUtils.getRoleStringById(role.id) + ' avec succès');

		let eventMessage = await DiscordUtils.getMessageById(interaction.client, newCityChannelId, newCityMessageId);

        if(eventMessage != null)
        {
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

            await interaction.followUp(constructMessage);
        }
        else
        {
            await interaction.followUp({ content: 'No event message found', ephemeral: true });
        }

	}
});

module.exports = {
    allCommands
};