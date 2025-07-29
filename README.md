# inews-connect-mos
This project aims to adapt and extend our existing, UTF-8-compliant MOS device integration, originally built and successfully tested with the Octopus NRCS, to now work seamlessly with Avid iNEWS via MOS Gateway.

Our current implementation supports the core MOS protocol (v2.8.5) and has been validated in production environments with Octopus. The next milestone is to ensure compatibility with iNEWS workflows, message encoding expectations, connection lifecycle (handshakes, keepalives), and MOS Gateway-specific handling of rundowns, stories, and device status.

This repository is a fork of the original Octopus Connect gateway, adapted specifically for the Avid environment.

Key goals:

Ensure interoperability with the inews MOS Gateway (including proper response to heartbeat, roCreate, mosObjCreate, etc.).

Maintain strict UTF-8 encoding and compatibility with iNEWS character requirements.

Support bidirectional communication with iNEWS rundowns, including active rundown loading and status updates.


# Change log

## 2.0

- Updated all senders to UCS-2 big endian encoding"
```
Buffer.from(string, 'utf16le').swap16();
```

