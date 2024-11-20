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

    return schema;
  }

  prepareDerivedData() {

    // Attributes points
    // Formula: 40 + (30 * lvl)
    this.attributes.level.aPoints = 40 + 30 * this.attributes.level.value
    this.attributes.level.aPointsTot = 0;

    // Health
    // Formula: 30 + ((Livello Pg) * (Tempra + Volontà + Presenza)/2)
    this.health.max = 30 + (this.attributes.level.value * ((this.abilities["for"].value + this.abilities["wil"].value + this.abilities["pre"].value)/2))

    // Loop through ability scores, and add their modifiers to our sheet output.
    // Key = vig, agi, for, etc...
    // abilities {label, cost, value}
    for (const key in this.abilities) {

      console.log('AAAAAAAAAAAAAAAKey:', key);
      console.log('AAAAAAAAAAAAAAAValue:', this.abilities[key]);

      // Calculate the cost of every attr
      var sum = 0;
      for (var i=0; i<=this.abilities[key].value; i++){
        sum += i;
      }
      this.abilities[key].cost = sum;
      // Handle ability label localization.
      this.abilities[key].label = game.i18n.localize(CONFIG.TRUE_LEGEND.abilities[key]) ?? key;
      this.attributes.level.aPointsTot += sum;
    }
  }
  

  getRollData() {
    const data = {};

    // Copy the ability scores to the top level, so that rolls can use
    // formulas like `@str.mod + 4`.
    if (this.abilities) {
      for (let [k,v] of Object.entries(this.abilities)) {
        console.log("BBBBBBBBBBBBBBBBBBBKey:", k); // Mostra la chiave attuale
        console.log("BBBBBBBBBBBBBBBBBBBValue:", v); // Mostra il valore attuale (intero oggetto)
        data[k] = foundry.utils.deepClone(v);
      }
    }

    data.lvl = this.attributes.level.value;

    return data
  }
}