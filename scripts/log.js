let VerboseLevel = 5;

module.exports = {
	logMessage : function(message, verbose = 1)
	{
		if(VerboseLevel >= verbose)
		{
			console.log(message);
		}
	}
}