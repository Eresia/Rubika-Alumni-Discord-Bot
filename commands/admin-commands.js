const { SlashCommandBuilder } = require('@discordjs/builders');
const DiscordUtils = require('../scripts/discord-utils.js');
const AlumniCheck = require('../scripts/alumni-check.js');

let allCommands = [];

async function registerUser(interaction, dataManager)
{
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

async function removeUser(interaction, dataManager)
{
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

const userFunctions = 
{
	'register': registerUser,
	'remove': removeUser
}

allCommands.push({
	data: new SlashCommandBuilder()
			.setName('user')
			.setDescription('User gestion')
			.addSubcommand(subcommand =>
				subcommand
					.setName('register')
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
				)
			)
			.addSubcommand(subcommand =>
				subcommand
					.setName('remove')
					.setDescription('Remove user informations')
					.addUserOption(option =>
						option
							.setName('user')
							.setDescription('The user')
							.setRequired(true)
					)
			),

	async execute(interaction, dataManager) 
	{
		let subcommand = interaction.options.getSubcommand();
		userFunctions[subcommand](interaction, dataManager);
	}
});

allCommands.push({
    data: new SlashCommandBuilder()
			.setName('generatelink')
			.setDescription('Add new unique invite link')
			.addChannelOption(option =>
				option
					.setName("channel")
					.setDescription("Channel to invite")
					.setRequired(true)
				),
	async execute(interaction, dataManager) 
	{
		let channel = interaction.options.getChannel('channel');
		let invite = await channel.createInvite({maxUses: 1, unique: true});
		await interaction.reply("Invation link : https://discord.gg/" + invite);
	}
});

module.exports = {
	allCommands
};