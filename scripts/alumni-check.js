const { MessageActionRow, MessageButton } = require('discord.js');

const chooseLangage = 
{
	FR : 'Pouvez vous sélectionner le drapeau correspondant à la langue que vous souhaitez utiliser ?', 
	EN : 'Can you click on the flag of the language you want to use?'
}

const askSchool = 
{
	FR : 'Pouvez vous m\'indiquer de quelle formation êtes vous ?', 
	EN : 'Can you give me your cursus?'
}

const askName = 
{
	FR : 'Pouvez vous également m\'indiquer de quelle manière voudriez vous êtes nommé dans le serveur ? Nous conseillons la forme "Prénom Nom" afin que tout le monde puisse se reconnaitre.',
	EN : 'Can you give me under what name would you be called in the server? We advise to use the form "First-Name Last-Name so that everyone can recognize each other.'
}

const confirmMessage = 
{
	FR : '**Vous avez bien été enregistré dans le serveur !**\n\n' 
	+ 'Les channels les plus importants :\n' 
	+ '<#852099541079556096> :  pour rejoindre une ou plusieurs villes et participer à ses événements\n' 
	+ '<#875411952313188373> : les annonces qui concernent tout le monde\n' 
	+ '<#875411975256018954> : pour proposer de nouvelles villes\n' 
	+ '<#881949055150866494> : pour toutes les suggestions et améliorations\n\n' 
	+ 'Bonne journée et bienvenue !',

	EN : '**You are sucessfully registered!**\n\n' 
	+ 'Most important channels:\n' 
	+ '<#852099541079556096>: to join one or several cities and join their events\n' 
	+ '<#875411952313188373>: the general announcement for everyone\n' 
	+ '<#875411975256018954>: to ask for new cities\n' 
	+ '<#881949055150866494>: for all ideas and suggestions\n\n' 
	+ 'Have a nice day and welcome!'
}

const removeAllDmMessage = false;

async function registerMember(dataManager, guild, user, name)
{
	let guildData = dataManager.getServerData(guild.id);

	if(guildData.invalidRole == -1 || guildData.validRole == -1 || guildData.gameRole == -1 || guildData.animationRole == -1 || guildData.designRole == -1)
	{
		return false;
	}

	let guildMember = await guild.members.fetch(user.id);

	guildMember.roles.remove(guildData.invalidRole);

	guildMember.roles.add(guildData.validRole);

	try {
		await guildMember.setNickname(name);
	} catch(err) {
		console.log("Can't change nickname of " + user.tag);
	}

	return true;
}

async function setMemberSchool(dataManager, user, guild, school)
{
	let guildMember = await guild.members.fetch(user.id);
	let guildData = dataManager.getServerData(guild.id);

	switch(school)
	{
		case 'GAME':
			guildMember.roles.add(guildData.gameRole);
			break;

		case 'COM':
			guildMember.roles.add(guildData.animationRole);
			break;

		case 'ISD':
			guildMember.roles.add(guildData.designRole);
			break;
	}
}

async function removeMember(dataManager, guild, user)
{
	let guildData = dataManager.getServerData(guild.id);

	if(guildData.invalidRole == -1 || guildData.validRole == -1 || guildData.gameRole == -1 || guildData.animationRole == -1 || guildData.designRole == -1)
	{
		return false;
	}

	let guildMember = await guild.members.fetch(user.id);

	await guildMember.roles.remove(guildData.validRole);
	await guildMember.roles.remove(guildData.gameRole);
	await guildMember.roles.remove(guildData.animationRole);
	await guildMember.roles.remove(guildData.designRole);

	await guildMember.roles.add(guildData.invalidRole);

	try {
		await guildMember.setNickname(null);
	} catch(err) {
		console.log("Can't change nickname of " + user.tag);
	}

	return true;
}

async function askMemberInformations(client, dataManager, guild, user, firstMessage = true)
{
	if(user.bot)
	{
		return;
	}

	let guildData = dataManager.getServerData(guild.id);

	if(guildData.invalidRole == -1 || guildData.validRole == -1 || guildData.gameRole == -1 || guildData.animationRole == -1 || guildData.designRole == -1)
	{
		return;
	}

	let guildMember = await guild.members.fetch(user.id);

	let dmChannel = await guildMember.createDM();
	let channelMessages = await dmChannel.messages.fetch();

	if(removeAllDmMessage)
	{
		for(let i = 0; i < channelMessages.size; i++)
		{
			let message = channelMessages.at(i);
			if(message.author.id == client.user.id)
			{
				await message.delete();
			}
		}

		firstMessage = true;
	}

	let langageRow = new MessageActionRow()
						.addComponents([
							new MessageButton()
								.setCustomId('FR')
								.setLabel('Français')
								.setEmoji('🇫🇷')
								.setStyle('PRIMARY'),

							new MessageButton()
								.setCustomId('EN')
								.setLabel('English')
								.setEmoji('🇬🇧')
								.setStyle('PRIMARY'),
						]);

	let schoolRow = new MessageActionRow()
						.addComponents([
							new MessageButton()
								.setCustomId('COM')
								.setLabel('Animation')
								.setStyle('PRIMARY'),

							new MessageButton()
								.setCustomId('ISD')
								.setLabel('Design')
								.setStyle('PRIMARY'),

							new MessageButton()
								.setCustomId('GAME')
								.setLabel('Game')
								.setStyle('PRIMARY'),
						]);

	let langage = "EN";

	const langageFilter = function(button){return ((button.customId === 'FR' || button.customId === 'EN'))};
	const langageCollector = dmChannel.createMessageComponentCollector({ filter: langageFilter, max: 1 });

	const schoolFilter = function(button){return ((button.customId === 'COM' || button.customId === 'ISD' || button.customId === 'GAME'))};
	const schoolCollector = dmChannel.createMessageComponentCollector({ filter: schoolFilter, max: 1 });

	const pseudoFilter = function(message){return (!message.author.bot);};
	const pseudoCollector = dmChannel.createMessageCollector({ filter: pseudoFilter, max: 1 });

	let introString = '';

	for(let i = 0; i < 100; i++)
	{
		introString += '\\_';
	}

	introString += '\n\n';

	let collectPseudo = async function(message)
	{
		await registerMember(dataManager, guild, user, message.content);
		dmChannel.send(introString + confirmMessage[langage]);
	}

	let collectSchool = async function(button)
	{
		await setMemberSchool(dataManager, user, guild, button.customId);

		try
		{
			pseudoCollector.on('collect', collectPseudo);
			await button.update({content: introString + askName[langage], components: []});
		}
		catch(error)
		{
			console.error(error);
		}
	}

	let collectLangage = async function(button)
	{
		langage = button.customId;

		try
		{
			schoolCollector.on('collect', collectSchool);
			await button.update({content: introString + askSchool[langage], components: [schoolRow] });
		}
		catch(error)
		{
			console.error(error);
		}
	}

	try
	{
		if(firstMessage || (channelMessages.size == 0))
		{
			await dmChannel.send({content: introString + createBilingueMessage(chooseLangage), components: [langageRow] });
			langageCollector.on('collect', collectLangage);
		}
		else
		{
			let hasSelfMessage = false;

			for(let i = 0; i < channelMessages.size; i++)
			{
				let message = channelMessages.at(i);
				if(message.author.id == client.user.id)
				{
					hasSelfMessage = true;

					switch(message.content.substring(introString.length))
					{
						case createBilingueMessage(chooseLangage):
							langageCollector.on('collect', collectLangage);
							break;

						case askSchool.FR:
							langage = 'FR';
							schoolCollector.on('collect', collectSchool);
							break;

						case askSchool.EN:
							langage = 'EN';
							schoolCollector.on('collect', collectSchool);
							break;

						case askName.FR:
							langage = 'FR';
							pseudoCollector.on('collect', collectPseudo);
							break;

						case askName.EN:
							langage = 'EN';
							pseudoCollector.on('collect', collectPseudo);
							break;
					}

					break;
				}
			}

			if(!hasSelfMessage)
			{
				await dmChannel.send({content: introString + createBilingueMessage(chooseLangage), components: [langageRow] });
				langageCollector.on('collect', collectLangage);
			}
		}
		
	}
	catch(error)
	{
		console.error(error);
	}
}

module.exports = {
	registerMember,
	setMemberSchool,
	removeMember,
	askMemberInformations
}

let createBilingueMessage = function(message)
{
	return ":flag_fr: **Version Française :**\n\n" + message.FR + "\n\n\n:flag_gb: **English Version:**\n\n" + message.EN;
}