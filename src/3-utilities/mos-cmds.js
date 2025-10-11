import appConfig from "./app-config.js";

class MosCommands {
    
    constructor() {
        this.mosID = appConfig.mosID.toString(); // Store mosID once onload
        this.ncsID = appConfig.ncsID.toString(); // Store ncsID once onload
    }

    reqMachInfo() {
        return `<mos>
            <mosID>${this.mosID}</mosID>
            <ncsID>${this.ncsID}</ncsID>
            <reqMachInfo/>
        </mos>`;
    }

    roReqAll() {
        return `<mos>
            <mosID>${this.mosID}</mosID>
            <ncsID>${this.ncsID}</ncsID>
            <roReqAll/>   
            </mos>`;
    }   

    roReq (roID){
        return `<mos>
            <mosID>${this.mosID}</mosID>
            <ncsID>${this.ncsID}</ncsID>
            <roReq>
                <roID>${roID.toString()}</roID> 
            </roReq>       
        </mos>`;
    }

    mosDelimiter(){
        const delimiter = Buffer.from([0x00, 0x3C, 0x00, 0x2F, 0x00, 0x6D, 0x00, 0x6F, 0x00, 0x73, 0x00, 0x3E]); // </mos> in UTF-8
        return delimiter;
    }

    mosItemReplace(story, el, newUid){
        const msg =  `
            <mos>
                <mosID>${this.mosID}</mosID>
                <ncsID>${this.ncsID}</ncsID>
                <mosItemReplace>
                    <roID>${story.roID}</roID>
                    <storyID>${story.storyID}</storyID>
                        <item>
                            <itemID>${el.itemID}</itemID>
                            ${el.type===1?"<ncsItem><item>":""}
                            <itemSlug>${el.itemSlug}</itemSlug>
                            <objID></objID>
                            <objAir>READY</objAir>
                            <mosID>${el.mosID}</mosID>
                            <mosItemBrowserProgID>${el.mosItemBrowserProgID}</mosItemBrowserProgID>
                            <mosItemEditorProgID>${el.mosItemEditorProgID}</mosItemEditorProgID>
                            <mosExternalMetadata>
                                <mosSchema>A</mosSchema>
                                <gfxItem>${newUid}</gfxItem>
                                <gfxTemplate>${el.mosExternalMetadata.gfxTemplate}</gfxTemplate>
                                <gfxProduction>${el.mosExternalMetadata.gfxProduction}</gfxProduction>
                                <data>${el.mosExternalMetadata.data}</data>
                                <scripts>${el.mosExternalMetadata.scripts}</scripts>
                            </mosExternalMetadata>
                            ${el.type===1?"</item></ncsItem>":""}
                        </item>
                </mosItemReplace>
            </mos>`;             

            const result = {
                replaceMosMessage: msg,
                storyID: story.storyID
            };
            
            return result;
    }


}

const mosCommands = new MosCommands();
export default mosCommands;