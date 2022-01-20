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
/<role-command> <RoleTag>
```

- role-invalid : role for not registered user
- role-valid : role for registered user
- role-game : role for game formation
- role-animation : role for animation formation
- role-design : role for design formation
- role-ambassador : role for ambassadors
- role-bot-event : role for bot event

#### Commands for the member gestion

- ask-user-pm : send welcome message to the user dm. 
Syntax :
```
/ask-user-pm <MemberTag>
```

- register-user : Add directly the member without dm.
Syntax :
```
/register-user <MemberTag> <FormationName>
```

- remove-user : Remove the member.
Syntax :
```
/remove-user <MemberTag>
```

#### Usefull commands

- new-city : Add role and channels for a new city + generate commands for autorole bot. Use : /new-city <emoji> <location> <cityName>
- embed : Generate embed message. *Not implemented yet*