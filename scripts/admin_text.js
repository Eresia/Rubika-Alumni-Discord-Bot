const Discord = require('discord.js');
const discordUtils = require('./discordUtils.js');

module.exports = {
    displayDiscordMessages(bot)
    {
        //writeMessages(bot);
        //editMessages(bot);
    }
}

let writeMessages = function(bot, )
{
    discordUtils.logMessage(bot, '852099574050979870', ruleMessage());
    discordUtils.logMessage(bot, '852099574050979870', roleMessage(bot));
}

let editMessages = function(bot)
{
    discordUtils.getMessageById(bot, '852099574050979870', '859808840358559754').then(message => message.edit(ruleMessage()));
    discordUtils.getMessageById(bot, '852099574050979870', '878187153253883954').then(message => message.edit(roleMessage(bot)));
}

let ruleMessage = function()
{
    let embed = new Discord.MessageEmbed();
    embed.setTitle("Règles du serveur");

    embed.addField("\u200B", "```css\n1 - Prénom / Nom en pseudo.```");
    embed.addField("\u200B", "```css\n2 - Pas de contenu NSFW / illégal (message/vocal/pseudo/photo de profil).```");
    embed.addField("\u200B", "```css\n3 - Aucune attaque personnelle / harcèlement / sexisme / racisme / discours de haine / langage offensant / discussions religieuses - politiques.```");
    embed.addField("\u200B", "```css\n4 - Pas de spam.```");
    embed.addField("\u200B", "```css\n5 - Pas de publicité sans permission.```");

    return embed;
}

let roleMessage = function(bot)
{
    let embed = new Discord.MessageEmbed();
    embed.setTitle("Rôles du serveur");

    embed.addField("\u200B", discordUtils.getRoleStringById('852540281785810984') + " : Gère l'aspect technique du serveur");
    embed.addField("\u200B", discordUtils.getRoleStringById('852540315398963200') + " : En charge du bon déroulé des discussions et du respect des règles");
    embed.addField("\u200B", discordUtils.getRoleStringById('859129781131411497') + " : Responsable d'une ville, il gère les events de sa ville et l'accueil des nouveaux");
    embed.addField("\u200B", discordUtils.getRoleStringById('859126261230338098') + " : Ancien élève de Rubika, tous les membres du discord !");

    return embed;
}