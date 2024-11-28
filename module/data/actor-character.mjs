import TrueLegendActorBase from "./base-actor.mjs";

export default class TrueLegendCharacter extends TrueLegendActorBase {

  static defineSchema() {
    const fields = foundry.data.fields;
    const requiredInteger = { required: true, nullable: false, integer: true };
    const schema = super.defineSchema();

    schema.attributes = new fields.SchemaField({
      level: new fields.SchemaField({
        value: new fields.NumberField({ ...requiredInteger, initial: 1 })
      }),
    });

    // Iterate over ability names and create a new SchemaField for each.
    schema.abilities = new fields.SchemaField(Object.keys(CONFIG.TRUE_LEGEND.abilities).reduce((obj, ability) => {
      obj[ability] = new fields.SchemaField({
        value: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0, max:20 }),
      });
      return obj;
    }, {}));
    // Iterate over movements names and create a new SchemaField for each.
    schema.movements = new fields.SchemaField(Object.keys(CONFIG.TRUE_LEGEND.movements).reduce((obj, movement) => {
      obj[movement] = new fields.SchemaField({
        value: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 }),
      });
      return obj;
    }, {}));

    return schema;
  }
  
    prepareDerivedData() {

      // Attributes points
      // Formula: 40 + (30 * lvl)
      this.attributes.level.aPoints = 40 + 30 * this.attributes.level.value
      this.attributes.level.aPointsTot = 0;

      // Calcolo del valore massimo per Guard
      this.defences.guard.max =
      8 +
      (this.defences.guard.bonus || 0) +
      (this.defences.guard.armor || 0) +
      (this.attributes.level.value || 0) +
      Math.ceil(
        (this.abilities['agi'].value || 0) / 2 +
        (this.abilities['ins'].value || 0) / 2 +
        (this.abilities['vig'].value || 0) / 2
      );

      // Calcolo del valore massimo per Resilience
      this.defences.resilience.max =
      8 +
      (this.defences.resilience.bonus || 0) +
      (this.defences.resilience.armor || 0) +
      (this.attributes.level.value || 0) +
      Math.ceil(
        (this.abilities['vig'].value || 0) / 2 +
        (this.abilities['for'].value || 0) / 2 +
        (this.abilities['wil'].value || 0) / 2
      );

      // Calcolo del valore massimo per Sanity
      this.defences.sanity.max =
      8 +
      (this.defences.sanity.bonus || 0) +
      (this.defences.sanity.armor || 0) +
      (this.attributes.level.value || 0) +
      Math.ceil(
        (this.abilities['wil'].value || 0) / 2 +
        (this.abilities['ins'].value || 0) / 2 +
        (this.abilities['pre'].value || 0) / 2
      );

      this.movements['lan'].value = 10;
      this.movements['cli'].value = 5;
      this.movements['swi'].value = 5;


      // Loop through ability scores, and add their modifiers to our sheet output.
      // Key = vig, agi, for, etc...
      // abilities {label, cost, value}
      for (const key in this.abilities) {
  
  
        // Calculate the cost of every attr
        var sum = 0;
        for (var i=0; i<=this.abilities[key].value; i++){
          sum += i;
        }
        this.abilities[key].cost = sum;
        this.attributes.level.aPointsTot += sum;

        // Handle ability label localization.
        this.abilities[key].label = game.i18n.localize(CONFIG.TRUE_LEGEND.abilities[key]) ?? key;
      }
      for (const key in this.movements) {
        this.movements[key].label = game.i18n.localize(CONFIG.TRUE_LEGEND.movements[key]) ?? key;
      }
    }

  getRollData() {
    const data = {};

    // Copy the ability scores to the top level, so that rolls can use
    // formulas like `@str.mod + 4`.
    if (this.abilities) {
      for (let [k,v] of Object.entries(this.abilities)) {
        //console.log("BBBBBBBBBBBBBBBBBBBKey:", k); // Mostra la chiave attuale
        //console.log("BBBBBBBBBBBBBBBBBBBValue:", v); // Mostra il valore attuale (intero oggetto)
        data[k] = foundry.utils.deepClone(v);
      }
    }

    data.lvl = this.attributes.level.value;

    return data
  }
}