const { MessageActionRow, MessageButton } = require('discord.js');

const chooseLangage = 
{
	FR : 'Bonjour ! Pouvez vous sélectionner le drapeau correspondant à la langue que vous souhaitez utiliser ?', 
	EN : 'Hello ! Can you click on the flag of the language you want to use?'
}

const canUseName = 
{
	FR : 'Pour faciliter la reconnaissance de tout le monde, nous souhaiterions modifier votre pseudo sur le serveur sous la forme "Prénom Nom" (%%N). Êtes vous d\'accord ?', 
	EN : 'To your pseudo, we advise to use the form "First-Name Last-Name" (%%N) so that everyone can recognize each other. Can we change it for you?'
}

const confirmName = 
{
	FR : 'J\'accepte d\'être renommé·e %%N',
	EN : 'I accept to be rename %%N'
}

const declineName = 
{
	FR : 'Je souhaite utiliser un autre pseudo',
	EN : 'I want to use another pseudo'
}

const askName = 
{
	FR : 'Pouvez vous m\'indiquer de quelle manière voudriez vous êtes nommé dans le serveur ?',
	EN : 'Can you give me under what name would you be called in the server?'
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

	// if(guildData.invalidRole == -1 || guildData.validRole == -1)
	// {
	// 	return false;
	// }

	let guildMember = await guild.members.fetch(user.id);

	//guildMember.roles.remove(guildData.invalidRole);

	//guildMember.roles.add(guildData.validRole);

	try {
		await guildMember.setNickname(name);
	} catch(err) {
		console.log("Can't change nickname of " + user.tag);
	}

	return true;
}

async function setMemberSchool(dataManager, user, guild, school)
{
	let guildData = dataManager.getServerData(guild.id);

	if(guildData.gameRole == -1 || guildData.animationRole == -1 || guildData.designRole == -1)
	{
		return;
	}

	let guildMember = await guild.members.fetch(user.id);

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

async function askMemberInformations(client, dataManager, invitePromise, guild, guildMember, firstMessage = true)
{
	let user = guildMember.user;

	if(user.bot)
	{
		return;
	}

	let guildData = dataManager.getServerData(guild.id);

	if(guildData.invalidRole == -1 || guildData.validRole == -1 || guildData.gameRole == -1 || guildData.animationRole == -1 || guildData.designRole == -1)
	{
		return;
	}

	let inviteCode = await invitePromise;

	if(inviteCode == undefined)
	{
		console.log("Can't find invite for user " + user.tag);
		return;
	}

	console.log("Invite link : " + inviteCode);

	return;

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

	let langage = "EN";

	const langageFilter = function(button){return ((button.customId === 'FR' || button.customId === 'EN'))};
	const langageCollector = dmChannel.createMessageComponentCollector({ filter: langageFilter, max: 1 });

	const canUseNameFilter = function(button){return ((button.customId === 'COM' || button.customId === 'ISD' || button.customId === 'GAME'))};
	const canUseNameCollector = dmChannel.createMessageComponentCollector({ filter: canUseNameFilter, max: 1 });

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

	let collectCanUseName = async function(button)
	{
		if(button.customId == 'Yes')
		{
			dmChannel.send(introString + confirmMessage[langage]);
		}
		else
		{
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
	}

	let collectLangage = async function(button)
	{
		langage = button.customId;

		let nameRow = new MessageActionRow()
						.addComponents([
							new MessageButton()
								.setCustomId('Yes')
								.setLabel(confirmName[langage])
								.setStyle('PRIMARY'),

							new MessageButton()
								.setCustomId('No')
								.setLabel(declineName[langage])
								.setStyle('PRIMARY')
						]);

		try
		{
			canUseNameCollector.on('collect', collectCanUseName);
			await button.update({content: introString + canUseName[langage], components: [nameRow] });
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
							canUseNameCollector.on('collect', collectCanUseName);
							break;

						case askSchool.EN:
							langage = 'EN';
							canUseNameCollector.on('collect', collectCanUseName);
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