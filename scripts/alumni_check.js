const discordUtils = require('./discordUtils.js');
const google = require('./google.js');

const askMessage = "Bonjour. Pouvez vous m'écrire un message de la forme \"Prénom Nom\" pour que je puisse vous enregistrer dans le serveur Rubika Alumni ?";
const birthdayMessage = "Enchanté $$$. Je vais avoir besoin de quelques informations pour confirmer votre identité. Pouvez vous m'indiquer votre date de naissance sous la forme \"JJ/MM/AA\" ? (Ex : 31/01/1970)";
const promotionMessage = "Merci beaucoup. Une dernière petite question, pouvez vous m'indiquez de quelle promotion êtes vous suivi de votre année de sortie de l'école ?\n\nPour rappel :\n- SIG => Supinfo Game\n- SIC => Supinfo Com\n- ISD => Institut Supérieur du Design\n\nEx : \"SIG 2019\"";
const confirmMessage = "Vous avez bien été enregistré dans le serveur, vous devriez avoir maintenant accès à toutes les informations ! Passez une bonne journée.";
const notFoundMessage = "Je suis désolé, mais je n'arrive pas à trouver le nom $$$ dans la base de donnée. Pouvez vous vérifier qu'il n'y avait pas d'erreur de frappe (attention aux accents !) et réessayer ? Si le soucis persiste, n'hésitez pas à envoyer un message aux modérateurs pour qu'ils puissent vous aider.";
const badBirthdayMessage = "Je suis désolé mais cela ne correspond pas. Pouvez vous réessayer (attention à bien faire jour/mois/année) ? Si le soucis persiste, n'hésitez pas à envoyer un message aux modérateurs pour qu'ils puissent vous aider.";
const badInformationsMessage = "Je suis désolé, mais les informations ne correspondent pas. Pouvez vous réessayer ? Si le soucis persiste, n'hésitez pas à envoyer un message aux modérateurs pour qu'ils puissent vous aider.";
const alreadyRegisteredMessage = "Je suis désolé, mais le nom que vous avez saisi est déjà enregistré pour le serveur. Si c'est bien le votre, merci de contacter les administrateurs pour qu'ils puissent vérifier le problème avec vous.";

const check_no_registered = "Non";
const check_registered = "Oui";

const first_name_cell = "Prénom";
const last_name_cell = "Nom";
const birthday_cell = "Date de naissance";
const formation_cell = "Formation";
const campus_cell = "Campus";
const promotion_cell = "Promo";
const alive_cell = "Vivant";
const check_cell = "Enregistré.e";
const pseudo_cell = "Pseudo Discord";
const id_cell = "Id Discord";

let getInfoData = function()
{
	let data = {};

	data.firstName = first_name_cell;
	data.lastName = last_name_cell;
	data.birthday = birthday_cell;
	data.formation = formation_cell;
	data.campus = campus_cell;
	data.promotion = promotion_cell;
	data.alive = alive_cell;

	data.check = check_cell;
	data.pseudo = pseudo_cell;
	data.id = id_cell;

	return data;
}

module.exports = {
	updateSheet : function(data, serverId)
	{
		let info = {};
		info.serverId = serverId;
		info.link = data[serverId].link;
		info.page = data[serverId].page;
		info.range = data[serverId].range;

		info.data = getInfoData();

		google.updateSheetData(info);
	},

	fusionSheet : function(link, from, to, range)
	{
		let info = {};
		info.link = link;
		info.from = from;
		info.to = to;
		info.range = range;

		info.data = getInfoData();

		google.fusionSheetData(info);
	},

	getUserByName : function(serverId, name)
	{
		let lowerName = name.toLowerCase();

		if(!(serverId in google.sheetData) || (google.sheetData[serverId] == null))
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
		if(!(serverId in google.sheetData) || (google.sheetData[serverId] == null))
		{
			return null;
		}

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
					let user = module.exports.getUserByName(guildMember.guild.id, collected.first().content);

					let name = collected.first().content;
					discordUtils.reactRightMessage(collected.first(), birthdayMessage.replace("$$$", user.firstName));

					filter = function(message)
					{
						if(message.author.bot)
						{
							return false;
						}

						if(user.birthday.length > 0)
						{
							if(user.birthday != message.content)
							{
								dmChannel.send(badBirthdayMessage);
								return false;
							}
						}
						else
						{
							let parts = message.content.split('/');

							if(parts.length != 3)
							{
								dmChannel.send(badBirthdayMessage);
								return false;
							}

							for(let i = 0; i < 3; i++)
							{
								parts[i] = parseInt(parts[i]);
								if(isNaN(parts[i]))
								{
									dmChannel.send(badBirthdayMessage);
									return false;
								}
							}

							if(parts[0] < 1 || parts[0] > 31)
							{
								dmChannel.send(badBirthdayMessage);
								return false;
							}

							if(parts[1] < 1 || parts[1] > 12)
							{
								dmChannel.send(badBirthdayMessage);
								return false;
							}

							if(parts[2] < 1950 || parts[2] > (new Date()).getFullYear() - 15)
							{
								dmChannel.send(badBirthdayMessage);
								return false;
							}
						}

						return true;
					}

					dmChannel.awaitMessages(filter, {max: 1}).then(async function(collected)
					{
						let birthday = collected.first().content;
						discordUtils.reactRightMessage(collected.first(), promotionMessage);

						filter = function(message)
						{
							if(message.author.bot)
							{
								return false;
							}

							let parts = message.content.split(' ');

							if(parts.length != 2)
							{
								dmChannel.send(badInformationsMessage);
								return false;
							}

							if((typeof user.formation !== 'undefined') && user.formation.length > 0)
							{
								if(user.formation != parts[0].toUpperCase())
								{
									dmChannel.send(badInformationsMessage);
									return false;
								}
							}
							else
							{
								switch(parts[0].toUpperCase())
								{
									case "SIG":
									case "SIC":
									case "ISD":
										break;

									default:
										dmChannel.send(badInformationsMessage);
										return false;
								}
							}

							if((typeof user.formation !== 'undefined') && user.promotion.length > 0)
							{
								if(user.promotion != parts[1])
								{
									dmChannel.send(badInformationsMessage);
									return false;
								}
							}
							else
							{
								let value = parseInt(parts[1]);
								if(isNaN(value))
								{
									dmChannel.send(badInformationsMessage);
									return false;
								}

								if(value < 1985 || value > (new Date()).getFullYear() + 6)
								{
									dmChannel.send(badBirthdayMessage);
									return false;
								}
							}

							return true;
						}

						dmChannel.awaitMessages(filter, {max: 1}).then(async function(collected)
						{
							let parts = collected.first().content.split(" ");
							discordUtils.reactRightMessage(collected.first(), confirmMessage);

							await module.exports.applyNewMember(data, guildMember, name, birthday, parts[0].toUpperCase(), parts[1]);
						});

						
					});

					
				});
			}
		);
	},

	applyNewMember : async function(data, guildMember, name, birthday = null, formation = null, promotion = null)
	{
		let dataGuild = data[guildMember.guild.id];

		let user = module.exports.getUserByName(guildMember.guild.id, name);

		if(user.check == check_registered)
		{
			return false;
		}

		if(((typeof user.birthday === 'undefined') || (user.birthday.length == 0)) && (birthday != null))
		{
			user.birthday = birthday;
		}

		if(((typeof user.formation === 'undefined') || (user.formation.length == 0)) && (formation != null))
		{
			user.formation = formation;
		}

		if(((typeof user.promotion === 'undefined') || (user.promotion.length == 0)) && (promotion != null))
		{
			user.promotion = promotion;
		}

		guildMember.roles.remove(dataGuild.invalidRole);
		guildMember.roles.add(dataGuild.validRole);

		if(typeof user.formation !== 'undefined')
		{
			switch(user.formation)
			{
				case "SIG":
					guildMember.roles.add(dataGuild.gameRole);
					break;

				case "SIC":
					guildMember.roles.add(dataGuild.animationRole);
					break;

				case "ISD":
					guildMember.roles.add(dataGuild.designRole);
					break;
			}
		}		

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
			guildMember.roles.remove(dataGuild.gameRole);
			guildMember.roles.remove(dataGuild.animationRole);
			guildMember.roles.remove(dataGuild.designRole);
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
		user.check = check_registered;
		user.pseudo = guildMember.user.tag;
		user.id = guildMember.user.id;

		let keys = Object.keys(user.cells);

		for(let i = 0; i < keys.length; i++)
		{
			let key = keys[i];
			if(typeof user[key] !== 'undefined')
			{
				createAndSendSheetInformations(data, guildMember, user.cells[key], user[key]);
				google.sheetData[guildMember.guild.id][user.index][key] = user[key];
			}
		}
	},

	unregisterUser : function(data, guildMember, user)
	{
		createAndSendSheetInformations(data, guildMember, user.cells.check, check_no_registered);

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