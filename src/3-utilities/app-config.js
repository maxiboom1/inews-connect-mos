import { readFileSync } from 'fs';

const appConfig =JSON.parse(readFileSync('./config.json', 'utf8'));


// ***************** App Advanced Configuration ***************** //

// App Version
appConfig.version = "2.3.1";

// Express static server port
appConfig.pluginPort = 3000;

appConfig.keepSqlItems = false;

// Those 2 configs should match the correspond settings in inews gateway mosconfig.xml  
appConfig.prependSeparator = " | ";
appConfig.prependStringForEmptyPageNumber = "NO PAGE";

// Debug options
appConfig.debug = {
    sql:1,
    functions:1,
    showMos:0,
    showRawMos:0
}


export default appConfig; 