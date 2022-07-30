const nodemailer = require('nodemailer');
const { google } = require("googleapis");
const OAuth2 = google.auth.OAuth2;

const { user, token, client_id, client_secret } = require('../mail_user.json');

let transporter = null;

async function initEmailManager()
{
	const oauth2Client = new OAuth2(
		client_id,
		client_secret,
		"https://developers.google.com/oauthplayground"
	);
	
	oauth2Client.setCredentials({
		refresh_token: token
	});

	let accessToken = await new Promise(function(resolve)
	{
		oauth2Client.getAccessToken(function(err, token)
		{
			if(err)
			{
				console.log(err);
				resolve(null);
				return;
			}

			resolve(token);
		});
	});
	
	if(accessToken == null)
	{
		return;
	}

	transporter = nodemailer.createTransport(
		{
			service: 'gmail',
			auth:
			{
				type: "OAuth2",
				user: user,
				accessToken,
				clientId: client_id,
				clientSecret: client_secret,
				refreshToken: token
			}
		}
	);
}

async function sendMail(toAddress, subject, text)
{
	if(transporter == null)
	{
		return;
	}

	let mailOptions = 
	{
		from: user,
		to: toAddress,
		subject: subject,
		html: text
	}

	let promise = new Promise(function(resolve)
	{
		transporter.sendMail(mailOptions, function(err)
		{
			if(err)
			{
				resolve(err);
				return;
			}

			resolve(null);
		});
	});
	
	return promise;
}

module.exports = 
{
	initEmailManager,
	sendMail
}