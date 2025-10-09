// When we have single monitored queue in the system
const roListAll = { 
  "mos": { 
    "mosID": "NAMOS", 
    "ncsID": "INEWS", 
    "roListAll": { 
      "roID": "INEWS/SHOW.TEST.RUNDOWN", 
      "roSlug": "INEWS/SHOW.TEST.RUNDOWN" 
    } 
  } 
}


const roListAll_multiRundowns=  {
  "mos":{
    "mosID":"NAMOS",
    "ncsID":"INEWS",
    "roListAll":{
      "roID":["INEWS/SHOW.TEST.RUNDOWN","INEWS/SHOW.TEST.TEST01"],
      "roSlug":["INEWS/SHOW.TEST.RUNDOWN","INEWS/SHOW.TEST.TEST01"]
    }
  }
}

const roListSingleStoryAndItem = {
  "mos": {
    "mosID": "NAMOS",
    "ncsID": "INEWS",
    "roList": {
      "roID": "INEWS/SHOW.TEST.TEST01",
      "roSlug": "INEWS/SHOW.TEST.TEST01",
      "roTrigger": "",
      "story": {
        "storySlug": "NO PAGE - 111",
        "storyID": 310519286,
        "item": {
          "ncsItem": {
            "item": {
              "itemSlug": "סטרייפ - ‫123",
              "objID": "",
              "objAir": "READY",
              "mosID": "NAMOS",
              "mosItemBrowserProgID": "alex",
              "mosItemEditorProgID": "alexE",
              "mosExternalMetadata": {
                "gfxItem": 0,
                "gfxTemplate": 90194,
                "gfxProduction": 20013,
                "metadata": "[\"2\",\"‫123\"]",
                "modified": "Plugin",
                "data": "[\"2\",\"‫123\"]",
                "scripts": "script data"
              }
            }
          },
          "itemID": 1
        }
      }
    }
  }
}

const roList2StoriesWith3Items = {
  "mos": {
    "mosID": "NAMOS",
    "ncsID": "INEWS",
    "roList": {
      "roID": "INEWS/SHOW.TEST.TEST01",
      "roSlug": "INEWS/SHOW.TEST.TEST01",
      "roTrigger": "",
      "story": [
        //Story-1
        {
          "storySlug": "NO PAGE - 111",
          "storyID": 310519286,
          "item": {
            "ncsItem": {
              "item": {
                "itemSlug": "סטרייפ - ‫123",
                "objID": "",
                "objAir": "READY",
                "mosID": "NAMOS",
                "mosItemBrowserProgID": "alex",
                "mosItemEditorProgID": "alexE",
                "mosExternalMetadata": {
                  "gfxItem": 0,
                  "gfxTemplate": 90194,
                  "gfxProduction": 20013,
                  "metadata": "[\"2\",\"‫123\"]",
                  "modified": "Plugin",
                  "data": "[\"2\",\"‫123\"]",
                  "scripts": "script data"
                }
              }
            },
            "itemID": 1
          }
        },
        // Story-2
        {
          "storySlug": "NO PAGE - 222",
          "storyID": 293742070,
          "item": [
            {
              "ncsItem": {
                "item": {
                  "itemSlug": "סטרייפ - ‫‫AAA",
                  "objID": "",
                  "objAir": "READY",
                  "mosID": "NAMOS",
                  "mosItemBrowserProgID": "alex",
                  "mosItemEditorProgID": "alexE",
                  "mosExternalMetadata": {
                    "gfxItem": 0,
                    "gfxTemplate": 90194,
                    "gfxProduction": 20013,
                    "metadata": "[\"2\",\"‫‫AAA\"]",
                    "modified": "Plugin",
                    "data": "[\"2\",\"‫‫AAA\"]",
                    "scripts": "script data"
                  }
                }
              },
              "itemID": 1
            },
            {
              "ncsItem": {
                "item": {
                  "itemSlug": "סטרייפ - ‫‫BBB",
                  "objID": "",
                  "objAir": "READY",
                  "mosID": "NAMOS",
                  "mosItemBrowserProgID": "alex",
                  "mosItemEditorProgID": "alexE",
                  "mosExternalMetadata": {
                    "gfxItem": 0,
                    "gfxTemplate": 90194,
                    "gfxProduction": 20013,
                    "metadata": "[\"2\",\"‫‫BBB\"]",
                    "modified": "Plugin",
                    "data": "[\"2\",\"‫‫BBB\"]",
                    "scripts": "script data"
                  }
                }
              },
              "itemID": 2
            }
          ]
        }
      ]
    }
  }
}

// Story with new item (single item)
const roStoryAppend = {
  "mos":{
    "mosID":"NAMOS",
    "ncsID":"INEWS",
    "roStoryAppend":{
      "roID":"INEWS/SHOW.TEST.TEST01",
      "story":{
        "storySlug":"NO PAGE - 111",
        "storyID":310519286,
        "item":{
          "ncsItem":{
            "item":{
              "itemSlug":"TEST",
              "objID":"GFX-12345",
              "mosID":"NAMOS",
              "mosItemBrowserProgID":"alexB",
              "mosItemEditorProgID":"alexE",
              "mosAbstract":"abstract"}
            },
            "itemID":1}
          }
        }
      }
    }

const storyAsItComesToItemService ={
  "storySlug": "NO PAGE - 111",
  "storyID": 310519286,
  "item": [
    {
      "ncsItem": {
        "item": {
          "itemSlug": "סטרייפ - ‫123",
          "objID": "",
          "objAir": "READY",
          "mosID": "NAMOS",
          "mosItemBrowserProgID": "alex",
          "mosItemEditorProgID": "alexE",
          "mosExternalMetadata": {
            "gfxItem": 0,
            "gfxTemplate": 90194,
            "gfxProduction": 20013,
            "metadata": "[\"2\",\"‫123\"]",
            "modified": "Plugin",
            "data": "[\"2\",\"‫123\"]",
            "scripts": "script data"
          }
        }
      },
      "itemID": 1,
      "ord": 0
    }
  ],
  "rundownStr": "INEWS/SHOW.TEST.TEST01",
  "ord": 0,
  "roID": "INEWS/SHOW.TEST.TEST01",
  "rundown": "2",
  "production": 20013,
  "floating": 0
}