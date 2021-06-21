const discordUtils = require('./discordUtils.js');
const google = require('./google.js');

const askMessage = "Bonjour. Pouvez vous m'écrire un message de la forme \"Prénom Nom\" pour que je puisse vous enregistrer dans le serveur Rubika Alumni ?";
const confirmMessage = "Vous avez bien été enregistré dans le serveur, vous devriez avoir maintenant accès à toutes les informations ! Passez une bonne journée.";
const notFoundMessage = "Je suis désolé, mais je n'arrive pas à trouver le nom $$$ dans la base de donnée. Pouvez vous vérifier qu'il n'y avait pas d'erreur de frappe (attention aux accents !) ? Si le soucis persiste, n'hésitez pas à envoyer un message aux modérateurs pour qu'ils puissent vous aider.";
const alreadyRegisteredMessage = "Je suis désolé, mais le nom que vous avez saisi est déjà enregistré pour le serveur. Si c'est bien le votre, merci de contacter les administrateurs pour qu'ils puissent vérifier le problème avec vous.";

const check_no_registered = "Non";
const check_registered = "Oui";

const first_name_cell = "Prénom";
const last_name_cell = "Nom";
const check_cell = "Enregistré";
const pseudo_cell = "Pseudo";

module.exports = {
	updateSheet : function(data, serverId)
	{
		let info = {};
		info.serverId = serverId;
		info.link = data[serverId].link;
		info.page = data[serverId].page;
		info.range = data[serverId].range;

		info.firstName = first_name_cell;
		info.lastName = last_name_cell;
		info.checkName = check_cell;
		info.pseudoName = pseudo_cell;

		google.updateSheetData(info);
	},

	getUserByName : function(serverId, name)
	{
		let lowerName = name.toLowerCase();

		for(let i = 0; i < google.sheetData[serverId].length; i++)
		{
			let lowerSheetName1 = google.sheetData[serverId][i].firstName.toLowerCase();
			let lowerSheetName2 = google.sheetData[serverId][i].lastName.toLowerCase();

			if((lowerName == (lowerSheetName1 + " " + lowerSheetName2)) || (lowerName == (lowerSheetName2 + " " + lowerSheetName1)))
			{
				return google.sheetData[serverId][i];
			}
		}

		return null;
	},

	getUserByTag : function(serverId, tag)
	{
		for(let i = 0; i < google.sheetData[serverId].length; i++)
		{
			if(tag == google.sheetData[serverId][i].pseudo)
			{
				return google.sheetData[serverId][i];
			}
		}

		return null;
	},

	askNewMember : function(data, guildMember, firstMessage = true)
	{
		guildMember.createDM().then(dmChannel =>
			{

			if(firstMessage)
			{
				dmChannel.send(askMessage);
			}

			let filter = function(message)
			{
				if(message.author.bot)
				{
					return false;
				}

				let user = module.exports.getUserByName(guildMember.guild.id, message.content);
				if(user == null)
				{
					dmChannel.send(notFoundMessage.replace("$$$", message.content));
					return false;
				}

				if(user.check == check_registered)
				{
					dmChannel.send(alreadyRegisteredMessage);
					return false;
				}

				return true;
			}

			dmChannel.awaitMessages(filter, {max: 1}).then(async function(collected)
				{
					await applyNewMember(data, guildMember, collected.first().content);
					discordUtils.reactRightMessage(collected.first(), confirmMessage);
				});
			}
		);
	},

	applyNewMember : async function(data, guildMember, name)
	{
		let dataGuild = data[guildMember.guild.id];

		let user = module.exports.getUserByName(guildMember.guild.id, name);
		guildMember.roles.remove(dataGuild.invalidRole);
		guildMember.roles.add(dataGuild.validRole);

		try {
			await guildMember.setNickname(user.firstName + " " + user.lastName);
		} catch(err) {
			console.error(err);
		}

		module.exports.registerUser(data, guildMember, user);
	},

	removeMember : async function(data, guildMember)
	{
		let dataGuild = data[guildMember.guild.id];

		let user = module.exports.getUserByTag(guildMember.guild.id, guildMember.user.tag);
		guildMember.roles.remove(dataGuild.validRole);
		guildMember.roles.add(dataGuild.invalidRole);

		try {
			await guildMember.setNickname(null);
		} catch(err) {
			console.error(err);
		}

		module.exports.unregisterUser(data, guildMember, user);
	},

	registerUser : function(data, guildMember, user)
	{
		let pseudo = guildMember.user.tag;
		createAndSendSheetInformations(data, guildMember, user.checkCell, check_registered);
		createAndSendSheetInformations(data, guildMember, user.pseudoCell, pseudo);

		user.check = check_registered;
		user.pseudo = pseudo;
	},

	unregisterUser : function(data, guildMember, user)
	{
		createAndSendSheetInformations(data, guildMember, user.checkCell, check_no_registered);
		createAndSendSheetClear(data, guildMember, user.pseudoCell);

		user.check = check_no_registered;
		user.pseudo = "";
	}
}

let createAndSendSheetInformations = function(data, guildMember, range, value)
{
	let info = {};
	info.serverId = guildMember.guild.id;
	info.link = data[guildMember.guild.id].link;
	info.page = data[guildMember.guild.id].page;

	info.range = range;
	info.values = [[value]];
	google.updateSheetRange(info);
}

let createAndSendSheetClear = function(data, guildMember, range)
{
	let info = {};
	info.serverId = guildMember.guild.id;
	info.link = data[guildMember.guild.id].link;
	info.page = data[guildMember.guild.id].page;

	info.range = range;
	google.clearSheetRange(info);
}