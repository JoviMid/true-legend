// Import document classes.
import { TrueLegendActor } from './documents/actor.mjs';
import { TrueLegendItem } from './documents/item.mjs';
// Import sheet classes.
import { TrueLegendActorSheet } from './sheets/actor-sheet.mjs';
import { TrueLegendItemSheet } from './sheets/item-sheet.mjs';
// Import helper/utility classes and constants.
import { preloadHandlebarsTemplates } from './helpers/templates.mjs';
import { TRUE_LEGEND } from './helpers/config.mjs';
// Import DataModel classes
import * as models from './data/_module.mjs';

/* -------------------------------------------- */
/*  Init Hook                                   */
/* -------------------------------------------- */

Hooks.once('init', function () {
  // Add utility classes to the global game object so that they're more easily
  // accessible in global contexts.
  game.truelegend = {
    TrueLegendActor,
    TrueLegendItem,
    rollItemMacro,
  };

  // Add custom constants for configuration.
  CONFIG.TRUE_LEGEND = TRUE_LEGEND;

  /**
   * Set an initiative formula for the system
   * @type {String}
   */
  
 // CONFIG.Combat.initiative.formula = getInitiativeFormula(someSum);
  CONFIG.Combat.initiative = {
    formula: '1d20 + @abilities.dex.mod',
    decimals: 2,
  };

  // Define custom Document and DataModel classes
  CONFIG.Actor.documentClass = TrueLegendActor;

  // Note that you don't need to declare a DataModel
  // for the base actor/item classes - they are included
  // with the Character/NPC as part of super.defineSchema()
  CONFIG.Actor.dataModels = {
    character: models.TrueLegendCharacter,
    npc: models.TrueLegendNPC
  }
  CONFIG.Item.documentClass = TrueLegendItem;
  CONFIG.Item.dataModels = {
    item: models.TrueLegendItem,
    feature: models.TrueLegendFeature,
    spell: models.TrueLegendSpell
  }

  // Active Effects are never copied to the Actor,
  // but will still apply to the Actor from within the Item
  // if the transfer property on the Active Effect is true.
  CONFIG.ActiveEffect.legacyTransferral = false;

  // Register sheet application classes
  Actors.unregisterSheet('core', ActorSheet);
  Actors.registerSheet('true-legend', TrueLegendActorSheet, {
    makeDefault: true,
    label: 'TRUE_LEGEND.SheetLabels.Actor',
  });
  Items.unregisterSheet('core', ItemSheet);
  Items.registerSheet('true-legend', TrueLegendItemSheet, {
    makeDefault: true,
    label: 'TRUE_LEGEND.SheetLabels.Item',
  });

  // Preload Handlebars templates.
  return preloadHandlebarsTemplates();
});

/* -------------------------------------------- */
/*  Handlebars Helpers                          */
/* -------------------------------------------- */

// If you need to add Handlebars helpers, here is a useful example:
Handlebars.registerHelper('toLowerCase', function (str) {
  return str.toLowerCase();
});
// helpers.js
Handlebars.registerHelper('div3', function(number) {
  if(number % 3 === 0){
    return true;
  }
  else {
    false;
  }
});
Handlebars.registerHelper('objectToArray', function(object) {
  return Object.entries(object);
})
Handlebars.registerHelper('add', function(n1, n2) {
  return n1+n2;
})
Handlebars.registerHelper('mod', function(value, divisor) {
  return value % divisor;
});
Handlebars.registerHelper('names', function(sectionIndex) {
  const sectionNames = ["Body", "Mind", "Empathy", "Spirit", "Magic"]; // Puoi modificare i nomi come preferisci
  return sectionNames[sectionIndex] || `${sectionIndex}`;
});
Handlebars.registerHelper('div', function(a, b) {
  return Math.floor(a / b);
});
Handlebars.registerHelper('createOption', function(attribute, key) {
  // Key: vig
  // Value: Vigor
  // Ritorna una stringa HTML per l'elemento <option>
  //console.log("CCCCCCCCCCCCCCCKey: " + key );
  //console.log("CCCCCCCCCCCCCCCValue: " + attribute);
  return new Handlebars.SafeString(`<option value="${key}">${attribute}</option>`);
});
Handlebars.registerHelper('logConsole', function(context) {
  console.log(context);
});




/* -------------------------------------------- */
/*  Ready Hook                                  */
/* -------------------------------------------- */

Hooks.once('ready', function () {
  // Wait to register hotbar drop hook on ready so that modules could register earlier if they want to
  Hooks.on('hotbarDrop', (bar, data, slot) => createItemMacro(data, slot));
});

/* -------------------------------------------- */
/*  Hotbar Macros                               */
/* -------------------------------------------- */

/**
 * Create a Macro from an Item drop.
 * Get an existing item macro if one exists, otherwise create a new one.
 * @param {Object} data     The dropped data
 * @param {number} slot     The hotbar slot to use
 * @returns {Promise}
 */
async function createItemMacro(data, slot) {
  // First, determine if this is a valid owned item.
  if (data.type !== 'Item') return;
  if (!data.uuid.includes('Actor.') && !data.uuid.includes('Token.')) {
    return ui.notifications.warn(
      'You can only create macro buttons for owned Items'
    );
  }
  // If it is, retrieve it based on the uuid.
  const item = await Item.fromDropData(data);

  // Create the macro command using the uuid.
  const command = `game.truelegend.rollItemMacro("${data.uuid}");`;
  let macro = game.macros.find(
    (m) => m.name === item.name && m.command === command
  );
  if (!macro) {
    macro = await Macro.create({
      name: item.name,
      type: 'script',
      img: item.img,
      command: command,
      flags: { 'true-legend.itemMacro': true },
    });
  }
  game.user.assignHotbarMacro(macro, slot);
  return false;
}

/**
 * Create a Macro from an Item drop.
 * Get an existing item macro if one exists, otherwise create a new one.
 * @param {string} itemUuid
 */
function rollItemMacro(itemUuid) {
  // Reconstruct the drop data so that we can load the item.
  const dropData = {
    type: 'Item',
    uuid: itemUuid,
  };
  // Load the item from the uuid.
  Item.fromDropData(dropData).then((item) => {
    // Determine if the item loaded and if it's an owned item.
    if (!item || !item.parent) {
      const itemName = item?.name ?? itemUuid;
      return ui.notifications.warn(
        `Could not find item ${itemName}. You may need to delete and recreate this macro.`
      );
    }

    // Trigger the item roll
    item.roll();
  });
}
