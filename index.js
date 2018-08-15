const lang = ['af','sq','ar','az','eu','bn','be','bg','ca','zh-CN','zh-TW','hr','cs','da','nl','en','eo','et','tl','fi','fr','gl','ka','de','el','gu','ht','iw','hi','hu','is','id','ga','it','ja','kn','ko','la','lv','lt','mk','ms','mt','no','fa','pl','ro','ru','sr','sk','sl','es','sw','sv','ta','te','th','tr','uk','ur','vi','cy','yi','any']

module.exports = function TranslateChat(mod) {
    const translate  = require('node-google-translate-skidz');

    mod.hook('S_CHAT', 2, {order: 100}, (event) => {
        if (!mod.settings.enabled) return;
        if (event.authorName === mod.game.me.name) return;
        
        getTranslation(event, function(query) {
            if (query != undefined) {
                mod.send('S_CHAT', 2, Object.assign({}, event, {message: query.translation, authorName: event.authorName + ' (Translation)'}));
            }
        });
    });   
        
    mod.hook('S_WHISPER', 2, {order: 100}, (event) => {
        if (!mod.settings.enabled) return;
        if (event.author === mod.game.me.name) return;
        
        getTranslation(event, function(query) {
            if (query != undefined) {
                mod.send('S_WHISPER', 2, Object.assign({}, event, {message: query.translation, author: event.authorName + ' (Translated)'}));
            }
        });        
    });    
    
    mod.hook('S_PRIVATE_CHAT', 1, {order: 100}, (event) => {
        if (!mod.settings.enabled) return;
        if (event.authorName === mod.game.me.name) return;
        
        getTranslation(event, function(query) {
            if (query != undefined) {
                dispatch.toClient('S_PRIVATE_CHAT', 1, Object.assign({}, event, {message: query.translation, authorName: event.authorName + ' (Translated)'}));
            }
        });
    });
    
    function getTranslation(event, callback) {        
        let sanitized = event.message.replace(/<(.+?)>|&rt;|&lt;|&gt;|/g, '').replace(/\s+$/, ''); 

        translate({
            text: sanitized,
            source: mod.settings.sourceLang,
            target: mod.settings.targetLang
        }, function(result) {
            if (result != sanitized) callback(result);
            else callback(undefined);
        });
    }
 
    mod.command.add('translate', (...args) => {
        switch(args[0]) {
            case undefined:
                mod.settings.enabled = !mod.settings.enabled;
                mod.command.message('Module ' + (mod.settings.enabled ? 'Enabled' : 'Disabled'));
                break
            case 'source':
                if(!args[1]) {
                    mod.command.message('Source Language: ' + mod.settings.sourceLang + '.')
                    return
                }
                if(!lang.includes(args[1])) {
                    mod.command.message('Error : ' + args[1] + ' is not a valid language. See readme or index.js for available languages. Recommended Setting: any.')
                    return
                }
                mod.command.message('Source Language set to: ' + args[1] + '.')
                mod.settings.sourceLang = args[1]
                break
            case 'target': 
                if(!args[1]) {
                    mod.command.message('Target Language: ' + mod.settings.targetLang + '.')
                    return
                }
                if(!lang.includes(args[1])) {
                    mod.command.message('Error : ' + args[1] + ' is not a valid language. See readme or index.js for available languages. Recommended Setting: en.')
                    return
                }
                if(args[1] === 'any') {
                    mod.command.message('Error: Target Language cannot be any.')
                    return
                }
                mod.command.message('Target Language set to: ' + args[1] + '.')
                mod.settings.targetLang = args[1]
                break
            default: 
                mod.command.message('Error: Invalid command')
                return
        }
        mod.saveSettings()
    });    
}