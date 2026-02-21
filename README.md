# inews-connect-mos
This project aims to adapt and extend our existing, UTF-8-compliant MOS device integration, originally built and successfully tested with the Octopus NRCS, to now work seamlessly with Avid iNEWS via MOS Gateway.

Our current implementation supports the core MOS protocol (v2.8.5) and has been validated in production environments with Octopus. The next milestone is to ensure compatibility with iNEWS workflows, message encoding expectations, connection lifecycle (handshakes, keepalives), and MOS Gateway-specific handling of rundowns, stories, and device status.

This repository is a fork of the original Octopus Connect gateway, adapted specifically for the Avid environment.

Key goals:

Ensure interoperability with the inews MOS Gateway (including proper response to heartbeat, roCreate, mosObjCreate, etc.).

Maintain strict UTF-8 encoding and compatibility with iNEWS character requirements.

Support bidirectional communication with iNEWS rundowns, including active rundown loading and status updates.


# Change log

## 2.4.4

- Implemented Story Resync (reset story items) mechanism:
- Added new story-sync-service that can be triggered by item UID.
- Service sends roReq(roID), intercepts returned roList, finds the target storyID, then deletes all story items from SQL + cache (story itself is kept), rebuilds items from the received story snapshot, and sends mosItemReplace per item to update metadata with the new SQL item UID.
- Added roList routing hook in app-processor to forward roList to story-sync handler when sync mode is enabled (while keeping boot queue alive).

## 2.4.3

- Implemented prw-cleaner utility module - it has running INTERVAL_MS, MAX_AGE_MS (delete files older than), and MATCH_RE (we can set extension jpg|png). Currently - ive configured it to run once at hour and delete files older than 3 minutes.

## 2.4.2

- Preview upgrade - now we always send full path to frame server.
- Added option to export preview png to predefined location. 
- Added "Export PNG" button inside preview panel - we create it in fileprocessor - then handle it in exportPng(), that also showing slyled moder toast.
- Added sync button to resync item - currently it still not finishe - done handler => route=> storyService => sql. need to keep work on this.
- New config option: previewExtension (must be setten with dot ".png"), and previewExportDir to specify export path (must set end slash "g:/test/"). 

## 2.4.1.1

- Fix in preview path url - we use "originalURL" now that dynamically reports the server url (not hardcoded).

## 2.4.1

- Added option to resize preview panel
- Added new previewPanelResize config.json option - set true to enable

## 2.4.0

- Finally merged 2 different versions from 2 different places. The new version contain the prw version + boot improvment mechanism. roCreate now parsing the data from message itself (instead call roReq, and risk to fall into race conditions when on process users do modify items in rundown that not finished to process). With this tecnique, we garanteed that mos server wont send new updates since we not acked roCreate yet. Refactored struct in services files. next milestones should be dynamically resize prw section on whole window resize.

## 2.3.1

- Added more colors for scene colorifying (menu.js and menu.css)

## 2.3.0

- Fully implemented preview feature — including frontend UI, logic and file-serving.
- On any user input change — via debounce — we send a GET to the preview server, then poll with lightware HEAD requests our Express server for the rendered file (same UUID). Once HEAD return OK, we assign the url of the image on html
- On server side - implemented routes for HEAD requests - its new prw.js module in routes.
- Since grid order affected by direction property of the bidy - and we have templates of rtl and ltr kind - i"ve implemented direction detector in fileProcessor.js file - if it detects that body has rtl prop - we assign <body class="na-doc-rtl"> and based on this swap in css the order of the grid. works perfect, without affecting the content.
- There are still style work to do to polish the preview pane.
- There are some templates that shoulds have prw pane - need to implement some mechanism (Dor).
- Next update: add close/open pane option - when closed disable send to render on change.

## 2.2.6

- "Save" moved after the input box (its just an appending order in fileProcessor)
- Added fallback condition to case when the gfx element have no scripts. 

## 2.2.5

- Added "alias" property to rundown in appConfig. We write this alias as friendly name that will be shown to end user in NewsArts. In Database, we write it to "tag" prop.
- Data struct example in appConfig:

```
    "rundowns": {
        
        "SHOW.TEST.TEST01":{"production":200, "alias":"Test01"},
        
        "SHOW.TEST.RUNDOWN":{"production":201, "alias":"Friendly-Rundown-Name"},
        
        "default":{"production":20011, "alias":"Default-RD"}

    }
```


## 2.2.4

- Rename "save" button
- Re-factor send to preview handlers on front page


## 2.2.3

- Implemented robust TCP communication protocol with NewsArts to dynamically to send re-sync command from NewsArts.
- iNews-Connect acts as a TCP server on port 5431, accepting commands from NewsArts clients.
- Supported protocol commands (null-terminated strings):
* iNewsC-reset- → forcefully clear and reload **all** rundowns.
- New modules: TCP, TCP-router and re-sync service
- This is start of implementation. While NewsArts sends reset with rundown uid - we need ideally to reset only provided uid and not all rundowns. Then, we need to implement delayed response mechanism: TCP -OK is sent only after given rundown is fully cleared and re-loaded. Currently - I send OK after fixed timeout.


## 2.2.2

- Implemented "ctrl+s" user indicator with timeout - when user do "ctrl+s", we show green dot that indicates to user that operation has been completed.
- Removed old preview logic - as we will implement more robust preview options in the future.

## 2.2.1

- On front page: 
    1. Added save() func that creates and copies mosItem to clipboard.
    2. Added "cntrl+s"/"cntrl+ד" handler that triggers save() - so, user can use ctrl+s shortcut to save item to clipboard.
    3. Added click handler for "drag" button to do the same save().
- BUG FIX: In items service ==> insertItem we fixed critical bug - by adding roID to story that was fetched from cache. Before that - it sent 
mosItemReplace without roID and caused heavy bugs.
- BUG FIX: Added rundownLastUpdate in replaceStory and moveMultiple. Without that - nesarts not react to changes.


## 2.2.0

- Implemented insertItem method - it covers new/duplicate/uniq cases: 
    * new - when the item id is 0
    * duplicate - when the item id already exists in items hash
    * uniq - the case when we get item id but its not exists in items hash. (Probably copy from other rundown that is not monitored). 
I need to check all edge cases - but for first look, the logic works fine and handles correctly cache and sql
- Refactored removeItemsMeta to normalize.js module (now we call it from items service and from octopus-service).
- Now we force types conversion in itec constructor, before saving to cache.
- We need to deeply debug and test the roItemInsert event with many scenarios - copy from offline rundown etc...

## 2.1.6

- RundownStr - is prop we carry from octopus project when roID and roSlug was different. Since in inews its same value - I try to remove it now from everywhere and simplify methods accross the project. Instead adding to each story rundownStr prop, and roID, i now avoid to adding rundownstr, also in cache methods adjustment was done.
- Added itemDelete method in itemsService - now we are handle the case of single item delete - reorder other items in story, save new story to cache and sql and update last updates. 


## 2.1.5

- Added prependSeparator and prependStringForEmptyPageNumber values to appConfig - they should be the same as on inews gateway mosconfig.xml.
- Added hanlding for replaceStory event - basically we replace there only story slug name and page (storyNum) - those are the only cases I found. 


## 2.1.4

- Refactored sql method modifyBbStoryOrdByStoryID to modifyBbStoryOrd (before we had 2 of them with minor diff).
- Now we can handle delete stories message that sends array of stories to delete (Added deleteStoriesHandler that runs over stories and trigger delete story for each)
- Now we are handle complex roStoryMoveMultiple MOS message that covers all story reorder/move even if user move group of stories. New method is moveMultiple - is quete hard to understand but have linear complexity, optimized to write only real changes, and tested for working in major edge cases. 

## 2.1.3

- Fixed getItemsArrByStoryID cache method.
- Added general comment to normalizeItem function.
- Done with replaceItem event.
- Added check for non-item storyAppend event (we then skip the event - this in case user choosed to send empty stories in mos gw settings).
- Started with roStoryInsert.
- Some function-level comments in octopus service. 

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

