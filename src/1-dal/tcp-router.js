import logger from '../3-utilities/logger.js'; 
import reSyncService from '../4-services/6-newsarts-sync.js';


export async function handleTcpMessage(socket, cmd) {
    logger(`[TCP] Received: ${cmd}`, 'yellow');

    // Reset command
    if (cmd.startsWith('iNewsC-reset-')) {
        const uid = Number(cmd.split('-')[2]);
        await reSyncService.deleteAllRundowns();
        setTimeout(() => {
            socket.write(`iNewsC-reset-${uid}-OK\0`);
        }, "5000");
        
    
    } else if(cmd.startsWith('iNewsC-itemUpdate-')){
        const uid = cmd.split('-')[2];
        itemUpdateFromNA(convertToArray(uid));
        socket.write(`iNewsC-itemUpdate-OK\0`);
    } 
    
    else {
        socket.write(`iNewsC-status-Protocol deprecated\0`);
    }
}

async function itemUpdateFromNA(itemsUidArr){
    for(const uid of itemsUidArr){
        //const item = await sqlService.getItemByUid(uid);
        //console.log(itemsHash.isDuplicate());
    }
}

function convertToArray(itemsStr){
    return itemsStr.split(',').map(Number);
}