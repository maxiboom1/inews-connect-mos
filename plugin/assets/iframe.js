// window.parent.funcName()

const originUrl = window.location.origin;
//document.getElementById('drag').addEventListener('dragstart', drag);
document.getElementById('drag').addEventListener('click', save);
document.querySelector("#navigateBack").addEventListener('click', () => { window.parent.hideIframe(); });

async function save() {
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
function getItemData() {
    const _NA_Values = __NA_GetValues();
    const _NA_Scripts = __NA_GetScripts();
    const template = document.body.getAttribute('data-template');
    const production = document.body.getAttribute('data-production');

    return values = {
        name: document.getElementById("nameInput").value,
        data: _NA_Values,
        scripts: _NA_Scripts,
        template: template,
        production: production
    }
}

function drag(event) {
    const msg = createMosMessage();
    event.dataTransfer.setData("text", msg);
}

function createMosMessage() {
    const templateId = document.body.getAttribute('data-template');
    const productionId = document.body.getAttribute('data-production');
    const gfxItem = document.body.getAttribute('data-gfxItem');
    const mosID = document.body.getAttribute('data-mos-id');
    let itemID = "";
    if (document.body.hasAttribute("data-itemID")) {
        itemID = document.body.getAttribute('data-itemID');
    }
    const data = __NA_GetValues();
    let scripts = JSON.stringify(__NA_GetScripts());

    // They have elements without scripts at all - this is fallback fot this case
    if (scripts === undefined) { scripts = "  "; }

    const itemSlug = document.getElementById("nameInput").value.replace(/'/g, "")

    return `<mos><ncsItem><item>
                <itemSlug>${itemSlug}</itemSlug>
                <objID></objID>
                <objAir>READY</objAir>
                <mosID>${mosID}</mosID>
                <mosItemBrowserProgID>alex</mosItemBrowserProgID>
                <mosItemEditorProgID>alexE</mosItemEditorProgID>
                <mosExternalMetadata>
                    <mosSchema>A</mosSchema>
                    <gfxItem>${gfxItem === null ? "0" : gfxItem}</gfxItem>
                    <gfxTemplate>${templateId}</gfxTemplate>
                    <gfxProduction>${productionId}</gfxProduction>
                    <data>${JSON.stringify(data).slice(1, -1)}</data>
                    <scripts>${scripts.slice(1, -1)}</scripts>
                </mosExternalMetadata></item></ncsItem>
            </mos>`;
}

function setGfxItem(gfxItem) { document.body.setAttribute("data-gfxItem", gfxItem); }

function getGfxItem() { return document.body.getAttribute("data-gfxItem"); }

// Internal inews id
function setItemID(itemID) { document.body.setAttribute("data-itemID", itemID); }

// Internal inews id
function getItemID() { return document.body.getAttribute("data-itemID"); }

// ======================== Item name based on input (triggered from template func updateName()), or from renderItem onload ================== \\

// Onload, we showing the name that we receive from renderItem, 
//and its return name with template name, so we use includedTemplateName bool to handle this case
function nameInputUpdate(name, includedTemplateName = false) {
    if (includedTemplateName) {
        document.getElementById("nameInput").value = name;
        if (document.getElementById("nameInput").value === "") {
            const staticHeader = document.body.getAttribute('data-template-name');
        }
        return;
    }
    const staticHeader = document.body.getAttribute('data-template-name');
    let result = staticHeader + name;

    if (result.length > 40) {
        result = result.substring(0, 40);
    }

    document.getElementById("nameInput").value = result;
}

function setNameOnLoad() {
    const staticHeader = document.body.getAttribute('data-template-name');
    document.getElementById("nameInput").value = staticHeader;
}

document.addEventListener('UpdateNameEvent', function (event) { nameInputUpdate(event.detail.name); });

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

        // Check if the appropriate modifier key is pressed
        const isModifierPressed =
            (modifier === 'ctrl' && event.ctrlKey) ||
            (modifier === 'alt' && event.altKey) ||
            (modifier === 'shift' && event.shiftKey);

        if (buttonData[keyPressed] && isModifierPressed) {
            window.parent.renderTemplate(buttonData[keyPressed]);
        }

        if ((keyPressed === "s" || keyPressed === "ד") && event.ctrlKey) {
            await save();
        }

    });

})

function handleLinksButtonsClick() { window.parent.renderTemplate(this.id); }

// Indication for user on "ctrl+s" with green dot
function showPrompt() {
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

// Reset Preview server handler
document.getElementById('preview').addEventListener('click', async () => {
    const previewHost = document.getElementById("preview").getAttribute("data-preview-host");
    const previewPort = document.getElementById("preview").getAttribute("data-preview-port");
    await fetch(`http://${previewHost}:${previewPort}?reset`, { method: 'GET' });
});

const debouncedInput = debounce(async function (text) {
    const scripts = __NA_GetScripts();
    const templateId = document.body.getAttribute('data-template');
    const previewHost = document.getElementById("preview").getAttribute("data-preview-host");
    const previewPort = document.getElementById("preview").getAttribute("data-preview-port");
    const uuid = uuidV4Dashless();
    
    // Send templateId and scripts to preview server
    await fetch(`http://${previewHost}:${previewPort}?${encodeURIComponent(uuid)},${templateId},${scripts}`, { method: 'GET' });
    showPrwImage(uuid);
}, 500);

document.body.addEventListener('input', function (event) {
    const target = event.target;
    // Check if the event target is an input or textarea
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        // Call the debounced function
        debouncedInput(`Input changed: ${target.value}`);
    }
});

document.body.addEventListener('change', function (event) {
    const target = event.target;
    // Check if the event target is a select element, a checkbox, or a radio button
    if (target.tagName === 'SELECT' || (target.tagName === 'INPUT' && (target.type === 'checkbox' || target.type === 'radio'))) {
        // Call the debounced function
        debouncedInput(`Input changed: ${target.value}`);
    }
});

// RFC4122 v4 (dashless) using Web Crypto, with a safe fallback.
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
    console.log('[PRW HEAD]', url, res.status, res.statusText);
    return res.status;
  } catch (err) {
    console.error('[PRW HEAD] fetch error:', err);
    return -1; // signal network error
  }
}

async function showPrwImage(uuid) {
  try {
    const url = `http://localhost:3000/prw/${uuid}.jpg`;
    const maxTries = 10;
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

