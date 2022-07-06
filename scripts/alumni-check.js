const { MessageEmbed } = require('discord.js');

const SheetManager = require('./sheet.js');
const DiscordUtils = require('./discord-utils.js');
const MailManager =  require('./mail-manager.js')

const { MessageActionRow, MessageButton } = require('discord.js');

const timeBeetweenSheetRefresh = 10000;

const mailSubject =
{
	FR: "Lien d'invitation sur le Discord Rubika Alumni",
	EN: "Invite Link for Rubika Alumni Discord"
}

const mailText =
{
	FR: "Bienvenue sur le discord, voici votre lien d'invitation unique : %%L",
	EN: "Welcome to the Discord, this is your unique invitation link: %%L"
}

const canUseName = 
{
	FR: 'Bonjour. Pour faciliter la reconnaissance de tout le monde, nous souhaiterions modifier votre pseudo sur le serveur sous la forme "Prénom Nom" (%%N). Êtes vous d\'accord ?', 
	EN: 'Hello. To your pseudo, we advise to use the form "First-Name Last-Name" (%%N) so that everyone can recognize each other. Can we change it for you?'
}

const confirmName = 
{
	FR: 'J\'accepte d\'être renommé·e %%N',
	EN: 'I accept to be rename %%N'
}

const declineName = 
{
	FR: 'Je souhaite utiliser un autre pseudo',
	EN: 'I want to use another pseudo'
}

const askName = 
{
	FR: 'Pouvez vous m\'indiquer de quelle manière voudriez vous êtes nommé dans le serveur ?',
	EN: 'Can you give me under what name would you be called in the server?'
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

let userData = [];
let actualUserDataTimeout = null;
let actualValidationCollector = null;

async function init(dataManager, guild)
{
	MailManager.initEmailManager();
}

async function initValidationCollector(dataManager, guild)
{
	let guildData = dataManager.getServerData(guild.id);

	if(actualValidationCollector != null)
	{
		actualValidationCollector.stop();
		actualValidationCollector = null;
	}

	if(guildData.validMemberChannel == -1)
	{
		return;
	}

	let validMemberChannel = DiscordUtils.getChannelById(guild.client, guildData.validMemberChannel);

	if(validMemberChannel == null)
	{
		return;
	}

	const validationFilter = function(button){return ((button.customId === 'validate' || button.customId === 'reject'))};
	const validationCollector = validMemberChannel.createMessageComponentCollector({ filter: validationFilter, max: 0 });

	validationCollector.on('collect', function(button)
	{
		if(!button.isButton())
		{
			return;
		}

		if((button.customId != 'validate') && (button.customId != 'reject'))
		{
			return;
		}

		let userIndex = -1;

		for(let i = 0; i < userData.length; i++)
		{
			if(userData[i].message == button.message.id)
			{
				userIndex = i;
				break;
			}
		}

		if(userIndex == -1)
		{
			validMemberChannel.send("Can't find user data from message " + button.message.id);
			return;
		}

		let validate = (button.customId == 'validate') ? true : false;

		userData[userIndex].verified = 'Oui';
		userData[userIndex].status = validate ? 'Membre' : 'Refusé';

		SheetManager.updateUserVerification(guildData.sheetInformations, userData[userIndex]);

		let tag = button.message.embeds[0].description.split('\n')[0].substring(6);

		button.update({ embeds: [createResumeInviteEmbed(userData[userIndex], tag)], components: [] });
	});

	actualValidationCollector = validationCollector;
}

async function initUserData(dataManager, guild)
{
	let guildData = dataManager.getServerData(guild.id);

	if(actualUserDataTimeout != null)
	{
		clearInterval(actualUserDataTimeout);
		actualUserDataTimeout = null;
	}

	if(!("link" in guildData.sheetInformations) || !("page" in guildData.sheetInformations) || !("rangeMin" in guildData.sheetInformations) || !("rangeMax" in guildData.sheetInformations))
	{
		return;
	}

	userData = await SheetManager.getActualFormResults(guildData.sheetInformations);

	actualUserDataTimeout = setInterval(function(){checkNewUsers(dataManager, guild);}, timeBeetweenSheetRefresh);

	console.log("Sheet initialisation successfull");
}

async function checkNewUsers(dataManager, guild)
{
	let guildData = dataManager.getServerData(guild.id);

	if(guildData.inviteChannel == -1 || guildData.validMemberChannel == -1)
	{
		return;
	}

	let validMemberChannel = DiscordUtils.getChannelById(guild.client, guildData.validMemberChannel);

	if(validMemberChannel == null)
	{
		return;
	}

	let validationButtons = new MessageActionRow()
		.addComponents([
			new MessageButton()
				.setCustomId('validate')
				.setLabel('Valider')
				.setStyle('PRIMARY'),

			new MessageButton()
				.setCustomId('reject')
				.setLabel('Refuser')
				.setStyle('PRIMARY'),
		]);

	let newUserData = await SheetManager.getActualFormResults(guildData.sheetInformations);

	for(let i = userData.length; i < newUserData.length; i++)
	{
		if(newUserData[i].send != "En Attente")
		{
			continue;
		}

		newUserData[i].verified = "Non";
		newUserData[i].status = "En Attente";

		let langage = (newUserData[i].langage == "Français") ? "FR" : "EN";

		let inviteChannel = DiscordUtils.getChannelById(guild.client, guildData.inviteChannel);
		let invite = await inviteChannel.createInvite({maxUses: 1, unique: true, reason: 'Create invitation for ' + newUserData[i].firstName + ' ' + newUserData[i].name});
		newUserData[i].invite = 'https://discord.gg/' + invite.code;

		let emailError = await MailManager.sendMail(newUserData[i].mail, mailSubject[langage], mailText[langage].replace('%%L', newUserData[i].invite));

		if(emailError == null)
		{
			newUserData[i].send = "Envoyé";
		}
		else
		{
			newUserData[i].send = "Erreur";
		}

		let newMessage = await validMemberChannel.send({ embeds: [createResumeInviteEmbed(newUserData[i], "Pas sur le discord")], components: [validationButtons] });
		newUserData[i].message = newMessage.id;

		if(emailError != null)
		{
			await validMemberChannel.send("Error with sending email : " + emailError);
		}

		SheetManager.updateUserVerification(guildData.sheetInformations, newUserData[i]);
		SheetManager.updateUserLinks(guildData.sheetInformations, newUserData[i]);
	}

	userData = newUserData;
}

function setMemberSchool(dataManager, guildMember, school)
{
	let guildData = dataManager.getServerData(guildMember.guild.id);

	if(guildData.gameRole == -1 || guildData.animationRole == -1 || guildData.designRole == -1)
	{
		return;
	}

	switch(school)
	{
		case 'GAME':
			guildMember.roles.add(guildData.gameRole);
			break;

		case 'ANIM':
			guildMember.roles.add(guildData.animationRole);
			break;

		case 'DESIGN':
			guildMember.roles.add(guildData.designRole);
			break;
	}
}

async function askMemberInformations(client, dataManager, invitePromise, guild, guildMember)
{
	let user = guildMember.user;

	if(user.bot)
	{
		return;
	}

	let guildData = dataManager.getServerData(guild.id);

	if(guildData.validMemberChannel == -1)
	{
		return;
	}

	let validMemberChannel = DiscordUtils.getChannelById(guild.client, guildData.validMemberChannel);

	if(validMemberChannel == null)
	{
		return;
	}

	let inviteCode = await invitePromise;

	if(inviteCode == undefined)
	{
		validMemberChannel.send("Can't find invite for user " + user.tag);
		return;
	}

	inviteCode = 'https://discord.gg/' + inviteCode;

	let userInfos = null;

	for(let i = 0; i < userData.length; i++)
	{
		if(userData[i].invite == inviteCode)
		{
			userInfos = userData[i];
		}
	}

	if(userInfos == null)
	{
		validMemberChannel.send("Can't find data for user " + user.tag);
		return;
	}

	let fullName = userInfos.firstName + ' ' + userInfos.name;

	setMemberSchool(dataManager, guildMember, userInfos.school);

	let validMessage = await DiscordUtils.getMessageById(client, validMemberChannel.id, userInfos.message);

	validMessage.edit({ embeds: [createResumeInviteEmbed(userInfos, user.tag)], components: validMessage.components });

	let dmChannel = await guildMember.createDM();

	let langage = (userInfos.langage == "Français") ? "FR" : "EN";

	let nameRow = new MessageActionRow()
		.addComponents([
			new MessageButton()
				.setCustomId('YES')
				.setLabel(confirmName[langage].replace('%%N', fullName))
				.setStyle('PRIMARY'),

			new MessageButton()
				.setCustomId('NO')
				.setLabel(declineName[langage])
				.setStyle('PRIMARY')
		]);

	const canUseNameFilter = function(button){return ((button.customId === 'YES' || button.customId === 'NO'))};
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
		try {
			await guildMember.setNickname(message.content);
		} catch(err) {
			console.log("Can't change nickname of " + user.tag);
		}

		dmChannel.send(introString + confirmMessage[langage]);
	}

	let collectCanUseName = async function(button)
	{
		if(button.customId == 'YES')
		{
			try {
				await guildMember.setNickname(fullName);
			} catch(err) {
				console.log("Can't change nickname of " + user.tag);
			}

			await button.update({content: introString + confirmMessage[langage], components: []});
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
				console.log(error);
			}
		}
	}

	try
	{
		await dmChannel.send({content: introString + canUseName[langage].replace('%%N', fullName), components: [nameRow] });
		canUseNameCollector.on('collect', collectCanUseName);
	}
	catch(error)
	{
		console.error(error);
	}
}

function createResumeInviteEmbed(userData, pseudo)
{
	let result = new MessageEmbed();

	result.title = userData.firstName + ' ' + userData.name;

	result.description = 'Tag : ' + pseudo + '\n';
	result.description += "Vérifié : " + userData.verified + '\n';
	result.description += "Statut : " + userData.status + '\n';
	result.description += "Filière : " + userData.school + '\n\n';
	result.description += "Lien d'invitation : " + userData.invite + '\n\n';

	result.description += "Statut Email : " + userData.send + '\n';

	return result;
}

module.exports = 
{
	init,
	initValidationCollector,
	initUserData,
	askMemberInformations
}

let createBilingueMessage = function(message)
{
	return ":flag_fr: **Version Française :**\n\n" + message.FR + "\n\n\n:flag_gb: **English Version:**\n\n" + message.EN;
}