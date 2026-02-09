import { promises as fsPromises } from 'fs';
import path from "path";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { JSDOM } from 'jsdom';
import appConfig from './app-config.js';
import logger from "./logger.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const debugMode = appConfig.debugMode;

/** 
 * Gets templates array @param templates. Takes template.source and injects scripts, css link and plugin panel.
 * Then, we store modified HTML in plugin/assets/templates, as [template.name].html.
 * Delete template.source from template. 
 * @return templates array without source prop.
 */
async function processAndWriteFiles(templates) {
     
    const templatesFolder = path.resolve(__dirname, "../../plugin/templates");
    try {
        await fsPromises.access(templatesFolder);
    } catch (error) {
        await fsPromises.mkdir(templatesFolder);
    }

    for (const template of templates) {
        const { uid, source, name, production } = template;
        const injectedHtml = htmlWrapper(source,uid, production,name);
        const filePath = path.join(templatesFolder, `${uid}.html`);
        await fsPromises.writeFile(filePath, injectedHtml, 'utf-8');
        delete template.source;
    }
    if (debugMode){
        logger(`Loaded ${templates.length} HTML templates from SQL to plugin/templates`);
    }
    return templates;
}

function htmlWrapper(htmlContent,templateUid, productionUid, templateName) {
    
    const dom = new JSDOM(htmlContent);
    const document = dom.window.document;
    
    // NEW: detect direction from inline <style> that targets only body/.body
    const detectedDir = detectDirFromBodyStyle(document);
    if (detectedDir) {
        document.body.classList.add(`na-doc-${detectedDir}`); // e.g., na-doc-rtl | na-doc-ltr
    }

    const scriptFileName = "../assets/iframe.js";

    const scriptTag = document.createElement('script');
    scriptTag.src = scriptFileName;

    // Create style tag to link external CSS file
    const styleTag = document.createElement('link');
    styleTag.rel = 'stylesheet';
    styleTag.href = "../assets/iframe.css";

    const pluginPanelDiv = createPluginPanel(document);
    const toolboxContentDiv = document.querySelector('.toolbox-title');

    if (toolboxContentDiv) {
        toolboxContentDiv.appendChild(pluginPanelDiv);
    } else {
        document.body.appendChild(pluginPanelDiv);
    }
    document.body.appendChild(createFavoritesDiv(document));
    document.body.appendChild(scriptTag);
    document.head.appendChild(styleTag);
    document.body.setAttribute('data-template', templateUid);  
    document.body.setAttribute('data-production', productionUid);  
    document.body.setAttribute('data-mos-id', appConfig.mosID);
    if(appConfig.previewPanelResize) {document.body.setAttribute('data-preview-resize',true);}
 

    // Add static category name in item name
    if(appConfig.addItemCategoryName){
        document.body.setAttribute('data-template-name', templateName.replace("%S%",""));     
    } else {
        document.body.setAttribute('data-template-name', "");     
    }

    const pane = createPreviewPane(document);
    //document.body.appendChild(pane);
    if (!pane.isConnected) {
        const toolbox = document.querySelector('.toolbox');   // the wrapper you described
        if (toolbox) {
            toolbox.appendChild(pane);                           
        } else {
          logger('[File-processor] .toolbox not found, appending Preview panel to <body> as fallback',"red");
          document.body.appendChild(pane);                     // fallback (shouldn't happen)
        }
    }

    return dom.serialize();
}

function createPluginPanel(document) {
    
    // Back button
    const backButton = createButton(document,"button","Back","navigateBack","pluginPanelBtn");
    
    //Create Reset btn
    const previewButton = createButton(document,"button","Reset Preview","preview","pluginPanelBtn");
    previewButton.setAttribute("data-preview-host", appConfig.previewServer);
    previewButton.setAttribute("data-preview-port", appConfig.previewPort);

    // Create drag btn
    const dragButton = createButton(document,"button","Save","drag","pluginPanelBtn");
    dragButton.draggable = true;
    
    // Create Link btn
    const linkButton = createButton(document,"button","Favorites","linkButton","pluginPanelBtn");
    
    // Create div with id "pluginPanel"
    const pluginPanelDiv = document.createElement('div');
    pluginPanelDiv.id = 'pluginPanel';
    pluginPanelDiv.classList.add('pluginPanel'); // Add the class to the pluginPanel div

    const promptSpan = createSpan(document, "promptSpan", "🟢");    

    // Append buttons to the "pluginPanel" div
    pluginPanelDiv.appendChild(backButton);
    pluginPanelDiv.appendChild(previewButton);
    pluginPanelDiv.appendChild(linkButton);

    // Create label
    const nameLabel = document.createElement('label');
    nameLabel.textContent = 'Name';
    nameLabel.setAttribute('for', 'nameInput'); // This should match the id of the input it labels
    
    // Create input field
    const nameInput = document.createElement('input');
    nameInput.id = 'nameInput';
    nameInput.name = 'name'; // 'name' attribute for form submission

    // Append label and input to the "pluginPanel" div
    pluginPanelDiv.appendChild(nameLabel);
    pluginPanelDiv.appendChild(nameInput);

    pluginPanelDiv.appendChild(dragButton);

    pluginPanelDiv.appendChild(promptSpan);


    return pluginPanelDiv;
}

function createButton(document,element,text,id,classList){
    const button = document.createElement(element);
    button.textContent  = text;
    button.id = id;
    button.classList.add(classList); 
    return button;
}

function createFavoritesDiv(document){
    const popupDiv = document.createElement('div');
    popupDiv.id = 'pluginPopover';
    popupDiv.setAttribute("data-modifier", appConfig.favoritesModifier);
    popupDiv.classList.add('pluginPopover');
    const favorites = appConfig.favorites;
    favorites.forEach(favorite => {
        const button = document.createElement('button');
        button.id = favorite.id;
        button.classList.add('linksButton');
        button.textContent = favorite.name;
        button.setAttribute("data-key",favorite.key);
        popupDiv.appendChild(button);
    });

    return popupDiv;
}

function createSpan(document,id, text){
    const span = document.createElement("span");
    span.textContent = text;
    span.id = id;
    return span;
}

function createPreviewPane(document) {
  
    const aside = document.createElement('aside');
    aside.id = 'previewPane';
    aside.setAttribute('aria-label', 'Preview');
    aside.innerHTML = `
      <div class="prw-header">Preview</div>
      <img id="previewImg" alt="Preview will appear here">
    `;
    return aside;
}

// Seeks for "dir" prop in inline css body selector
function detectDirFromBodyStyle(document) {
    // Grab all inline <style> contents
    const cssText = Array.from(document.querySelectorAll('style'))
      .map(s => s.textContent || '')
      .join('\n')
      // strip /* comments */
      .replace(/\/\*[\s\S]*?\*\//g, '');
  
    if (!cssText.trim()) return null;
  
    // Very simple block parser: selectors { declarations }
    const blockRE = /([^{}]+)\{([^}]*)\}/g;
    let m, dir = null;
  
    while ((m = blockRE.exec(cssText)) !== null) {
      const rawSelectors = m[1].trim();
      const declarations = m[2];
  
      // Split selectors and check ONLY 'body'
      const selectors = rawSelectors.split(',').map(s => s.trim());
      const targetsBody =
        selectors.some(sel => sel === 'body' || sel === '.body');
  
      if (!targetsBody) continue;
  
      // Look for "direction: rtl|ltr" inside the declaration block
      const d = /direction\s*:\s*(rtl|ltr)\b/i.exec(declarations);
      if (d) {
        dir = d[1].toLowerCase(); // last match wins
      }
    }
  
    return dir; // 'rtl' | 'ltr' | null
  }

export default processAndWriteFiles;
