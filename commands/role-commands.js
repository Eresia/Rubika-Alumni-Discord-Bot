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

function addRoleCommand(command, roleDescription, roleName, needRefreshCommands = false)
{
    allCommands.push({
        data: new SlashCommandBuilder()
                .setName(command)
                .setDescription('Set ' + roleDescription + ' role')
                .addRoleOption(option => 
                    option
                        .setName('role-tag')
                        .setDescription('Tag of the ' + roleDescription + ' role')
                        .setRequired(true)
                ),

        needRefreshCommands : needRefreshCommands,

        async execute(interaction, dataManager) {
            await setRole(interaction, dataManager, roleDescription, roleName);
        }
    });
}

addRoleCommand('role-bot-manager', 'bot manager', 'botManagerRole', true);
addRoleCommand('role-invalid', 'invalid', 'invalidRole');
addRoleCommand('role-valid', 'valid', 'validRole');
addRoleCommand('role-game', 'game', 'gameRole');
addRoleCommand('role-animation', 'animation', 'animationRole');
addRoleCommand('role-design', 'design', 'designRole');
addRoleCommand('role-ambassador', 'ambassador', 'ambassadorRole');
addRoleCommand('role-bot-event', 'bot-event', 'botEventRole');

module.exports = {
    allCommands
};