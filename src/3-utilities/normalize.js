function replaceAndNormalizeSpaces(str) {
    // Replace `+-+`, `+`, and `-` with a space
    let result = str.replace(/\+-\+|\+|-/g, ' ');
    
    // Replace multiple spaces with a single space
    result = result.replace(/\s+/g, ' ').trim();

    return result;
}

/**
 * Normalize msg.mos.roListAll so roID/roSlug are arrays
 * and, for each item, keep only the substring after the first "/" ("/" removed).
 * Returns the normalized roListAll object.
 */
function normalizeRoListAll(msg) {
    const asArray = v => v == null ? [] : (Array.isArray(v) ? v : [v]);
  
    const cutAfterFirstSlash = s => {
      if (typeof s !== 'string') return s;
      const str = s.trim();
      const i = str.indexOf('/');
      return i >= 0 ? str.slice(i + 1) : str; // if no "/", leave as-is
    };
  
    const ro = msg?.mos?.roListAll ?? {};
  
    const roID = asArray(ro.roID).filter(Boolean).map(cutAfterFirstSlash);
    const roSlug = asArray(ro.roSlug).filter(Boolean).map(cutAfterFirstSlash);
  
    ro.roID = roID;
    ro.roSlug = roSlug;
  
    return msg.mos.roListAll;
}

// Since there is 2 types of items - with and without <ncsItem> - here we normalize both cases to non-ncsItem version 
// Also, add type prop: type-1 = <ncsItem> type, type-2 = non-ncsItem type. We need to save the original item format since we must 
// send mosItemReplace in same format.
function normalizeItem(item){
    if (item === undefined) return [];
    if(item && item.ncsItem && item.ncsItem.item){
        Object.assign(item, item.ncsItem.item);
        delete item.ncsItem;
        item.type = 1;
    } else {
        item.type = 2;
    }
    return item;
} 

export default { replaceAndNormalizeSpaces, normalizeRoListAll, normalizeItem }
    