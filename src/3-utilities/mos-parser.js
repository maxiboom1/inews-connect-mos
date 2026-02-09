import {XMLParser} from "fast-xml-parser";
import mosRouter from "../4-services/0-mos-router.js";
import logger from "./logger.js";
import appConfig from "./app-config.js";

const mosDebug = appConfig.debug.showRawMos;

function parseMos(buffer, port) {
    try {
      const decodedData = Buffer.from(buffer).swap16().toString('utf16le');
      const parser = new XMLParser({
          ignoreAttributes: false,   // Keep attributes
          attributeNamePrefix: '@_', // Prefix for attributes, adjust as needed
          allowBooleanAttributes: true,
          ignoreEmptyString: false,  // Do not ignore empty elements
          processEntities: true,     // Handle special XML entities (like &amp;)
          parseTagValue: true        // Parse inner text of tags, even when empty
      });
      
      let obj = parser.parse(decodedData);
      mosRouter.mosMessageProcessor(obj, port);
      
    if(mosDebug){logger(`[MOS-PROTOCOL-DEBUG] ${JSON.stringify(decodedData)}`,'yellow');}


  } catch (error) {
      console.error(`${port}: Error parsing MOS message: ${buffer.toString()}`, error);
  }
}

export default {parseMos};

