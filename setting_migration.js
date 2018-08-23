'use strict'

let DefaultSettings = {
	"enabled": true,
	"sourceLang": "any",
	"targetLang": "en"
}

module.exports = function MigrateSettings(from_ver, to_ver, settings) {
	if(from_ver === undefined) {
		return Object.assign(Object.assign({}, DefaultSettings), settings);
	} else if(from_ver === null) {
		return DefaultSettings;
	} else {
		console.log('[Translate] Only 1 version so far, so you should never see this.')
        /*if (from_ver + 1 < to_ver) {

            settings = MigrateSettings(from_ver, from_ver + 1, settings);
            return MigrateSettings(from_ver + 1, to_ver, settings);
        }

        switch(to_ver)
        {
            case 2:
             settings.enabled = true;
             break;
        }
        
        return settings;
			*/
	}
}