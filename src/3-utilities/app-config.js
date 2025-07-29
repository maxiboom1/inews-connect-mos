import { readFileSync } from 'fs';

const appConfig =JSON.parse(readFileSync('./config.json', 'utf8'));


// ***************** App Advanced Configuration ***************** //

// App Version
appConfig.version = "2.0";

// Express static server port
appConfig.pluginPort = 3000;

appConfig.keepSqlItems = false;

// Debug options
appConfig.debug = {
    mos:1,
    sql:1,
    functions:1,
    showMos:1
}


export default appConfig; 