const fs = require('fs');
const readline = require('readline');
const {google} = require('googleapis');
const { parse } = require('path');
const { checkName } = require('./alumni_check');

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
 */
function authorize(credentials, info, callback) {
	const {client_secret, client_id, redirect_uris} = credentials.installed;
	const oAuth2Client = new google.auth.OAuth2(
		client_id, client_secret, redirect_uris[0]);

  // Check if we have previously stored a token.
	fs.readFile(TOKEN_PATH, (err, token) => {
		if (err) return getNewToken(oAuth2Client, info, callback);
		oAuth2Client.setCredentials(JSON.parse(token));
		callback(oAuth2Client, info);
	});
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
function getNewToken(oAuth2Client, info, callback) {
	const authUrl = oAuth2Client.generateAuthUrl({
		access_type: 'offline',
		scope: SCOPES,
	});
	
	console.log('Authorize this app by visiting this url:', authUrl);
	const rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout,
	});
	rl.question('Enter the code from that page here: ', (code) => {
		rl.close();
		oAuth2Client.getToken(code, (err, token) => {
			if (err) 
			{
				return console.error('Error while trying to retrieve access token', err);
			} 
			oAuth2Client.setCredentials(token);
			// Store the token to disk for later program executions
			fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
				if (err) return console.error(err);
				console.log('Token stored to', TOKEN_PATH);
			});
			
			callback(oAuth2Client, info);
		});
	});
}

function getSheetInformations(auth, info) {
	const sheets = google.sheets({version: 'v4', auth});
	
	sheets.spreadsheets.values.get({
		spreadsheetId: info.link,
		range: (info.page + '!' + info.range),
	}, (err, res) => {

		module.exports.sheetData[info.serverId] = null;

		if (err)
		{
			return console.log('The API returned an error: ' + err);
		} 
	
		let firstName = -1;
		let lastName = -1;
		let check = -1;
		let pseudo = -1;
		let checkSheetLetter;
		let pseudoSheetLetter;

		let firstCell = info.range.split(':')[0];
		let sheetFirstNumber = parseInt(firstCell.substring(1));

		for(let i = 0; i < res.data.values[0].length; i++)
		{
			switch(res.data.values[0][i])
			{
				case info.firstName:
					firstName = i;
					break;

				case info.lastName:
					lastName = i;
					break;

				case info.checkName:
					check = i;

					checkSheetLetter = String.fromCharCode(firstCell.charCodeAt(0) + i);
					break;

				case info.pseudoName:
					pseudo = i;

					pseudoSheetLetter = String.fromCharCode(firstCell.charCodeAt(0) + i);
					break;
			}
		}

		if(firstName == -1)
		{
			return console.log("No First Name");
		}

		if(lastName == -1)
		{
			return console.log("No Last Name");
		}

		if(check == -1)
		{
			return console.log("No Check Name");
		}

		if(pseudo == -1)
		{
			return console.log("No Pseudo Name");
		}

		module.exports.sheetData[info.serverId] = [];

		for(let i = 1; i < res.data.values.length; i++)
		{
			let user = {};
			user.firstName = res.data.values[i][firstName];
			user.lastName = res.data.values[i][lastName];
			user.check = res.data.values[i][check];
			user.pseudo = res.data.values[i][pseudo];
			user.checkCell = checkSheetLetter + (sheetFirstNumber + i);
			user.pseudoCell = pseudoSheetLetter + (sheetFirstNumber + i);

			module.exports.sheetData[info.serverId].push(user);
		}
	});
}

function updateSheetInformations(auth, info) {
	const sheets = google.sheets({version: 'v4', auth});
	
	sheets.spreadsheets.values.update({
		spreadsheetId: info.link,
		range: (info.page + '!' + info.range),
		valueInputOption: 'RAW',
		resource: {"values" : info.values}
	}, (err, res) => {

		if (err) {
            return console.log('The API returned an error: ' + err);
        }
	});
}

function clearSheetInformations(auth, info) {
	const sheets = google.sheets({version: 'v4', auth});
	
	sheets.spreadsheets.values.clear({
		spreadsheetId: info.link,
		range: (info.page + '!' + info.range)
	}, (err, res) => {

		if (err) {
            return console.log('The API returned an error: ' + err);
        }
	});
}

module.exports = {
	sheetData : {},
	updateSheetData : function(info)
	{
		// Load client secrets from a local file.
		fs.readFile('credentials.json', (err, content) => {
			if (err) return console.log('Error loading client secret file:', err);
			// Authorize a client with credentials, then call the Google Sheets API.
			authorize(JSON.parse(content), info, getSheetInformations);
		});
	},

	updateSheetRange : function(info)
	{
		// Load client secrets from a local file.
		fs.readFile('credentials.json', (err, content) => {
			if (err) return console.log('Error loading client secret file:', err);
			// Authorize a client with credentials, then call the Google Sheets API.
			authorize(JSON.parse(content), info, updateSheetInformations);
		});
	},

	clearSheetRange : function(info)
	{
		// Load client secrets from a local file.
		fs.readFile('credentials.json', (err, content) => {
			if (err) return console.log('Error loading client secret file:', err);
			// Authorize a client with credentials, then call the Google Sheets API.
			authorize(JSON.parse(content), info, clearSheetInformations);
		});
	},
}