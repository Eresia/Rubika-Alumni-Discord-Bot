const { SlashCommandBuilder } = require('@discordjs/builders');
const DiscordUtils = require('../scripts/discord-utils.js');

let allCommands = [];

async function setRole(interaction, dataManager, roleDescription, roleName)
{
	dataManager.initGuildData(interaction.guild.id);

	if(!interaction.member.permissions.has("ADMINISTRATOR"))
	{
		if(!DiscordUtils.hasMemberRole(interaction.member, dataManager.getServerData(interaction.guild.id).botManagerRole))
		{
			await interaction.reply({ content: 'You don\'t have permission for this command', ephemeral: true });
			return;
		}
	}

	const role = interaction.options.getRole('role-tag');

	dataManager.getServerData(interaction.guild.id)[roleName] = role.id;
	dataManager.writeInData(interaction.guild.id);

	await interaction.reply('Role ' + DiscordUtils.getRoleStringById(role.id) + ' is now ' + roleDescription);
}

allCommands.push({
	data: new SlashCommandBuilder()
			.setName('role-bot-manager')
			.setDescription('Set bot manager role')
			.addRoleOption(option => 
				option
					.setName('role-tag')
					.setDescription('Tag of the bot manager role')
					.setRequired(true)
			),

	everyonePermission: true,
	needRefreshCommands : true,

	async execute(interaction, dataManager) {
		await setRole(interaction, dataManager, 'bot manager', 'botManagerRole');
	}
});

let allRoleCommand = {
	data: new SlashCommandBuilder()
				.setName("role")
				.setDescription('Set gestion roles'),

	commandRoles : {},

	async execute(interaction, dataManager) {
		let subcommand = interaction.options.getSubcommand();
		await setRole(interaction, dataManager, this.commandRoles[subcommand].description, this.commandRoles[subcommand].name);
	}
}

function addRoleCommand(command, roleDescription, roleName)
{
	allRoleCommand.data.addSubcommand(subcommand =>
		subcommand
			.setName(command)
			.setDescription('Set ' + roleDescription + ' role')
			.addRoleOption(option => 
				option
					.setName('role-tag')
					.setDescription('Tag of the ' + roleDescription + ' role')
					.setRequired(true)
			)
	);

	allRoleCommand.commandRoles[command] = {name: roleName, description: roleDescription};
}

addRoleCommand('game', 'game', 'gameRole');
addRoleCommand('animation', 'animation', 'animationRole');
addRoleCommand('design', 'design', 'designRole');
addRoleCommand('ambassador', 'ambassador', 'ambassadorRole');
addRoleCommand('bot-event', 'bot event', 'botEventRole');

allCommands.push(allRoleCommand);

module.exports = {
	allCommands
};