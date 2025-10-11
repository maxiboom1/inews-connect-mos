# inews-connect-mos
This project aims to adapt and extend our existing, UTF-8-compliant MOS device integration, originally built and successfully tested with the Octopus NRCS, to now work seamlessly with Avid iNEWS via MOS Gateway.

Our current implementation supports the core MOS protocol (v2.8.5) and has been validated in production environments with Octopus. The next milestone is to ensure compatibility with iNEWS workflows, message encoding expectations, connection lifecycle (handshakes, keepalives), and MOS Gateway-specific handling of rundowns, stories, and device status.

This repository is a fork of the original Octopus Connect gateway, adapted specifically for the Avid environment.

Key goals:

Ensure interoperability with the inews MOS Gateway (including proper response to heartbeat, roCreate, mosObjCreate, etc.).

Maintain strict UTF-8 encoding and compatibility with iNEWS character requirements.

Support bidirectional communication with iNEWS rundowns, including active rundown loading and status updates.


# Change log

## 2.1.2

- Finished with roItemReplace == > it updates sql, and cache. Added updateItem methods in SQL , and in cache.
- Added conditional roItemReplace command constructor - according type 1 and 2.
- Cleaned items-service and octopus-service from old func (old modules saves as backup).

## 2.1.1

- In inews, new item wrapped in <ncsItem><item>, this is also the legal wrapper for item that sent by plugin, and in mosItemReplace.
But, once the item has been modyfied in inews (using "apply" or "Ok" buttons), the item struct is change, and the <ncsItem><item> ommited.
Added an little normalizer that flat the incoming items in stories to non <ncsItem><item> struct.
I did it in octopus-service/constructStory method.
- Added example for 2 types of item in mos-examples.js
- Added showRawMos debug option to show incoming mos messages before the parser(as str), while showMos will print the message after the parser (as object).
## 2.1.0

- Added missing mosItemBrowserProgID and mosItemEditorProgID to mosItemReplace template.

## 2.0.1

- Added SQL create scripts for ngn_inews_items, ngn_inews_rundowns and ngn_inews_stories.
- In ngn_inews_rundowns, the roID is nvarchar type (in octopus we get it as number).


## 2.0.0

- Updated all senders to UCS-2 big endian encoding"
```
Buffer.from(string, 'utf16le').swap16();
```

