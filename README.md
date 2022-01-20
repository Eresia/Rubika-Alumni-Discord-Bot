# Discord Bot for Rubika Alumni server

To launch the bot, you need a config.json like this :

```json
{
	"clientId": "your_bot_client_id",
	"token": "your_bot_token"
}
```

And juste start with 

```
node Alumni.js
```

## Commands :

Before use commands, an admin needs to setup bot manager role with :

```
/role-bot-manager <RoleTag>
```

After that, don't forgive to give this role to concerned person (admins need role to);

### List of commands

#### Role commands

For setup basic necessary roles. Syntax :

```
/role <role-command> <RoleTag>
```

- invalid : role for not registered user
- valid : role for registered user
- game : role for game formation
- animation : role for animation formation
- design : role for design formation
- ambassador : role for ambassadors
- bot-event : role for bot event

#### Commands for the user gestion

```
ask-user : send welcome message to the user dm. 
Syntax : /user ask-pm <MemberTag>
```

```
register : Add directly the user without dm.
Syntax : /user register <MemberTag> <FormationName> [NewPseudo]
```

```
remove : Remove the user.
Syntax : /user remove <MemberTag>
```

#### Usefull commands

```
new-city : Add role and channels for a new city + generate commands for autorole bot.
Syntax : /new-city <emoji> <location> <cityName>
```

```
embed : Generate embed message.
Syntax : /embed [title] [description] ([field1-title] [field1-description] [field1-inline]) ([field2-title] [field2-description] [field2-inline])...
```