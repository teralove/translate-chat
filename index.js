const Command = require('command');

module.exports = function TranslateChat(dispatch) {
    const command = Command(dispatch);
    const translate  = require('./dependencies/node-google-translate-skidz');
    
    let enabled = true,
    sourceLang = 'auto', // auto = detect language. can be specified with language code
    targetLang = 'en',   // language to translate to
    playerName; 
    
    dispatch.hook('S_LOGIN', 10, (event) => {
        playerName = event.name;
    });
    
    dispatch.hook('S_CHAT', 1, {order: 100}, (event) => {
        if (!enabled) return;
        if (event.authorName === playerName) return;
        
        getTranslation(event, function(query) {
            if (query != undefined) {
                dispatch.toClient('S_CHAT', 1, Object.assign({}, event, {message: query.translation, authorName: event.authorName + '(translation)'}));
            }
        });
    });   
        
    dispatch.hook('S_WHISPER', 1, {order: 100}, (event) => {
        if (!enabled) return;
        if (event.author === playerName) return;
        
        getTranslation(event, function(query) {
            if (query != undefined) {
                dispatch.toClient('S_WHISPER', 1, Object.assign({}, event, {message: query.translation, author: event.author + ' (translated)'}));
            }
        });        
    });    
    
    dispatch.hook('S_PRIVATE_CHAT', 1, {order: 100}, (event) => {
        if (!enabled) return;
        if (event.authorName === playerName) return;
        
        getTranslation(event, function(query) {
            if (query != undefined) {
                dispatch.toClient('S_PRIVATE_CHAT', 1, Object.assign({}, event, {message: query.translation, authorName: event.authorName + ' (translated)'}));
            }
        });
    });
    
    function getTranslation(event, callback) {        
        let sanitized = event.message.replace(/<(.+?)>|&rt;|&lt;|&gt;|/g, '').replace(/\s+$/, ''); 

        translate({
            text: sanitized,
            source: sourceLang,
            target: targetLang
        }, function(result) {
            if (result != sanitized) callback(result);
            else callback(undefined);
        });
    }
 
    command.add('translate', () => {
        enabled = !enabled;
        command.message('(translate-chat) ' + (enabled ? 'Enabled' : 'Disabled'));
    });    
}