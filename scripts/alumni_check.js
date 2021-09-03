const discordUtils = require('./discordUtils.js');
const google = require('./google.js');

const chooseLanguageFrench = "Pouvez vous sélectionner le drapeau correspondant à la langue que vous souhaitez utiliser ?";

const chooseLanguageEnglish = "Can you click on the flag of the language you want to use?";


const askMessageFrench = "\\_\\_\\_\\_\\_\\_\\_\\_\\_\\_\\_\\_\\_\\_\\_\\_\\_\\_\\_\\_\\_\\_\\_\\_\\_\\_\\_\\_\\_\\_\\_\\_\\_\\_\\_\\_\\_\\_\\_\\_\\_\\_\\_\\_\\_\\_\\_\\_\\_\\_\\_\\_\\_\\_\n" 
	+ "\u200B\n" 
	+ ":flag_fr: **Version Française sélectionnée :**\n\n" 
	+ "Bonjour ! Pouvez vous m'écrire un message de la forme \"Prénom Nom\" pour que je puisse vous enregistrer dans le serveur Rubika Alumni ?";

const askMessageEnglish = "\\_\\_\\_\\_\\_\\_\\_\\_\\_\\_\\_\\_\\_\\_\\_\\_\\_\\_\\_\\_\\_\\_\\_\\_\\_\\_\\_\\_\\_\\_\\_\\_\\_\\_\\_\\_\\_\\_\\_\\_\\_\\_\\_\\_\\_\\_\\_\\_\\_\\_\\_\\_\\_\\_\n" 
	+ "\u200B\n" 
	+ ":flag_gb: **English version selected :**\n\n" 
	+ "Hello ! Can you write a message in the format \"FirstName LastName\" to be registered in Rubika Alumni server?";


const birthdayMessageFrench = "Enchanté $$$. Je vais avoir besoin de quelques informations pour confirmer votre identité. Pouvez vous m'indiquer votre date de naissance sous la forme \"JJ/MM/AAAA\" ? (Ex : 31/01/1970)";

const birthdayMessageEnglish = "Nice to meet you $$$. I will need some informations to confirm your identity. Can you give me your date of birth in the format \"DD/MM/YYYY\"? (Ex : 31/01/1970)";


const promotionMessageFrench = "Merci beaucoup. Une dernière petite question, pouvez vous m'indiquer de quelle formation êtes vous, suivi de votre année de sortie de l'école ?\n\n" 
	+ "Pour rappel :\n" 
	+ "- SIG => GAME\n" 
	+ "- SIC => COM / ANIM\n" 
	+ "- ISD => Institut Supérieur du Design\n\n" 
	+ "Ex : \"SIG 2019\"";

const promotionMessageEnglish = "Thank you. Last question, can you give me your cursus and your graduation year?\n\n" 
	+ "As a reminder:\n" 
	+ "- SIG => GAME\n" 
	+ "- SIC => COM / ANIM\n" 
	+ "- ISD => Design\n\n" 
	+ "Ex : \"SIG 2019\"";


const confirmMessageFrench = "**Vous avez bien été enregistré dans le serveur !**\n\n" 
	+ "Les channels les plus importants :\n" 
	+ "<#852099541079556096> :  pour rejoindre une ou plusieurs villes et participer à ses événements\n" 
	+ "<#875411952313188373> : les annonces qui concernent tout le monde\n" 
	+ "<#875411975256018954> : pour proposer de nouvelles villes\n" 
	+ "<#881949055150866494> : pour toutes les suggestions et améliorations\n\n" 
	+ "Bonne journée et bienvenue !";

const confirmMessageEnglish = "**You are sucessfully registered!**\n\n" 
	+ "Most important channels:\n" 
	+ "<#852099541079556096>: to join one or several cities and join their events\n" 
	+ "<#875411952313188373>: the general announcement for everyone\n" 
	+ "<#875411975256018954>: to ask for new cities\n" 
	+ "<#881949055150866494>: for all ideas and suggestions\n\n" 
	+ "Have a nice day and welcome!";


const notFoundMessageFrench = "Je suis désolé, mais je n'arrive pas à trouver le nom $$$ dans la base de donnée. Pouvez vous vérifier qu'il n'y avait pas d'erreur de frappe et réessayer ? Si le soucis persiste, n'hésitez pas à envoyer un message aux modérateurs pour qu'ils puissent vous aider.";

const notFoundMessageEnglish = "I'm sorry but I couldn't find the name $$$. Can you check for any typing mistakes and try again? If the problem persist, please contact a moderator to have help.";


const badBirthdayMessageFrench = "Je suis désolé mais cela ne correspond pas. Pouvez vous réessayer (attention à bien faire jour/mois/année) ? Si le soucis persiste, n'hésitez pas à envoyer un message aux modérateurs pour qu'ils puissent vous aider.";

const badBirthdayMessageEnglish = "I'm sorry but it does not work. Can you try again (be carreful to type Day/Month/Year)? If the problem persist, please contact a moderator to have help.";


const badInformationsMessageFrench = "Je suis désolé, mais les informations ne correspondent pas. Pouvez vous réessayer ? Si le soucis persiste, n'hésitez pas à envoyer un message aux modérateurs pour qu'ils puissent vous aider.";

const badInformationsMessageEnglish = "I'm sorry but it does not work. Can you try again? If the problem persist, please contact a moderator to have help.";


const alreadyRegisteredMessageFrench = "Je suis désolé, mais le nom que vous avez saisi est déjà enregistré pour le serveur. Si c'est bien le votre, merci de contacter un modérateur pour qu'ils puissent vérifier le problème avec vous.";

const alreadyRegisteredMessageEnglish = "I'm sorry but the name is already registered on the server. If it is really yours, please contact a moderator so that we can help you.";


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
		let lowerName = name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, "");

		if(!(serverId in google.sheetData) || (google.sheetData[serverId] == null))
		{
			console.log("No access to google user data");
			return null;
		}

		for(let i = 0; i < google.sheetData[serverId].length; i++)
		{
			let lowerSheetName1 = google.sheetData[serverId][i].firstName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, "");
			let lowerSheetName2 = google.sheetData[serverId][i].lastName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, "");

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
			if(!firstMessage)
			{
				dmChannel.awaitMessages(m => true, {max: 1}).then(m => {this.askNewMember(data, guildMember, true)});
				return;
			}

			dmChannel.send(createBilingueMessage(chooseLanguageFrench, chooseLanguageEnglish)).then(languageMessage =>
			{
				languageMessage.react('🇫🇷');
				languageMessage.react('🇬🇧');

				let filter = function(reaction, user)
				{
					return !user.bot && (reaction.emoji.name === '🇫🇷' || reaction.emoji.name === '🇬🇧');
				}

				languageMessage.awaitReactions(filter, {max : 1}).then(async function(collected)
				{
					let isFrench = collected.first().emoji.name === '🇫🇷';

					dmChannel.send(createLanguageMessage(askMessageFrench, askMessageEnglish, isFrench));

					let filter = function(message)
					{
						if(message.author.bot)
						{
							return false;
						}

						let user = module.exports.getUserByName(guildMember.guild.id, message.content);
						if(user == null)
						{
							dmChannel.send(createLanguageMessage(notFoundMessageFrench.replace("$$$", message.content), notFoundMessageEnglish.replace("$$$", message.content), isFrench));
							return false;
						}

						if(user.check == check_registered)
						{
							dmChannel.send(createLanguageMessage(alreadyRegisteredMessageFrench, alreadyRegisteredMessageEnglish), isFrench);
							console.log(message.author.tag + " try to use already registered name " + upperCaseFirstLetter(user.firstName)  + " " + upperCaseFirstLetter(user.lastName));
							return false;
						}

						return true;
					}

					dmChannel.awaitMessages(filter, {max: 1}).then(async function(collected)
					{
						let user = module.exports.getUserByName(guildMember.guild.id, collected.first().content);

						let name = collected.first().content;
						discordUtils.reactRightMessage(collected.first(), createLanguageMessage(birthdayMessageFrench.replace("$$$", upperCaseFirstLetter(user.firstName)), birthdayMessageEnglish.replace("$$$", upperCaseFirstLetter(user.firstName)), isFrench));

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
									dmChannel.send(createLanguageMessage(badBirthdayMessageFrench, badBirthdayMessageEnglish, isFrench));
									return false;
								}
							}
							else
							{
								let parts = message.content.split('/');

								if(parts.length != 3)
								{
									dmChannel.send(createLanguageMessage(badBirthdayMessageFrench, badBirthdayMessageEnglish, isFrench));
									return false;
								}

								for(let i = 0; i < 3; i++)
								{
									parts[i] = parseInt(parts[i]);
									if(isNaN(parts[i]))
									{
										dmChannel.send(createLanguageMessage(badBirthdayMessageFrench, badBirthdayMessageEnglish, isFrench));
										return false;
									}
								}

								if(parts[0] < 1 || parts[0] > 31)
								{
									dmChannel.send(createLanguageMessage(badBirthdayMessageFrench, badBirthdayMessageEnglish, isFrench));
									return false;
								}

								if(parts[1] < 1 || parts[1] > 12)
								{
									dmChannel.send(createLanguageMessage(badBirthdayMessageFrench, badBirthdayMessageEnglish, isFrench));
									return false;
								}

								if(parts[2] < 1950 || parts[2] > (new Date()).getFullYear() - 15)
								{
									dmChannel.send(createLanguageMessage(badBirthdayMessageFrench, badBirthdayMessageEnglish, isFrench));
									return false;
								}
							}

							return true;
						}

						dmChannel.awaitMessages(filter, {max: 1}).then(async function(collected)
						{
							let birthday = collected.first().content;
							discordUtils.reactRightMessage(collected.first(), createLanguageMessage(promotionMessageFrench, promotionMessageEnglish, isFrench));

							filter = function(message)
							{
								if(message.author.bot)
								{
									return false;
								}

								let parts = message.content.split(' ');

								if(parts.length != 2)
								{
									dmChannel.send(createLanguageMessage(badInformationsMessageFrench, badInformationsMessageEnglish, isFrench));
									return false;
								}

								if((typeof user.formation !== 'undefined') && user.formation.length > 0)
								{
									if(user.formation != parts[0].toUpperCase())
									{
										dmChannel.send(createLanguageMessage(badInformationsMessageFrench, badInformationsMessageEnglish, isFrench));
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
											dmChannel.send(createLanguageMessage(badInformationsMessageFrench, badInformationsMessageEnglish, isFrench));
											return false;
									}
								}

								if((typeof user.formation !== 'undefined') && user.promotion.length > 0)
								{
									if(user.promotion != parts[1])
									{
										dmChannel.send(createLanguageMessage(badInformationsMessageFrench, badInformationsMessageEnglish, isFrench));
										return false;
									}
								}
								else
								{
									let value = parseInt(parts[1]);
									if(isNaN(value))
									{
										dmChannel.send(createLanguageMessage(badInformationsMessageFrench, badInformationsMessageEnglish, isFrench));
										return false;
									}

									if(value < 1985 || value > (new Date()).getFullYear() + 6)
									{
										dmChannel.send(createLanguageMessage(badInformationsMessageFrench, badInformationsMessageEnglish, isFrench));
										return false;
									}
								}

								return true;
							}

							dmChannel.awaitMessages(filter, {max: 1}).then(async function(collected)
							{
								let parts = collected.first().content.split(" ");
								discordUtils.reactRightMessage(collected.first(), createLanguageMessage(confirmMessageFrench, confirmMessageEnglish, isFrench));

								await module.exports.applyNewMember(data, guildMember, name, birthday, parts[0].toUpperCase(), parts[1]);
							});

							
						});

							
					});
				});
			});
		});
	},

	applyNewMember : function(data, guildMember, name, birthday = null, formation = null, promotion = null)
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

		guildMember.roles.remove(dataGuild.invalidRole).then(function()
		{ 
			guildMember.roles.add(dataGuild.validRole).then(async function()
			{ 
				let promise = null;

				if(typeof user.formation !== 'undefined')
				{
					switch(user.formation)
					{
						case "SIG":
							promise = guildMember.roles.add(dataGuild.gameRole);
							break;

						case "SIC":
							promise = guildMember.roles.add(dataGuild.animationRole);
							break;

						case "ISD":
							promise = guildMember.roles.add(dataGuild.designRole);
							break;
					}
				}

				if(promise == null)
				{
					try {
						await guildMember.setNickname(upperCaseFirstLetter(user.firstName)  + " " + upperCaseFirstLetter(user.lastName));
					} catch(err) {
						console.log("Can't change nickname of " + guildMember.user.tag);
					}
				}
				else
				{
					promise.then(async function()
					{
						try {
							await guildMember.setNickname(upperCaseFirstLetter(user.firstName)  + " " + upperCaseFirstLetter(user.lastName));
						} catch(err) {
							console.log("Can't change nickname of " + guildMember.user.tag);
						}
					});
				}
			});
		});

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

let upperCaseFirstLetter = function(string) {
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
}

let createLanguageMessage = function(frenchMessage, englishMessage, isFrench)
{
	return isFrench ? frenchMessage : englishMessage;
}

let createBilingueMessage = function(frenchMessage, englishMessage)
{
	return ":flag_fr: **Version Française :**\n\n" + frenchMessage + "\n\n\n:flag_gb: **English Version:**\n\n" + englishMessage;
}