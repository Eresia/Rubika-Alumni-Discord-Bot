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
const id_cell = "Id";

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
		info.idName = id_cell;

		google.updateSheetData(info);
	},

	getUserByName : function(serverId, name)
	{
		let lowerName = name.toLowerCase();

		if(!(serverId in google.sheetData))
		{
			console.log("No access to google user data");
			return null;
		}

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

	getUserById : function(serverId, id)
	{
		for(let i = 0; i < google.sheetData[serverId].length; i++)
		{
			if(id == google.sheetData[serverId][i].id)
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
		if(guildMember.user.bot)
		{
			return;
		}

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
					console.log(message.author.tag + " try to use already registered name " + user.firstName + " " + user.lastName);
					return false;
				}

				return true;
			}

			dmChannel.awaitMessages(filter, {max: 1}).then(async function(collected)
				{
					await module.exports.applyNewMember(data, guildMember, collected.first().content);
					discordUtils.reactRightMessage(collected.first(), confirmMessage);
				});
			}
		);
	},

	applyNewMember : async function(data, guildMember, name)
	{
		let dataGuild = data[guildMember.guild.id];

		let user = module.exports.getUserByName(guildMember.guild.id, name);

		if(user.check == check_registered)
		{
			return false;
		}

		guildMember.roles.remove(dataGuild.invalidRole);
		guildMember.roles.add(dataGuild.validRole);

		try {
			await guildMember.setNickname(user.firstName + " " + user.lastName);
		} catch(err) {
			console.log("Can't change nickname of " + guildMember.user.tag);
		}

		module.exports.registerUser(data, guildMember, user);

		return true;
	},

	removeMember : async function(data, guildMember, changeGuildSettings = false)
	{
		let dataGuild = data[guildMember.guild.id];

		let user = module.exports.getUserById(guildMember.guild.id, guildMember.user.id);

		if(changeGuildSettings)
		{
			guildMember.roles.remove(dataGuild.validRole);
			guildMember.roles.add(dataGuild.invalidRole);

			try {
				await guildMember.setNickname(null);
			} catch(err) {
				console.log("Can't change nickname of " + guildMember.user.tag);
			}
		}

		if(user == null)
		{
			return;
		}

		module.exports.unregisterUser(data, guildMember, user);
	},

	registerUser : function(data, guildMember, user)
	{
		let pseudo = guildMember.user.tag;
		let id = guildMember.user.id;
		createAndSendSheetInformations(data, guildMember, user.checkCell, check_registered);
		createAndSendSheetInformations(data, guildMember, user.pseudoCell, pseudo);
		createAndSendSheetInformations(data, guildMember, user.idCell, id);

		google.sheetData[guildMember.guild.id][user.index].check = check_registered;
		google.sheetData[guildMember.guild.id][user.index].pseudo = pseudo;
		google.sheetData[guildMember.guild.id][user.index].id = id;
	},

	unregisterUser : function(data, guildMember, user)
	{
		createAndSendSheetInformations(data, guildMember, user.checkCell, check_no_registered);

		google.sheetData[guildMember.guild.id][user.index].check = check_no_registered;
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