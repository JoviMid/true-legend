import TrueLegendDataModel from "./base-model.mjs";

export default class TrueLegendActorBase extends TrueLegendDataModel {

  static defineSchema() {
    const fields = foundry.data.fields;
    const requiredInteger = { required: true, nullable: false, integer: true };
    const schema = {};

    schema.health = new fields.SchemaField({
      value: new fields.NumberField({ ...requiredInteger, initial: 30, min: 0 }),
      max: new fields.NumberField({ ...requiredInteger, initial: 30 })
    });
    schema.defences = new fields.SchemaField({
      guard: new fields.SchemaField({
        value: new fields.NumberField({ ...requiredInteger, initial: 5, min: 0}),
        max: new fields.NumberField({ ...requiredInteger, initial: 5 }),
        armor: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0}),
        bonus: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0})
      }),
      resilience: new fields.SchemaField({
        value: new fields.NumberField({ ...requiredInteger, initial: 5, min: 0}),
        max: new fields.NumberField({ ...requiredInteger, initial: 5 }),
        armor: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0}),
        bonus: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0})
      }),
      sanity: new fields.SchemaField({
        value: new fields.NumberField({ ...requiredInteger, initial: 5, min: 0}),
        max: new fields.NumberField({ ...requiredInteger, initial: 5 }),
        armor: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0}),
        bonus: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0})
      })
    })
    schema.biography = new fields.StringField({ required: true, blank: true }); // equivalent to passing ({initial: ""}) for StringFields

    return schema;
  }

}