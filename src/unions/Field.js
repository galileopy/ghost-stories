import folktale from "folktale";
import { union } from "folktale/adt/union/";
import Validation from "folktale/validation/validation";
import adtMethods from "folktale/helpers/define-adt-methods";
import assertFunction from "folktale/helpers/assert-function";

import { curry } from "ramda";

// tambien se puede reflejar el estado de la validacion
const Field = union("Field", {
  Editable(value, temp) {
    return { value, temp: temp || value };
  },
  ReadOnly(value) {
    return { value, temp: value };
  },
  Saving(value) {
    return { value, temp: value };
  },
  Error(messages, value) {
    // un error es editable
    return { messages, value, temp: value };
  },
});

export default Field;

export const fromResult = curry((value, { success, data, messages }) => {
  if (!success) {
    return Field.Error(messages, value);
  }
  return Field.ReadOnly(data);
});

const fromError = curry((params, error) =>
  Field.Error([error.message], params)
);

const mapPromise = curry((params, promise) =>
  promise.then(fromResult(params), fromError(params))
);

const toValidation = (field) => field.toValidation();

Field.fromError = fromError;
Field.fromResult = fromResult;
Field.mapPromise = mapPromise;
Field.toValidation = toValidation;

// TODO: falta una función para salir de error
adtMethods(Field, {
  map: {
    Editable: function map(f) {
      // Modifica el valor temporal, que sería lo que se muestra en el formulario
      assertFunction("Field.Editable#map", f);
      const { value, temp } = this;
      const result = f(temp);
      return Field.Editable(value, result);
    },
    ReadOnly: function map(f) {
      assertFunction("Field.ReadOnly#map", f);
      return this;
    },
    Saving: function map(f) {
      assertFunction("Field.Saving#map", f);
      return this;
    },
    Error: function map(f) {
      assertFunction("Field.Error#map", f);
      return this;
    },
  },
  mapValue: {
    Editable: function mapValue(f) {
      // Modifica el valor temporal, que sería lo que se muestra en el formulario
      assertFunction("Field.Editable#mapValue", f);
      const { value } = this;
      const result = f(value);
      return Field.Editable(result);
    },
    ReadOnly: function mapValue(f) {
      assertFunction("Field.ReadOnly#mapValue", f);
      const { value } = this;
      const result = f(value);
      return Field.ReadOnly(result);
    },
    Saving: function mapValue(f) {
      assertFunction("Field.Saving#mapValue", f);
      const { value } = this;
      const result = f(value);
      return Field.Saving(result);
    },
    Error: function mapValue(f) {
      assertFunction("Field.Error#mapValue", f);
      const { value } = this;
      const result = f(value);
      return Field.Error(result);
    },
  },
  save: {
    Editable: function save() {
      const { temp } = this;
      return Field.Saving(temp);
    },
    ReadOnly: function save() {
      const { value } = this;
      return Field.Saving(value);
    },
    Saving: function save() {
      return this;
    },
    Error: function save() {
      return this;
    },
  },
  edit: {
    Editable: function edit() {
      return this;
    },
    ReadOnly: function edit() {
      const { temp, value } = this;
      return Field.Editable(value, temp);
    },
    Saving: function edit() {
      return this;
    },
    Error: function edit() {
      return this;
    },
  },
  revert: {
    Editable: function revert() {
      const { value } = this;
      return Field.ReadOnly(value);
    },
    ReadOnly: function revert() {
      return this;
    },
    Saving: function revert() {
      return this;
    },
    Error: function revert() {
      const { value } = this;
      return Field.ReadOnly(value);
    },
  },
  tap: {
    Editable: function tap(f) {
      assertFunction("Field.Editable#tap", f);
      const { value } = this;
      f(value);
      return this;
    },
    ReadOnly: function tap(f) {
      assertFunction("Field.ReadOnly#tap", f);
      const { value } = this;
      f(value);
      return this;
    },
    Saving: function tap(f) {
      assertFunction("Field.Saving#tap", f);
      const { value } = this;
      f(value);
      return this;
    },
    Error: function tap(f) {
      assertFunction("Field.Error#tap", f);
      const { value } = this;
      f(value);
      return this;
    },
  },
  toValidation: {
    Editable(value) {
      return Validation.Success(value);
    },
    ReadOnly(value) {
      return Validation.Success(value);
    },
    Saving(value) {
      return Validation.Success(value);
    },
    Error({ messages }) {
      return Validation.Failure([messages]);
    },
  },
});
