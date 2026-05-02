const originUrl = window.location.origin;
const previewExportDir = document.body.getAttribute('data-preview-exportDir');
const prwPath = document.body.getAttribute('data-preview-path');
const exportPrwExtension = document.body.getAttribute('data-preview-extension');
const pluginPrwExtension = ".jpg";

document.getElementById('drag').addEventListener('click', save);
document.getElementById('syncButton').addEventListener('click', sendSyncRequest);
document.querySelector("#navigateBack").addEventListener('click', ()=>{window.parent.hideIframe();});
document.getElementById('exportPngBtn').addEventListener('click', () => {exportPng();});

// Events from templates (Shabi HTML's)
document.addEventListener('UpdateNameEvent', function(event) {nameInputUpdate(event.detail.name);}); 
document.addEventListener('userMediaSelectionEvent', function(event) {updatePrw();}); 

async function save(){
    // Try copying with Clipboard API
    if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(createMosMessage());
    } else {
        // Fallback method
        const tempTextarea = document.createElement("textarea");
        tempTextarea.value = createMosMessage();
        document.body.appendChild(tempTextarea);
        tempTextarea.select();
        document.execCommand("copy");
        document.body.removeChild(tempTextarea);
        console.warn("Clipboard API not available; used fallback method.");
    }
    showPrompt();
}
// returns item{name,data,scripts,templateId,productionId}
function getItemData(){
        const _NA_Values = __NA_GetValues().replace(/\\'/g, "%27");
        const _NA_Scripts = __NA_GetScripts().replace(/\\'/g, "%27");
        const template = document.body.getAttribute('data-template');
        const production = document.body.getAttribute('data-production');

        return values = {
            name:document.getElementById("nameInput").value,
            data: _NA_Values,
            scripts: _NA_Scripts,
            template: template,
            production: production
        }        
} 

function drag(event) { 
    const msg = createMosMessage();
    event.dataTransfer.setData("text",msg);
}

function createMosMessage(){
    const templateId = document.body.getAttribute('data-template');
    const productionId = document.body.getAttribute('data-production');
    const gfxItem = document.body.getAttribute('data-gfxItem');
    const mosID = document.body.getAttribute('data-mos-id');
    let itemID = "";
    if(document.body.hasAttribute("data-itemID")){
        itemID = document.body.getAttribute('data-itemID');
    }
    const data = __NA_GetValues().replace(/\\'/g, "%27");
    let scripts = __NA_GetScripts().replace(/\\'/g, "%27");    
    
    // They have elements without scripts at all - this is fallback fot this case
    if(scripts === undefined) {scripts = "  ";}

    const itemSlug = document.getElementById("nameInput").value.replace(/'/g, "").replace(/&/g, "");
    return `<mos><ncsItem><item>
                <itemSlug>${itemSlug}</itemSlug>
                <objID></objID>
                <objAir>READY</objAir>
                <mosID>${mosID}</mosID>
                <mosItemBrowserProgID>alex</mosItemBrowserProgID>
                <mosItemEditorProgID>alexE</mosItemEditorProgID>
                <mosExternalMetadata>
                    <mosSchema>A</mosSchema>
                    <gfxItem>${gfxItem === null? "0": gfxItem}</gfxItem>
                    <gfxTemplate>${templateId}</gfxTemplate>
                    <gfxProduction>${productionId}</gfxProduction>
                    <data>${data}</data>
                    <scripts>${scripts}</scripts>
                </mosExternalMetadata></item></ncsItem>
            </mos>`;
}

function setGfxItem(gfxItem){document.body.setAttribute("data-gfxItem",gfxItem);}

function getGfxItem(){return document.body.getAttribute("data-gfxItem");}

// Internal inews id
function setItemID(itemID){document.body.setAttribute("data-itemID",itemID);}

// Internal inews id
function getItemID(){return document.body.getAttribute("data-itemID");}

// ======================== Item name based on input (triggered from template func updateName()), or from renderItem onload ================== \\

// Onload, we showing the name that we receive from renderItem, 
//and its return name with template name, so we use includedTemplateName bool to handle this case
function nameInputUpdate(name, includedTemplateName = false){ 
    
    // I found some control chars related to hebrew that inews cant handle - so i clean it here 
    const stripBidi = (s = "") => String(s).replace(/[\u200E\u200F\u202A-\u202E\u2066-\u2069]/g, "");
    
    if(includedTemplateName){
        document.getElementById("nameInput").value = name;
        if(document.getElementById("nameInput").value === ""){
            const staticHeader = document.body.getAttribute('data-template-name');
        }
        return;
    }
    const staticHeader = document.body.getAttribute('data-template-name');
    let result = staticHeader + name;
    
    if(result.length>40){
        result = result.substring(0,40);
    }

    document.getElementById("nameInput").value = stripBidi(result);    
}

function setNameOnLoad(){
    const staticHeader = document.body.getAttribute('data-template-name');
    document.getElementById("nameInput").value = staticHeader;   
}

// ======================== Favorites ========================
document.addEventListener('DOMContentLoaded', () => {
    const linkButton = document.getElementById('linkButton');
    const popover = document.getElementById('pluginPopover');
    
    linkButton.addEventListener('mouseover', (e) => {
        const rect = linkButton.getBoundingClientRect();
        popover.style.top = `${rect.bottom + window.scrollY}px`;
        popover.style.left = `${rect.left + window.scrollX}px`;
        popover.style.display = 'block';
      });
    
    linkButton.addEventListener('mouseout', () => {
    popover.style.display = 'none';
    });

    popover.addEventListener('mouseover', () => {
    popover.style.display = 'block';
    });

    popover.addEventListener('mouseout', () => {
    popover.style.display = 'none';
    });

    var favoritesButtons = document.querySelectorAll(".linksButton");
    const buttonData = {};
    favoritesButtons.forEach(button => {
        const id = button.id;
        const key = button.getAttribute("data-key");
        buttonData[key] = id;
        button.addEventListener('click', handleLinksButtonsClick, false);
    });

    // Handle key handler to change to favorite
    document.addEventListener("keydown", async (event) => {
        const modifier = document.getElementById("pluginPopover").getAttribute("data-modifier"); // Return string "alt"/"ctrl"/"shift"
        const keyPressed = event.key.toLowerCase();

        if (isPreviewOpenShortcut(event)) {
            event.preventDefault();
            if (typeof window.openPreviewPanel === 'function') {
                window.openPreviewPanel();
            }
            return;
        }
        
        // Check if the appropriate modifier key is pressed
        const isModifierPressed = 
            (modifier === 'ctrl' && event.ctrlKey) ||
            (modifier === 'alt' && event.altKey) ||
            (modifier === 'shift' && event.shiftKey);
        
            if (buttonData[keyPressed]&& isModifierPressed) {
                window.parent.renderTemplate(buttonData[keyPressed]);
            }

            if ((keyPressed === "s" || keyPressed === "ד") && event.ctrlKey) {
                await save();
            }
    
    });

}) 

function handleLinksButtonsClick(){window.parent.renderTemplate(this.id);}

function isPreviewOpenShortcut(event) {
    const shortcut = getPreviewOpenShortcutConfig();
    if (!shortcut) return false;

    if (!isShortcutKeyPressed(event, shortcut.key)) return false;

    return ['ctrl', 'alt', 'shift'].every((modifier) => {
        return shortcut.modifiers.includes(modifier) === isShortcutModifierPressed(event, modifier);
    });
}

function getPreviewOpenShortcutConfig() {
    const modifier1 = normalizeShortcutValue(document.body.getAttribute('data-preview-open-shortcut-modifier1'));
    const modifier2 = normalizeShortcutValue(document.body.getAttribute('data-preview-open-shortcut-modifier2'));
    const key = normalizeShortcutValue(document.body.getAttribute('data-preview-open-shortcut-key'));
    const modifiers = [modifier1, modifier2].filter(Boolean);
    const supportedModifiers = ['ctrl', 'alt', 'shift'];

    if (!key || modifiers.length === 0) return null;
    if (!modifiers.every((modifier) => supportedModifiers.includes(modifier))) return null;
    if (new Set(modifiers).size !== modifiers.length) return null;

    return { key, modifiers };
}

function normalizeShortcutValue(value) {
    return String(value || '').trim().toLowerCase();
}

function isShortcutKeyPressed(event, configuredKey) {
    const eventKey = normalizeShortcutValue(event.key);
    if (eventKey === configuredKey) return true;

    if (/^[a-z]$/.test(configuredKey)) {
        const expectedCode = `key${configuredKey}`;
        if (normalizeShortcutValue(event.code) === expectedCode) return true;
    }

    const aliases = {
        p: ['פ', 'ף']
    };

    return (aliases[configuredKey] || []).includes(eventKey);
}

function isShortcutModifierPressed(event, modifier) {
    if (modifier === 'ctrl') return event.ctrlKey;
    if (modifier === 'alt') return event.altKey;
    if (modifier === 'shift') return event.shiftKey;
    return false;
}

// Indication for user on "ctrl+s" with green dot
function showPrompt(){
    const promptSpan = document.getElementById('promptSpan');
    promptSpan.style.display = "block";

    setTimeout(() => {
        promptSpan.style.display = "none";
    }, 2000);
}

// ========================================= Preview server ========================================= \\

// Core debouncing function
const debounce = (func, wait) => {
    let timeout;
  
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
  
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
};

// Reset Preview server handler - check if we need this?
document.getElementById('preview').addEventListener('click', async ()=>{
    const previewHost = document.getElementById("preview").getAttribute("data-preview-host");
    const previewPort = document.getElementById("preview").getAttribute("data-preview-port");
    await fetch(`http://${previewHost}:${previewPort}?reset`,{method:'GET'});
});

const debouncedInput = debounce(async function() {
    const r = await getDataForPrwRequest();
    const path = encodeURIComponent(`${prwPath}${r.uuid}${pluginPrwExtension}`);
    await fetch(`http://${r.previewHost}:${r.previewPort}?${path},${r.templateId},${r.scripts}`, { method: 'GET' });
    showPrwImage(r.uuid);
}, 500);

document.body.addEventListener('input', function(event) {
    const target = event.target;
    // Check if the event target is an input or textarea
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        // Call the debounced function
        debouncedInput(`Input changed: ${target.value}`);
    }
});

document.body.addEventListener('change', function(event) {
    const target = event.target;
    // Check if the event target is a select element, a checkbox, or a radio button
    if (target.tagName === 'SELECT' || (target.tagName === 'INPUT' && (target.type === 'checkbox' || target.type === 'radio'))) {
        // Call the debounced function
        debouncedInput(`Input changed: ${target.value}`);
    }
});

function uuidV4Dashless() {
  
    if (window.crypto && crypto.randomUUID) {
        return crypto.randomUUID().replace(/-/g, "");
    }
    if (window.crypto && crypto.getRandomValues) {
        const bytes = new Uint8Array(16);
        crypto.getRandomValues(bytes);
        bytes[6] = (bytes[6] & 0x0f) | 0x40; // version 4
        bytes[8] = (bytes[8] & 0x3f) | 0x80; // variant 10
        return Array.from(bytes, b => b.toString(16).padStart(2, "0")).join("");
    }
    // Non-crypto last resort
    return "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx".replace(/x/g, () =>
        (Math.random() * 16 | 0).toString(16)
    );
}

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function fetchHeadData(url) {
  try {
    const res = await fetch(url, { method: 'HEAD', cache: 'no-store' });
    //console.log('[PRW HEAD]', url, res.status, res.statusText);
    return res.status;
  } catch (err) {
    console.error('[PRW HEAD] fetch error:', err);
    return -1; // signal network error
  }
}

async function getDataForPrwRequest(){
  return{
    scripts: __NA_GetScripts(),
    templateId: document.body.getAttribute('data-template'),
    previewHost: document.getElementById("preview").getAttribute("data-preview-host"),
    previewPort: document.getElementById("preview").getAttribute("data-preview-port"),
    uuid: uuidV4Dashless()
  }
}

async function showPrwImage(uuid) {
  try {
    const url = `${originUrl}/prw/${uuid}${pluginPrwExtension}`;
    const maxTries = 20;
    const interval = 500;

    for (let i = 0; i < maxTries; i++) {
      const status = await fetchHeadData(url);
      if (status === 200) {
        const img = document.getElementById('previewImg');
        if (img) img.src = url;
        console.log('[PRW] ready:', url);
        break;
      }
      if (i < maxTries - 1) await sleep(interval);
    }
  } catch (e) {
    console.error('[PRW HEAD] setup error:', e);
  }
}

async function exportPng(){
  const r = await getDataForPrwRequest();// Returns {scripts,templateId,previewHost,previewPort,uuid}
  const filename = (document.getElementById("nameInput").value).replace(/ /g, "-"); // The replace is guard for spaces some eng not rendering it wit spaces
  const path = encodeURIComponent(previewExportDir + filename + exportPrwExtension);
  await fetch(`http://${r.previewHost}:${r.previewPort}?${path},${r.templateId},${r.scripts}`, { method: 'GET' });
  showPrwToast(`Export request sent → ${decodeURIComponent(path)}`, 4500);
}

let prwToastTimer = null;

function showPrwToast(message, delay = 2500) {
  const el = document.getElementById("prwToast");
  if (!el) return;

  el.textContent = message;
  el.classList.add("is-visible");

  if (prwToastTimer) clearTimeout(prwToastTimer);
  prwToastTimer = setTimeout(() => {
    el.classList.remove("is-visible"); 
  }, delay);
}

async function sendSyncRequest(){
  const gfxItem = document.body.getAttribute('data-gfxItem');
  const url = `${originUrl}/api/story-sync/${gfxItem}`;
  const resp = await fetch(url, { method: "POST" });
  const data = await resp.json(); // <-- this is { ok: false/true }
  if(data.ok){
    showPrwToast("Story Rebuilded. Please exist the story to finish sync with NewsArts and re-open item again.",20000);
  } else {
    showPrwToast("Unregistred item. Try to save story, or turn on rundown MOS monitor.", 5000);
  }
}
  
// Trigger only on item render - ignore on template render
function updatePrw(){debouncedInput();}


// ========================================= Preview panel ========================================= \\


(function initPreviewSplitter() {
  const toolbox = document.querySelector('.toolbox');
  const previewPane = document.getElementById('previewPane');
  const isResizeActive = document.body.getAttribute('data-preview-resize');
  if (!toolbox || !previewPane || isResizeActive != "true") return;

  // create splitter once
  let splitter = document.getElementById('prwSplitter');
  if (!splitter) {
    splitter = document.createElement('div');
    splitter.id = 'prwSplitter';
    splitter.setAttribute('role', 'separator');
    splitter.setAttribute('aria-label', 'Resize preview');
    previewPane.parentNode.insertBefore(splitter, previewPane);
  }

  moveTemplateToolboxChildren(toolbox, previewPane, splitter);

  const layoutButtons = initPreviewNavbar(toolbox, previewPane, splitter);

  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
  const getClientX = (evt) =>
    (evt.touches && evt.touches[0] ? evt.touches[0].clientX : evt.clientX);
  const getClientY = (evt) =>
    (evt.touches && evt.touches[0] ? evt.touches[0].clientY : evt.clientY);

  let dragging = false;
  let startX = 0;
  let startY = 0;
  let startWidth = 0;
  let startHeight = 0;
  let activePlacement = 'right';

  // read current preview width (from css var or from actual rect)
  const getCurrentPreviewWidth = () => {
    const v = getComputedStyle(toolbox).getPropertyValue('--prw-width').trim();
    if (v.endsWith('px')) {
      const n = parseFloat(v);
      if (!Number.isNaN(n) && n > 0) return n;
    }
    // fallback: actual rendered width
    return previewPane.getBoundingClientRect().width || 360;
  };

  const getCurrentPreviewHeight = () => {
    const v = getComputedStyle(toolbox).getPropertyValue('--prw-height').trim();
    if (v.endsWith('px')) {
      const n = parseFloat(v);
      if (!Number.isNaN(n) && n > 0) return n;
    }
    return previewPane.getBoundingClientRect().height || 280;
  };

  const setActiveLayoutButton = (placement) => {
    layoutButtons.forEach((button) => {
      const isActive = button.getAttribute('data-prw-layout') === placement;
      button.classList.toggle('is-active', isActive);
      button.setAttribute('aria-pressed', String(isActive));
    });
  };

  const applyPreviewPlacement = (placement) => {
    if (placement !== 'bottom' && placement !== 'left' && placement !== 'right') return;

    activePlacement = placement;
    toolbox.classList.remove('prw-layout-left', 'prw-layout-right', 'prw-layout-bottom', 'prw-preview-closed');
    toolbox.classList.add(`prw-layout-${placement}`);
    splitter.setAttribute('aria-orientation', placement === 'bottom' ? 'horizontal' : 'vertical');
    setActiveLayoutButton(placement);
  };

  const closePreviewPanel = () => {
    toolbox.classList.remove('prw-layout-left', 'prw-layout-right', 'prw-layout-bottom');
    toolbox.classList.add('prw-preview-closed');
  };

  const openPreviewPanel = () => {
    applyPreviewPlacement(activePlacement);
  };

  window.openPreviewPanel = openPreviewPanel;

  const onMove = (e) => {
    if (!dragging) return;
    e.preventDefault();

    const rect = toolbox.getBoundingClientRect();
    if (activePlacement === 'bottom') {
      const y = getClientY(e);
      const deltaY = y - startY;
      let newHeight = startHeight - deltaY;
      const min = 160;
      const max = Math.max(220, rect.height - 180);
      newHeight = clamp(Math.round(newHeight), min, max);
      toolbox.style.setProperty('--prw-height', `${newHeight}px`);
      return;
    }

    const x = getClientX(e);

    const deltaX = x - startX;

    let newWidth = activePlacement === 'left'
      ? startWidth + deltaX
      : startWidth - deltaX;

    const min = 220;
    const max = Math.max(260, rect.width - 220);
    newWidth = clamp(Math.round(newWidth), min, max);

    toolbox.style.setProperty('--prw-width', `${newWidth}px`);
  };

  const onUp = (e) => {
    if (!dragging) return;
    e.preventDefault();

    dragging = false;
    toolbox.classList.remove('prw-resizing');

    window.removeEventListener('mousemove', onMove);
    window.removeEventListener('mouseup', onUp);
    window.removeEventListener('touchmove', onMove);
    window.removeEventListener('touchend', onUp);
  };

  const onDown = (e) => {
    e.preventDefault();

    dragging = true;
    toolbox.classList.add('prw-resizing');

    startX = getClientX(e);
    startY = getClientY(e);
    startWidth = getCurrentPreviewWidth();
    startHeight = getCurrentPreviewHeight();

    window.addEventListener('mousemove', onMove, { passive: false });
    window.addEventListener('mouseup', onUp, { passive: false });
    window.addEventListener('touchmove', onMove, { passive: false });
    window.addEventListener('touchend', onUp, { passive: false });
  };

  splitter.addEventListener('mousedown', onDown);
  splitter.addEventListener('touchstart', onDown, { passive: false });

  layoutButtons.forEach((button) => {
    button.addEventListener('click', () => {
      applyPreviewPlacement(button.getAttribute('data-prw-layout'));
    });
  });

  const closeButton = previewPane.querySelector('.prw-close-btn');
  if (closeButton) closeButton.addEventListener('click', closePreviewPanel);

  applyPreviewPlacement('right');
})();

function initPreviewNavbar(toolbox, previewPane, splitter) {
  const header = previewPane.querySelector('.prw-header');
  if (!header) return [];

  header.textContent = '';
  header.classList.add('prw-navbar');

  const title = document.createElement('span');
  title.className = 'prw-navbar-title';
  title.textContent = 'Preview panel';

  const controls = document.createElement('div');
  controls.className = 'prw-navbar-controls';

  const leftButton = createPreviewNavbarButton('left', 'Place preview on left');
  leftButton.appendChild(createPreviewLayoutIcon('left'));

  const bottomButton = createPreviewNavbarButton('bottom', 'Place preview on bottom');
  bottomButton.appendChild(createPreviewLayoutIcon('bottom'));

  const rightButton = createPreviewNavbarButton('right', 'Place preview on right');
  rightButton.appendChild(createPreviewLayoutIcon('right'));

  const closeButton = document.createElement('button');
  closeButton.type = 'button';
  closeButton.className = 'prw-close-btn';
  closeButton.setAttribute('aria-label', 'Close preview panel');
  closeButton.textContent = 'x';

  controls.appendChild(leftButton);
  controls.appendChild(bottomButton);
  controls.appendChild(rightButton);
  controls.appendChild(closeButton);

  header.appendChild(title);
  header.appendChild(controls);

  return [leftButton, bottomButton, rightButton];
}

function createPreviewNavbarButton(layout, label) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'prw-layout-btn';
  button.setAttribute('data-prw-layout', layout);
  button.setAttribute('aria-label', label);
  button.setAttribute('aria-pressed', 'false');
  return button;
}

function createPreviewLayoutIcon(layout) {
  const icon = document.createElement('span');
  icon.className = `prw-layout-icon prw-layout-icon-${layout}`;
  icon.setAttribute('aria-hidden', 'true');

  const primaryPane = document.createElement('span');
  primaryPane.className = 'prw-layout-icon-primary';

  const previewPane = document.createElement('span');
  previewPane.className = 'prw-layout-icon-preview';

  icon.appendChild(primaryPane);
  icon.appendChild(previewPane);

  return icon;
}

function moveTemplateToolboxChildren(toolbox, previewPane, splitter) {
  const content = Array.from(toolbox.children).find((child) =>
    child.classList.contains('toolbox-content')
  );
  if (!content) return;

  Array.from(toolbox.children).forEach((child) => {
    if (
      child === content ||
      child === previewPane ||
      child === splitter ||
      child.classList.contains('toolbox-header')
    ) {
      return;
    }

    content.appendChild(child);
  });
}
