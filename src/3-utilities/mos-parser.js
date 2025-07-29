import {XMLParser} from "fast-xml-parser";
import mosRouter from "../4-services/mos-router.js";

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

  } catch (error) {
      console.error(`${port}: Error parsing MOS message: ${buffer.toString()}`, error);
  }
}

export default {parseMos};

