const fs = require('fs');
const readline = require('readline');
const {google} = require('googleapis');

const sheetKeys = 
{
	VERIFIED : 0,
	STATUS : 1,
	NAME : 3,
	FIRSTNAME : 4,
	BIRTHDAY : 5,
	MAIL : 6,
	SCHOOL : 7,
	SCHOOL_YEAR : 8,
	LANGAGE : 12,
	SEND : 17,
	INVITE : 18,
	RESUME_MESSAGE : 19
}

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = 'sheet.json';

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 * @param {Object} callbackParameters callbackParameters
 */
async function authorize(credentials, callback, callbackParameters) 
{
	const {client_secret, client_id, redirect_uris} = credentials.installed;
	const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

	try
	{
		let token = await fs.promises.readFile(TOKEN_PATH);
		oAuth2Client.setCredentials(JSON.parse(token));
		return await callback(oAuth2Client, callbackParameters);
	}
	catch
	{
		return await getNewToken(oAuth2Client, callback, callbackParameters);
	}
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 * @param {Object} callbackParameters callbackParameters
 */
async function getNewToken(oAuth2Client, callback, callbackParameters) 
{
	const authUrl = oAuth2Client.generateAuthUrl({
		access_type: 'offline',
		scope: SCOPES,
	});

	console.log('Authorize this app by visiting this url:', authUrl);
	
	const rl = readline.createInterface(
	{
		input: process.stdin,
		output: process.stdout,
	});

	let promise = new Promise(function(resolve)
	{
		rl.question('Enter the code from that page here: ', function(code)
		{
			rl.close();
			oAuth2Client.getToken(code, async function(err, token)
			{
					if (err)
					{
						console.error('Error while trying to retrieve access token', err);
						resolve(null);
						return;
					}

					oAuth2Client.setCredentials(token);
					// Store the token to disk for later program executions
					fs.writeFile(TOKEN_PATH, JSON.stringify(token), function(err) 
					{
						if (err) 
							return console.error(err);

						console.log('Token stored to', TOKEN_PATH);
					});

					resolve(await callback(oAuth2Client, callbackParameters));
			});
		});
	});

	return await promise;
}

async function getSheetData(auth, parameters)
{
	let sheets = google.sheets({version: 'v4', auth});
	let promise = new Promise(function(resolve)
	{
		sheets.spreadsheets.values.get(
		{
			spreadsheetId: parameters.sheet.link,
			range: (parameters.sheet.page + '!' + parameters.sheet.rangeMin + ':' + parameters.sheet.rangeMax),
		}, 
		function(err, res)
		{
			if(err)
			{
				console.log('The API returned an error: ' + err);
				resolve(null);
				return;
			}

			resolve(res.data.values);
		});
	})

	return await promise;
}

function updateSheetData(auth, parameters) 
{
	let sheets = google.sheets({version: 'v4', auth});
	sheets.spreadsheets.values.update(
	{
		spreadsheetId: parameters.sheet.link,
		range: (parameters.sheet.page + '!' + parameters.sheet.rangeMin + ':' + parameters.sheet.rangeMax),
		valueInputOption: 'RAW',
		resource: {"values" : parameters.data}
	}, 
	function(err, res)
	{
		if(err)
		{
			console.log('The API returned an error: ' + err);
			return;
		}
	});
}

function clearSheetData(auth, info) 
{
	let sheets = google.sheets({version: 'v4', auth});
	sheets.spreadsheets.values.clear(
	{
		spreadsheetId: parameters.sheet.link,
		range: (parameters.sheet.page + '!' + parameters.sheet.rangeMin + ':' + parameters.sheet.rangeMax)
	}, 
	function(err, res)
	{
		if(err)
		{
			console.log('The API returned an error: ' + err);
			return;
		}
	});
}

async function getActualFormResults(sheetInformations)
{
	let parameters = {};
	parameters.sheet = {link: sheetInformations.link, page: sheetInformations.page, rangeMin: sheetInformations.rangeMin, rangeMax: sheetInformations.rangeMax};

	let credentials = await fs.promises.readFile('credentials.json');
	resultValues = await authorize(JSON.parse(credentials), getSheetData, parameters);

	if(resultValues == null)
	{
		return [];
	}

	let formResult = [];

	let firstLine = parseInt(sheetInformations.rangeMin.substring(1));

	for(let i = 0; i < resultValues.length; i++)
	{
		let newUser = {};
		newUser.id = i + firstLine;
		newUser.verified = resultValues[i][sheetKeys.VERIFIED];
		newUser.status = resultValues[i][sheetKeys.STATUS];
		newUser.name = resultValues[i][sheetKeys.NAME];
		newUser.firstName = resultValues[i][sheetKeys.FIRSTNAME];
		newUser.birthday = resultValues[i][sheetKeys.BIRTHDAY];
		newUser.mail = resultValues[i][sheetKeys.MAIL];
		newUser.school = resultValues[i][sheetKeys.SCHOOL];
		newUser.schoolYear = resultValues[i][sheetKeys.SCHOOL_YEAR];
		newUser.langage = resultValues[i][sheetKeys.LANGAGE];
		newUser.send = resultValues[i][sheetKeys.SEND];
		newUser.invite = resultValues[i][sheetKeys.INVITE];
		newUser.message = resultValues[i][sheetKeys.RESUME_MESSAGE];

		if(newUser.firstName == undefined || newUser.name == undefined)
		{
			continue;
		}

		if(newUser.firstName.length == 0 || newUser.name.length == 0)
		{
			continue;
		}
		
		formResult.push(newUser);
	}

	return formResult;
}

async function updateUserVerification(sheetInformations, userInfos)
{
	let parameters = {};

	let rangeMin = sheetInformations.rangeMin[0] + userInfos.id.toString();
	let rangeMax = String.fromCharCode(sheetInformations.rangeMin.charCodeAt(0) + 1) + userInfos.id.toString();

	parameters.sheet = {link: sheetInformations.link, page: sheetInformations.page, rangeMin: rangeMin, rangeMax: rangeMax};
	parameters.data = [[userInfos.verified, userInfos.status]];

	let credentials = await fs.promises.readFile('credentials.json');
	await authorize(JSON.parse(credentials), updateSheetData, parameters);
}

async function updateUserLinks(sheetInformations, userInfos)
{
	let parameters = {};

	let rangeMin = String.fromCharCode(sheetInformations.rangeMax.charCodeAt(0) - 2) + userInfos.id.toString();
	let rangeMax = sheetInformations.rangeMax[0] + userInfos.id.toString();

	parameters.sheet = {link: sheetInformations.link, page: sheetInformations.page, rangeMin: rangeMin, rangeMax: rangeMax};
	parameters.data = [[userInfos.send, userInfos.invite, userInfos.message]];

	let credentials = await fs.promises.readFile('credentials.json');
	await authorize(JSON.parse(credentials), updateSheetData, parameters);
}

module.exports = 
{
	getActualFormResults,
	updateUserVerification,
	updateUserLinks
}