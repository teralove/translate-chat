const lang = ['af','sq','ar','az','eu','bn','be','bg','ca','zh-CN','zh-TW','hr','cs','da','nl','en','eo','et','tl','fi','fr','gl','ka','de','el','gu','ht','iw','hi','hu','is','id','ga','it','ja','kn','ko','la','lv','lt','mk','ms','mt','no','fa','pl','pt','ro','ru','sr','sk','sl','es','sw','sv','ta','te','th','tr','uk','ur','vi','cy','yi','any']

module.exports = function TranslateChat(mod) {
    const translate  = require('node-google-translate-skidz');
    const latinize = require('latinize');

    mod.game.on('enter_game', () => {
        if(mod.settings.sendMode) {
            mod.command.message('Send Mode Enabled. Translating outgoing messages to ' + mod.settings.sendLang + '.')
            mod.command.message('Use "/8 translate send off" to disable it.')
        }
    })

    mod.hook('S_CHAT', 2, {order: 100}, (event) => {
        if (!mod.settings.enabled) return;
        if (event.authorName === mod.game.me.name) return;
        
        getTranslation(event, mod.settings.targetLang, function(query) {
            if (query != undefined) {
                mod.send('S_CHAT', 2, Object.assign({}, event, {message: query.translation, authorName: event.authorName + ' (Translated)'}));
            }
        });
    });   
        
    mod.hook('S_WHISPER', 2, {order: 100}, (event) => {
        if (!mod.settings.enabled) return;
        if (event.authorName === mod.game.me.name) return;
        
        getTranslation(event, mod.settings.targetLang, function(query) {
            if (query != undefined) {
                mod.send('S_WHISPER', 2, Object.assign({}, event, {message: query.translation, authorName: event.authorName + ' (Translated)'}));
            }
        });        
    });    
    
    mod.hook('S_PRIVATE_CHAT', 1, {order: 100}, (event) => {
        if (!mod.settings.enabled) return;
        if (event.authorName === mod.game.me.name) return;
        
        getTranslation(event, mod.settings.targetLang, function(query) {
            if (query != undefined) {
                mod.send('S_PRIVATE_CHAT', 1, Object.assign({}, event, {message: query.translation, authorName: event.authorName + ' (Translated)'}));
            }
        });
    });

    mod.hook('C_WHISPER', 1, event => {
        event.target = event.target.replace(/(\(Translated\)).*?/g, '').replace(/\s+$/, '')
        if(mod.settings.sendMode) {
            getTranslation(event, mod.settings.sendLang, function(query) {
                if(query != undefined) {
                    if(mod.region === 'na') {
                        query.translation = latinize(query.translation).replace(/[^\x00-\x7F]/g, "").replace(/\s+$/, '')
                    }
                    if(query.translation != '') {
                        mod.send('C_WHISPER', 1, Object.assign({}, event, {
                            message: '<FONT>' + query.translation + '</FONT>',
                            target: event.target.replace(/(\(Translated\)).*?/g, '').replace(/\s+$/, '')
                    }))
                        mod.command.message('Original message: ' + event.message.replace(/<(.+?)>|&rt;|&lt;|&gt;|/g, '').replace(/\s+$/, ''))
                    } else {
                        mod.command.message('Error: Your message could not be sent because it contains illegal characters.')
                    }
                } else { 
                    mod.send('C_WHISPER', 1, event);
                }
            })
            return false;
        }
        return true;
    })

    mod.hook('C_CHAT', 1, event => {
        if(mod.settings.sendMode) {
            getTranslation(event, mod.settings.sendLang, function(query) {
                if(query != undefined) {
                    if(mod.region === 'na') {
                        query.translation = latinize(query.translation).replace(/[^\x00-\x7F]/g, "").replace(/\s+$/, '')
                    }
                    if(query.translation != '') {
                        mod.send('C_CHAT', 1, Object.assign({}, event, {message: '<FONT>' + query.translation + '</FONT>'}))
                        mod.command.message('Original message: ' + event.message.replace(/<(.+?)>|&rt;|&lt;|&gt;|/g, '').replace(/\s+$/, ''))
                    } else {
                        mod.command.message('Error: Your message could not be sent because it contains illegal characters.')
                    }
                } else { 
                    mod.send('C_CHAT', 1, event);
                }
            })
            return false;
        }
    })
    
    function getTranslation(event, toLang, callback) {        
        let sanitized = event.message.replace(/<(.+?)>|&rt;|&lt;|&gt;|/g, '').replace(/\s+$/, ''); 
        if(sanitized === '') {
            callback(undefined);
        } else {
            translate({
                text: sanitized,
                source: mod.settings.sourceLang,
                target: toLang
            }, function(result) {
                if (result != sanitized) callback(result);
                else callback(undefined);
            });
        }
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
                    mod.command.message('Error : ' + args[1] + ' is not a valid language. See readme or index.js for available languages. Recommended Setting: any')
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
                    mod.command.message('Error : ' + args[1] + ' is not a valid language. See readme or index.js for available languages. Recommended Setting: en')
                    return
                }
                if(args[1] === 'any') {
                    mod.command.message('Error: Target Language cannot be any.')
                    return
                }
                mod.command.message('Target Language set to: ' + args[1] + '.')
                mod.settings.targetLang = args[1]
                break
            case 'send':
                if(!args[1]) {
                    mod.settings.sendMode = !mod.settings.sendMode
                    mod.command.message('Send Mode: ' + (mod.settings.sendMode ? ('enabled. Language: ' + mod.settings.sendLang) : 'disabled.'))
                } else if(lang.includes(args[1])) {
                    mod.settings.sendMode = true;
                    mod.settings.sendLang = args[1];
                    mod.command.message('Now translating outgoing messages to: ' + args[1])
                } else if(args[1] === 'off') {
                    mod.settings.sendMode = false;
                    mod.command.message('Send Mode Disabled.');
                } else if(args[1] === 'on'){
                    mod.settings.sendMode = true;
                    mod.command.message('Send Mode Enabled. Now translating outgoing messages to ' + mod.settings.sendLang + '.')
                } else {
                    mod.command.message('Error : ' + args[1] + ' is not a valid language. See readme or index.js for available languages. Recommended Setting: en')
                }
                break
            default:
                mod.command.message('Error: Invalid command')
                return
        }
        mod.saveSettings()
    });    
}