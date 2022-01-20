const { SlashCommandBuilder } = require('@discordjs/builders');
const DiscordUtils = require('../scripts/discord-utils.js');

let allCommands = [];

// allCommands.push({
//     data: new SlashCommandBuilder()
//             .setName('embed')
//             .setDescription('Add embed message'),
//     async execute(interaction, dataManager) {
//         dataManager.initGuildData(interaction.guild.id);

//         if(!interaction.member.permissions.has("ADMINISTRATOR"))
//         {
//             if(!DiscordUtils.hasMemberRole(interaction.member, dataManager.getServerData(interaction.guild.id).botManagerRole))
//             {
//                 await interaction.reply('You don\'t have permission for this command');
//                 return;
//             }
//         }

        
//     }
// });

module.exports = {
    allCommands
};