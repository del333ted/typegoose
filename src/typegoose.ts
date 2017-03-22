import 'reflect-metadata';
import * as mongoose from 'mongoose';
import * as _ from 'lodash';

const schema = {};
const models = {};

export const prop = (target: any, key: string) => {
  const type = Reflect.getMetadata('design:type', target, key);
  if (!schema[target.constructor.name]) {
    schema[target.constructor.name] = {};
  }
  schema[target.constructor.name][key] = {
    ...schema[target.constructor.name][key],
    type,
  };
};

export const subdocProp = (target: any, key: string) => {
  const type = Reflect.getMetadata('design:type', target, key);
  const instance = new type();
  const subSchema = schema[instance.constructor.name];
  if (!subSchema) {
    throw new Error(`${type.name} is not a Typegoose schema (Not extending it).`);
  }

  if (!schema[target.constructor.name]) {
    schema[target.constructor.name] = {};
  }
  schema[target.constructor.name][key] = {
    ...schema[target.constructor.name][key],
    ...subSchema,
  };
};

export const refProp = (refModel: any) => (target: any, key: string) => {
  if (!schema[target.constructor.name]) {
    schema[target.constructor.name] = {};
  }
  schema[target.constructor.name][key] = {
    ...schema[target.constructor.name][key],
    type: mongoose.Schema.Types.ObjectId,
    ref: refModel.name,
  };
};

export const required = (target: any, key: string) => {
  const type = Reflect.getMetadata('design:type', target, key);
  if (!schema[target.constructor.name]) {
    schema[target.constructor.name] = {};
  }
  schema[target.constructor.name][key] = {
    ...schema[target.constructor.name][key],
    required: true,
  };
};

export const enumProp = (enumeration: any) => (target: any, key: string) => {
  if (!schema[target.constructor.name]) {
    schema[target.constructor.name] = {};
  }
  schema[target.constructor.name][key] = {
    ...schema[target.constructor.name][key],
    type: String,
    enum: _.values(enumeration),
  };
};

export type Ref<T> = T | string;

export class Typegoose {
  id: string;
  constructor() {
    const name = (this.constructor as any).name;

    if (!models[name]) {
      models[name] = mongoose.model<this & mongoose.Document>(name, schema[name]);
    }
  }

  _getModel() {
    return models[(this.constructor as any).name] as mongoose.Model<this & mongoose.Document>;
  }
}
