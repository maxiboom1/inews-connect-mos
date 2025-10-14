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