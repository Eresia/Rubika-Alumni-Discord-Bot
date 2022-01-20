const { SlashCommandBuilder } = require('@discordjs/builders');
const DiscordUtils = require('../scripts/discord-utils.js');
const AlumniCheck = require('../scripts/alumni-check.js');

let allCommands = [];

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