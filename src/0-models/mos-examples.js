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

const roListAll_multiRundowns = {
    "mos": {
        "mosID": "NAMOS",
        "ncsID": "INEWS",
        "roListAll": {
            "roID": ["INEWS/SHOW.TEST.RUNDOWN", "INEWS/SHOW.TEST.TEST01"],
            "roSlug": ["INEWS/SHOW.TEST.RUNDOWN", "INEWS/SHOW.TEST.TEST01"]
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

const roCreateWithSingleStory = {
    "mos":{
        "mosID":"NAMOS",
        "ncsID":"INEWS",
        "roCreate":{
            "roID":"INEWS/SHOW.YELADIM.RUNDOWN",
            "roSlug":"INEWS/SHOW.YELADIM.RUNDOWN",
            "roTrigger":"",
            "story":{
                "storySlug":"NO PAGE | alex",
                "storyID":488441575,
                "item":{
                    "ncsItem":{
                        "item":{
                            "itemSlug":"נ - Stripe-1",
                            "objID":"",
                            "objAir":"READY",
                            "mosID":"NAMOS",
                            "mosItemBrowserProgID":"alex",
                            "mosItemEditorProgID":"alexE",
                            "mosExternalMetadata":{
                                "mosSchema":"A",
                                "gfxItem":37062,
                                "gfxTemplate":70281,
                                "gfxProduction":20011,
                                "data":"%5B%222%22%2C%22%E2%80%ABStripe-1%22%5D",
                                "scripts":"%7B%22scriptIn%2RIPE%3B1)%n%3B100)%22%5D%7D"
                            }
                        }
                    },
                    "itemID":1
                }
            }
        }
    }
}

const roCreateWithMultiplestoryAndItems = {
    "mos": {
        "mosID": "NAMOS",
        "ncsID": "INEWS",
        "roCreate": {
            "roID": "INEWS/SHOW.YELADIM.RUNDOWN",
            "roSlug": "INEWS/SHOW.YELADIM.RUNDOWN",
            "roTrigger": "",
            "story": [
                {
                    "storySlug": "NO PAGE | alex2",
                    "storyID": 1902312,
                    "item": {
                        "itemSlug": "נ - Stripe-0",
                        "objID": "",
                        "objAir": "READY",
                        "mosID": "NAMOS",
                        "mosItemBrowserProgID": "alex",
                        "mosItemEditorProgID": "alexE",
                        "mosExternalMetadata": {
                            "mosSchema": "A",
                            "gfxItem": 37065,
                            "gfxTemplate": 70281,
                            "gfxProduction": 20011,
                            "data": "%5B%222%22%2C%22%E2%80%ABStripe-0%22%5D",
                            "scripts": "%7B%22scriptIn%22%3A%5B%22If(STRIPE_ISLONG%3B%3D%3B1)%22%2C%22Abort(Stripe%20is%20too%20long.%20Please%20try%20again.%3BPU)%22%2C%22EndIf%22%2C%22Flag(STRIPE)%22%2C%22SetGlobalVar(STRIPE%3B1)%22%2C%22SetGlobalVar(SUBTITLE%3B0)%22%2C%22ExportSet(stripe_mode%3B2)%22%2C%22ExportSet(stripe_text%3B%E2%80%ABStripe-0)%22%2C%22Direct(SET%20STRIPE%201)%22%2C%22If(REDSTRIPE%3B%3D%3B1)%22%2C%22SetGlobalVar(REDSTRIPE%3B0)%22%2C%22AnimPlay(white_in)%22%2C%22Wait(200)%22%2C%22UnFlag(REDSTRIPE)%22%2C%22ItemOut(REDSTRIPE)%22%2C%22EndIf%22%2C%22If(POLLS%3B%3D%3B1)%22%2C%22UnFlag(POLLS)%22%2C%22ItemOut(POLLS)%22%2C%22Wait(1000)%22%2C%22EndIf%22%2C%22Wait(50)%22%2C%22AnimPlay(stripe_in)%22%5D%2C%22scriptChange%22%3A%5B%22If(STRIPE_ISLONG%3B%3D%3B1)%22%2C%22Abort(Stripe%20is%20too%20long.%20Please%20try%20again.%3BPU)%22%2C%22EndIf%22%2C%22Flag(STRIPE)%22%2C%22SetGlobalVar(SUBTITLE%3B0)%22%2C%22AnimPlay(stripe_change)%22%2C%22ItemOut(SUBTITLE)%22%2C%22Wait(300)%22%2C%22ExportSet(stripe_mode%3B2)%22%2C%22ExportSet(stripe_text%3B%E2%80%ABStripe-0)%22%5D%2C%22scriptOut%22%3A%5B%22UnFlag(STRIPE)%22%2C%22UnFlag(DETAILEDSTRIPE)%22%2C%22SetGlobalVar(STRIPE%3B0)%22%2C%22AnimPlay(stripe_out)%22%2C%22ItemOut(SUBTITLE)%22%2C%22Direct(SET%20STRIPE%200)%22%2C%22If(BOX_1%3B%3D%3B1)%22%2C%22UnFlag(BOX_1)%22%2C%22ItemOutUi(BOX_1)%22%2C%22Wait(250)%22%2C%22SetGlobalVar(BOX_1%3B0)%22%2C%22EndIf%22%2C%22If(BOX_2%3B%3D%3B1)%22%2C%22UnFlag(BOX_2)%22%2C%22ItemOutUi(BOX_2)%22%2C%22Wait(250)%22%2C%22SetGlobalVar(BOX_2%3B0)%22%2C%22EndIf%22%2C%22If(BOX_3%3B%3D%3B1)%22%2C%22UnFlag(BOX_3)%22%2C%22ItemOutUi(BOX_3)%22%2C%22Wait(250)%22%2C%22SetGlobalVar(BOX_3%3B0)%22%2C%22EndIf%22%5D%2C%22scriptPvw%22%3A%5B%22ExportSet(stripe_mode%3B2)%22%2C%22ExportSet(stripe_text%3B%E2%80%ABStripe-0)%22%2C%22AnimGoToField(stripe_in%3B100)%22%5D%7D"
                        },
                        "itemID": 1
                    }
                },
                {
                    "storySlug": "NO PAGE | alex",
                    "storyID": 488441575,
                    "item": [
                        {
                            "ncsItem": {
                                "item": {
                                    "itemSlug": "נ - Stripe-1",
                                    "objID": "",
                                    "objAir": "READY",
                                    "mosID": "NAMOS",
                                    "mosItemBrowserProgID": "alex",
                                    "mosItemEditorProgID": "alexE",
                                    "mosExternalMetadata": {
                                        "mosSchema": "A",
                                        "gfxItem": 37064,
                                        "gfxTemplate": 70281,
                                        "gfxProduction": 20011,
                                        "data": "%5B%222%22%2C%22%E2%80%ABStripe-1%22%5D",
                                        "scripts": "%7B%22scriptIn%22%3A%5B%22If(STRIPE_ISLONG%3B%3D%3B1)%22%2C%22Abort(Stripe%20is%20too%20long.%20Please%20try%20again.%3BPU)%22%2C%22EndIf%22%2C%22Flag(STRIPE)%22%2C%22SetGlobalVar(STRIPE%3B1)%22%2C%22SetGlobalVar(SUBTITLE%3B0)%22%2C%22ExportSet(stripe_mode%3B2)%22%2C%22ExportSet(stripe_text%3B%E2%80%ABStripe-1)%22%2C%22Direct(SET%20STRIPE%201)%22%2C%22If(REDSTRIPE%3B%3D%3B1)%22%2C%22SetGlobalVar(REDSTRIPE%3B0)%22%2C%22AnimPlay(white_in)%22%2C%22Wait(200)%22%2C%22UnFlag(REDSTRIPE)%22%2C%22ItemOut(REDSTRIPE)%22%2C%22EndIf%22%2C%22If(POLLS%3B%3D%3B1)%22%2C%22UnFlag(POLLS)%22%2C%22ItemOut(POLLS)%22%2C%22Wait(1000)%22%2C%22EndIf%22%2C%22Wait(50)%22%2C%22AnimPlay(stripe_in)%22%5D%2C%22scriptChange%22%3A%5B%22If(STRIPE_ISLONG%3B%3D%3B1)%22%2C%22Abort(Stripe%20is%20too%20long.%20Please%20try%20again.%3BPU)%22%2C%22EndIf%22%2C%22Flag(STRIPE)%22%2C%22SetGlobalVar(SUBTITLE%3B0)%22%2C%22AnimPlay(stripe_change)%22%2C%22ItemOut(SUBTITLE)%22%2C%22Wait(300)%22%2C%22ExportSet(stripe_mode%3B2)%22%2C%22ExportSet(stripe_text%3B%E2%80%ABStripe-1)%22%5D%2C%22scriptOut%22%3A%5B%22UnFlag(STRIPE)%22%2C%22UnFlag(DETAILEDSTRIPE)%22%2C%22SetGlobalVar(STRIPE%3B0)%22%2C%22AnimPlay(stripe_out)%22%2C%22ItemOut(SUBTITLE)%22%2C%22Direct(SET%20STRIPE%200)%22%2C%22If(BOX_1%3B%3D%3B1)%22%2C%22UnFlag(BOX_1)%22%2C%22ItemOutUi(BOX_1)%22%2C%22Wait(250)%22%2C%22SetGlobalVar(BOX_1%3B0)%22%2C%22EndIf%22%2C%22If(BOX_2%3B%3D%3B1)%22%2C%22UnFlag(BOX_2)%22%2C%22ItemOutUi(BOX_2)%22%2C%22Wait(250)%22%2C%22SetGlobalVar(BOX_2%3B0)%22%2C%22EndIf%22%2C%22If(BOX_3%3B%3D%3B1)%22%2C%22UnFlag(BOX_3)%22%2C%22ItemOutUi(BOX_3)%22%2C%22Wait(250)%22%2C%22SetGlobalVar(BOX_3%3B0)%22%2C%22EndIf%22%5D%2C%22scriptPvw%22%3A%5B%22ExportSet(stripe_mode%3B2)%22%2C%22ExportSet(stripe_text%3B%E2%80%ABStripe-1)%22%2C%22AnimGoToField(stripe_in%3B100)%22%5D%7D"
                                    }
                                }
                            },
                            "itemID": 1
                        },
                        {
                            "itemSlug": "נ - Stripe-2",
                            "objID": "",
                            "objAir": "READY",
                            "mosID": "NAMOS",
                            "mosItemBrowserProgID": "alex",
                            "mosItemEditorProgID": "alexE",
                            "mosExternalMetadata": {
                                "mosSchema": "A",
                                "gfxItem": 37066,
                                "gfxTemplate": 70281,
                                "gfxProduction": 20011,
                                "data": "%5B%222%22%2C%22%E2%80%ABStripe-2%22%5D",
                                "scripts": "%7B%22scriptIn%22%3A%5B%22If(STRIPE_ISLONG%3B%3D%3B1)%22%2C%22Abort(Stripe%20is%20too%20long.%20Please%20try%20again.%3BPU)%22%2C%22EndIf%22%2C%22Flag(STRIPE)%22%2C%22SetGlobalVar(STRIPE%3B1)%22%2C%22SetGlobalVar(SUBTITLE%3B0)%22%2C%22ExportSet(stripe_mode%3B2)%22%2C%22ExportSet(stripe_text%3B%E2%80%ABStripe-2)%22%2C%22Direct(SET%20STRIPE%201)%22%2C%22If(REDSTRIPE%3B%3D%3B1)%22%2C%22SetGlobalVar(REDSTRIPE%3B0)%22%2C%22AnimPlay(white_in)%22%2C%22Wait(200)%22%2C%22UnFlag(REDSTRIPE)%22%2C%22ItemOut(REDSTRIPE)%22%2C%22EndIf%22%2C%22If(POLLS%3B%3D%3B1)%22%2C%22UnFlag(POLLS)%22%2C%22ItemOut(POLLS)%22%2C%22Wait(1000)%22%2C%22EndIf%22%2C%22Wait(50)%22%2C%22AnimPlay(stripe_in)%22%5D%2C%22scriptChange%22%3A%5B%22If(STRIPE_ISLONG%3B%3D%3B1)%22%2C%22Abort(Stripe%20is%20too%20long.%20Please%20try%20again.%3BPU)%22%2C%22EndIf%22%2C%22Flag(STRIPE)%22%2C%22SetGlobalVar(SUBTITLE%3B0)%22%2C%22AnimPlay(stripe_change)%22%2C%22ItemOut(SUBTITLE)%22%2C%22Wait(300)%22%2C%22ExportSet(stripe_mode%3B2)%22%2C%22ExportSet(stripe_text%3B%E2%80%ABStripe-2)%22%5D%2C%22scriptOut%22%3A%5B%22UnFlag(STRIPE)%22%2C%22UnFlag(DETAILEDSTRIPE)%22%2C%22SetGlobalVar(STRIPE%3B0)%22%2C%22AnimPlay(stripe_out)%22%2C%22ItemOut(SUBTITLE)%22%2C%22Direct(SET%20STRIPE%200)%22%2C%22If(BOX_1%3B%3D%3B1)%22%2C%22UnFlag(BOX_1)%22%2C%22ItemOutUi(BOX_1)%22%2C%22Wait(250)%22%2C%22SetGlobalVar(BOX_1%3B0)%22%2C%22EndIf%22%2C%22If(BOX_2%3B%3D%3B1)%22%2C%22UnFlag(BOX_2)%22%2C%22ItemOutUi(BOX_2)%22%2C%22Wait(250)%22%2C%22SetGlobalVar(BOX_2%3B0)%22%2C%22EndIf%22%2C%22If(BOX_3%3B%3D%3B1)%22%2C%22UnFlag(BOX_3)%22%2C%22ItemOutUi(BOX_3)%22%2C%22Wait(250)%22%2C%22SetGlobalVar(BOX_3%3B0)%22%2C%22EndIf%22%5D%2C%22scriptPvw%22%3A%5B%22ExportSet(stripe_mode%3B2)%22%2C%22ExportSet(stripe_text%3B%E2%80%ABStripe-2)%22%2C%22AnimGoToField(stripe_in%3B100)%22%5D%7D"
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
    "mos": {
        "mosID": "NAMOS",
        "ncsID": "INEWS",
        "roStoryAppend": {
            "roID": "INEWS/SHOW.TEST.TEST01",
            "story": {
                "storySlug": "NO PAGE - 111",
                "storyID": 310519286,
                "item": {
                    "ncsItem": {
                        "item": {
                            "itemSlug": "TEST",
                            "objID": "GFX-12345",
                            "mosID": "NAMOS",
                            "mosItemBrowserProgID": "alexB",
                            "mosItemEditorProgID": "alexE",
                            "mosAbstract": "abstract"
                        }
                    },
                    "itemID": 1
                }
            }
        }
    }
}

const storyAsItComesToItemService = {
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

// The not-edited item struct
const itemType1 = {
    "ncsItem": {
        "item": {
            "itemSlug": "11",
            "objID": "",
            "objAir": "READY",
            "mosID": "NAMOS",
            "mosItemBrowserProgID": "alex",
            "mosItemEditorProgID": "alexE",
            "mosExternalMetadata": {
                "mosSchema": "A",
                "gfxItem": 0,
                "gfxTemplate": 90194,
                "gfxProduction": 20013,
                "data": "%5B%222%22%2C%22%E2%80%AB123%22%5D",
                "scripts": ""
            }
        }
    },
    "itemID": 1,
    "ord": 0
}

// Once the item edited from plugin - its struct became this
let itemType2 = {
    "itemSlug": "3",
    "objID": "",
    "objAir": "READY",
    "mosID": "NAMOS",
    "mosItemBrowserProgID": "alex",
    "mosItemEditorProgID": "alexE",
    "mosExternalMetadata": {
        "mosSchema": "A",
        "gfxItem": 63009,
        "gfxTemplate": 90194,
        "gfxProduction": 20013,
        "data": "%5B%222%22%2C%22%E2%80%AB%E2%80%AB333%22%5D",
        "scripts": ""
    },
    "itemID": 1,
    "ord": 0
}


const roItemReplace = {
    "mos": {
        "mosID": "NAMOS",
        "ncsID": "INEWS",
        "roItemReplace": {
            "roID": "INEWS/SHOW.TEST.TEST01",
            "storyID": 344081574,
            "itemID": 1,
            "item": {
                "ncsItem": {
                    "item": {
                        "itemSlug": "מגירה 1 - 111",
                        "objID": "",
                        "objAir": "READY",
                        "mosID": "NAMOS",
                        "mosItemBrowserProgID": "alex",
                        "mosItemEditorProgID": "alexE",
                        "mosExternalMetadata": {
                            "mosSchema": "A",
                            "gfxItem": 63034,
                            "gfxTemplate": 90199,
                            "gfxProduction": 20013,
                            "data": "data",
                            "scripts": ""
                        }
                    }
                },
                "itemID": 1
            }
        }
    }
}

const roStoryInsert = { 
    "mos": { 
        "mosID": "NAMOS", 
        "ncsID": "INEWS", 
        "roStoryInsert": { 
            "roID": "INEWS/SHOW.TEST.TEST01", 
            "storyID": 511853981, 
            "story": { 
                "storySlug": "NO PAGE - 2", 
                "storyID": 327304358, 
                "item": { 
                    "objID": ["", ""], 
                    "itemSlug": "מגירה 1 - 456", 
                    "objAir": "READY", 
                    "mosID": "NAMOS", 
                    "mosItemBrowserProgID": "alex", 
                    "mosItemEditorProgID": "alexE", 
                    "mosExternalMetadata": { 
                        "mosSchema": "A", 
                        "gfxItem": 63232,
                        "gfxTemplate": 90199, 
                        "gfxProduction": 20013, 
                        "data": "data", 
                        "scripts": "scripts" 
                    }, 
                    "itemID": 1 
                } 
            } 
        } 
    } 
}

// if we move something to last position
const roStoryMoveMultiple1 = {"mos":{"mosID":"NAMOS","ncsID":"INEWS","roStoryMoveMultiple":{"roID":"INEWS/SHOW.TEST.TEST01","storyID":[159532678,""]}}}

// Single story move
const roStoryMoveMultiple2 = {"mos":{"mosID":"NAMOS","ncsID":"INEWS","roStoryMoveMultiple":{"roID":"INEWS/SHOW.TEST.TEST01","storyID":[276973169,344081574]}}}

// 2 stories to last position
const roStoryMoveMultiple3 = {"mos":{"mosID":"NAMOS","ncsID":"INEWS","roStoryMoveMultiple":{"roID":"INEWS/SHOW.TEST.TEST01","storyID":[310527603,327304819,""]}}}

const roItemDelete = {
  mos: {
    mosID: 'NAMOS',
    ncsID: 'INEWS',
    roItemDelete: { 
        roID: 'INEWS/SHOW.TEST.TEST01', 
        storyID: 310527603, 
        itemID: 1 
    }
  }
}

const roItemInsert = {
    mos: {
        mosID: 'NAMOS',
        ncsID: 'INEWS',
        roItemInsert: {
            roID: 'INEWS/SHOW.TEST.TEST01',
            storyID: 109201375,
            itemID: 2,
            item: {
                itemSlug: "123",
                objAir: "READY",
                mosID: "NAMOS",
                mosItemBrowserProgID: "alex",
                mosItemEditorProgID: "alexE",
                mosExternalMetadata: {
                    mosSchema: "A",
                    gfxItem: 64312,
                    gfxTemplate: 90195,
                    gfxProduction: 20013,
                    data: "D",
                    scripts: "asdas"
                },
                itemID: 3
            }
        }
    }
}