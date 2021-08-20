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

function getColumnData(info, values)
{
	let data = {};

	for(let element in info.data)
	{
		data[element] = -1;
	}

	for(let i = 0; i < values[0].length; i++)
	{
		let keys = Object.keys(info.data);

		for(let j = 0; j < keys.length; j++)
		{
			if(info.data[keys[j]] == values[0][i])
			{
				data[keys[j]] = i;
				break;
			}
		}
	}

	return data;
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

		let data = getColumnData(info, res.data.values);
		let firstCell = info.range.split(':')[0];
		let sheetFirstNumber = parseInt(firstCell.substring(1));

		let dataKeys = Object.keys(data);

		for(let i = 0; i < dataKeys.length; i++)
		{
			if(data[dataKeys[i]] == -1)
			{
				return console.log("No " + dataKeys[i] + " Name");
			}
		}

		module.exports.sheetData[info.serverId] = [];

		for(let i = 1; i < res.data.values.length; i++)
		{
			let user = {};
			user.index = i - 1;
			user.cells = {};

			for(let j = 0; j < dataKeys.length; j++)
			{
				let key = dataKeys[j];
				user[key] = res.data.values[i][data[key]];

				if((key != "lastName") && (key != "firstName"))
				{
					user.cells[key] = String.fromCharCode(firstCell.charCodeAt(0) + data[key]) + (sheetFirstNumber + i);
				}
			}

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

function fusionSheetInformations(auth, info)
{
	const sheets = google.sheets({version: 'v4', auth});
	
	sheets.spreadsheets.values.get({
		spreadsheetId: info.link,
		range: (info.from + '!' + info.range),
	}, (err, res) => {

		if (err)
		{
			return console.log('The API returned an error: ' + err);
		} 
	
		let result = [];
		let data = getColumnData(info, res.data.values);

		result.push([]);

		for(let i = 0; i < res.data.values[0].length; i++)
		{
			result[0].push(res.data.values[0][i]);
		}

		for(let i = 1; i < res.data.values.length; i++)
		{
			let found = false;

			for(let j = 0; j < result.length; j++)
			{
				if(result[j][data.firstName].normalize('NFD').replace(/[\u0300-\u036f]/g, "") != res.data.values[i][data.firstName].normalize('NFD').replace(/[\u0300-\u036f]/g, ""))
				{
					continue;
				}

				if(result[j][data.lastName].normalize('NFD').replace(/[\u0300-\u036f]/g, "") != res.data.values[i][data.lastName].normalize('NFD').replace(/[\u0300-\u036f]/g, ""))
				{
					continue;
				}

				found = true;

				let dataKeys = Object.keys(data);

				for(let k = 0; k < dataKeys.length; k++)
				{
					if(result[j][data[dataKeys[k]]] != res.data.values[i][data[dataKeys[k]]])
					{
						let index = data[dataKeys[k]];
						if((result[j].length > data[index]) && (res.data.values[i].length > data[index]))
						{
							if((result[j][data[index]].length != 0) && (res.data.values[i][data[index]].length != 0))
							{
								found = false;
								break;
							}
						}
						
					}
				}

				if(found)
				{
					for(let k = 0; k < res.data.values[i].length; k++)
					{
						if(res.data.values[i][k].length != 0)
						{
							if(k == data.promotion)
							{
								result[j][k] = parseInt(res.data.values[i][k]);
							}
							else
							{
								result[j][k] = res.data.values[i][k];
							}
						}
					}
				}
			}

			if(found)
			{
				continue;
			}

			let newLine = []
			for(let j = 0; j < res.data.values[i].length; j++)
			{
				if(j == data.promotion)
				{
					newLine.push(parseInt(res.data.values[i][j]));
				}
				else
				{
					newLine.push(res.data.values[i][j]);
				}
			}

			result.push(newLine);
		}

		sheets.spreadsheets.values.update({
			spreadsheetId: info.link,
			range: (info.to + '!' + info.range),
			valueInputOption: 'RAW',
			resource: {"values" : result}
		}, (err, res) => {
	
			if (err) {
				return console.log('The API returned an error: ' + err);
			}
		});
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

	fusionSheetData : function(info)
	{
		// Load client secrets from a local file.
		fs.readFile('credentials.json', (err, content) => {
			if (err) return console.log('Error loading client secret file:', err);
			// Authorize a client with credentials, then call the Google Sheets API.
			authorize(JSON.parse(content), info, fusionSheetInformations);
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