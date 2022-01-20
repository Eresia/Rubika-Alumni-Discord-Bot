async function removeAllCommand(commandListObject)
{
    await commandListObject.fetch();
    commandListObject.cache.forEach(command =>{
        command.delete();
    });
}

async function removeAllGlobalCommands(client)
{
    await removeAllCommand(client.application.commands);
}

async function removeAllGuildCommandsFromGuildId(client, guildId)
{
    await client.guilds.fetch();

    for(let i = 0; i < client.guilds.cache.size; i++)
    {
        let guild = client.guilds.cache.at(i);

        if(guild.id == guildId)
        {
            await removeAllGuildCommands(guild);
        }
    }
}

async function removeAllGuildCommands(guild)
{
    await removeAllCommand(guild.commands);
}

async function removeAllCommandFromAllGuilds(client)
{
    await client.guilds.fetch();

    for(let i = 0; i < client.guilds.cache.size; i++)
    {
        let guild = client.guilds.cache.at(i);
        await removeAllGuildCommands(guild);
    }
}

async function removeSingleCommand(commandListObject, commandName)
{
    await commandListObject.fetch();
    
    commandListObject.cache.find(c => c.name == commandName).delete();
}

async function removeSingleGlobalCommand(client, commandName)
{
	await removeSingleCommand(client.application.commands, commandName);
}

async function removeSingleGuildCommand(guild, commandName)
{
	await removeSingleCommand(guild.commands, commandName);
}

async function removeSingleCommandFromAllGuilds(client, commandName)
{
    await client.guilds.fetch();

    for(let i = 0; i < client.guilds.cache.size; i++)
    {
        let guild = client.guilds.cache.at(i);
        await removeSingleGuildCommand(guild, commandName);
    }
}

module.exports = {
    removeAllGlobalCommands,
    removeAllGuildCommands,
    removeAllGuildCommandsFromGuildId,
    removeAllCommandFromAllGuilds,
    removeSingleGlobalCommand,
    removeSingleGuildCommand,
    removeSingleCommandFromAllGuilds
}