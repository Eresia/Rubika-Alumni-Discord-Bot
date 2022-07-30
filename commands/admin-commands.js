const { SlashCommandBuilder } = require('@discordjs/builders');
const DiscordUtils = require('../scripts/discord-utils.js');

let allCommands = [];

allCommands.push({
    data: new SlashCommandBuilder()
			.setName('generate-link')
			.setDescription('Add new unique invite link'),
	async execute(interaction, dataManager) 
	{
		let guildData = dataManager.getServerData(interaction.guild.id);

		let channel = DiscordUtils.getChannelById(interaction.client, guildData.inviteChannel);

		if(channel == null)
		{
			await interaction.reply({ content: 'Invation channel not set, ask to bot administrator', ephemeral: true });
			return;
		}

		let invite = await channel.createInvite({maxUses: 1, unique: true, maxAge: 0});
		await interaction.reply("Invation link : https://discord.gg/" + invite);
	}
});

allCommands.push({
    data: new SlashCommandBuilder()
			.setName('set-sheet-informations')
			.setDescription('Set Google Sheet Informations for user data')
			.addStringOption(option =>
				option
					.setName("link")
					.setDescription("Google Sheet specific link (ex : \"1h0RfDCZzkDED0mIHt9b81x5BpoTMTjYc9xwaF4jtoPo\")")
					.setRequired(true)
				)
			.addStringOption(option =>
				option
					.setName("page")
					.setDescription("Page name of Google Sheet (ex : \"Answer Page\")")
					.setRequired(true)
				)
			.addIntegerOption(option =>
				option
					.setName("page-id")
					.setDescription("Page id of Google Sheet (ex : \"1234567890\")")
					.setRequired(true)
				)
			.addStringOption(option =>
				option
					.setName("range-min")
					.setDescription("Range min of page to use (ex : A1)")
					.setRequired(true)
				)
			.addStringOption(option =>
				option
					.setName("range-max")
					.setDescription("Range min of page to use (ex : S2000)")
					.setRequired(true)
				),

	async execute(interaction, dataManager) 
	{
		if(!interaction.member.permissions.has("ADMINISTRATOR"))
		{
			if(!DiscordUtils.hasMemberRole(interaction.member, dataManager.getServerData(interaction.guild.id).botManagerRole))
			{
				await interaction.reply({ content: 'You don\'t have permission for this command', ephemeral: true });
				return;
			}
		}
		
		let link = interaction.options.getString('link');
		let page = interaction.options.getString('page');
		let pageId = interaction.options.getInteger('page-id');
		let rangeMin = interaction.options.getString('range-min');
		let rangeMax = interaction.options.getString('range-max');

		let guildData = dataManager.getServerData(interaction.guild.id);

		guildData.sheetInformations.link = link;
		guildData.sheetInformations.page = page;
		guildData.sheetInformations.pageId = pageId;
		guildData.sheetInformations.rangeMin = rangeMin;
		guildData.sheetInformations.rangeMax = rangeMax;
		dataManager.writeInData(interaction.guild.id);

		dataManager.AlumniCheck.initUserData(dataManager, interaction.guild);

		interaction.reply("Google Sheet information set");
	}
});

module.exports = {
	allCommands
};