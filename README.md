# Discord Bot for Rubika Alumni server

## Configuration files:
To launch the bot, you need three configuration files:

### config.json
```json
{
	"clientId": "your_bot_client_id",
	"token": "your_bot_token"
}
```

### credentials.json
Get the file given by Google Cloud console for your application

### mail_user.json ([Tutorial](https://dev.to/chandrapantachhetri/sending-emails-securely-using-node-js-nodemailer-smtp-gmail-and-oauth2-g3a))
```json
{
	"user": "email_to_use",
	"token": "refresh_token_given_by_oauth_2.0_playground",
	"client_id": "client_id_given_by_google_cloud_console",
	"client_secret": "client_secret_given_by_google_cloud_console"
}
```

## Launch Bot
Just start with 

```bash
node Alumni.js
```

## Commands:

Before use commands, an admin needs to setup bot manager role with:

```
/role-bot-manager <RoleTag>
```

After that, don't forgive to give this role to concerned person (admins need role to);

### List of commands

### Sheet information commands

To set the sheet informations use

```
/set-sheet-informations <link> <page> <range-min> <range-max>
```

- link: The unique link of google sheet (by example: 1h0RfDCZzkDED0mIHt9b81x5BpoTMTjYc9xwaF4jtoPo if the origine link is https://docs.google.com/spreadsheets/d/1h0RfDCZzkDED0mIHt9b81x5BpoTMTjYc9xwaF4jtoPo)
- page: The name of the page to use
- range-min: The min range to use (ex: A1)
- range-max: The max range to use (ex: S2000)

#### Role commands

For setup basic necessary roles. Syntax:

```
/role <role-command> <RoleTag>
```

- game: role for game formation
- animation: role for animation formation
- design: role for design formation
- ambassador: role for ambassadors
- bot-event: role for bot event

#### Channel commands

For setup basic necessary roles. Syntax:

```
/channel <role-command> <ChannelTag>
```

- valid-member: admin channel for member validation infos
- invite: channel for invites

#### Usefull commands

```
new-city: Add role and channels for a new city + generate commands for autorole bot.
Syntax: /new-city <emoji> <location> <city-name>
```

```
embed: Generate embed message.
Syntax: /embed [title] [description] ([field1-title] [field1-description] [field1-inline]) ([field2-title] [field2-description] [field2-inline])...
```

```
generatelink: Generate Unique Discord Link for channel set.
Syntax: /generatelink <channel>
```