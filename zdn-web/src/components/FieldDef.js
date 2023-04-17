import * as moment from 'moment';
import { varNameToLabelName } from 'util/varNameToLabelName';
import { labelNameToVarName } from 'util/labelNameToVarName';
import {isValidABN, isValidACN} from "abnacn-validator";
import * as tfn from 'tfn';
import { FaTruckMonster } from 'react-icons/fa';

const isValidTfn = (text) => tfn(text).valid;

export const BuiltInFieldDef = [
  {
    name: 'Given_Name',
    inputType: 'text',
    rules: [{ required: true, whitespace: true, max: 100, message: ' ' }],
    inputProps: {
      autoComplete: "given-name",
      maxLength: 100,
      allowClear: true,
      placeholder: ''
    },
    portfolioType: ['individual'],
  },
  {
    name: 'Surname',
    inputType: 'text',
    rules: [{ required: true, whitespace: true, max: 100, message: ' ' }],
    inputProps: {
      autoComplete: "family-name",
      maxLength: 100,
      allowClear: true,
      placeholder: ''
    },
    portfolioType: ['individual'],
  },
  {
    name: 'Company',
    inputType: 'text',
    rules: [{ required: true, whitespace: true, max: 100, message: ' ' }],
    inputProps: {
      autoComplete: "organization",
      maxLength: 100,
      allowClear: true,
      placeholder: ''
    },
    portfolioType: ['business'],
  },
  {
    name: 'Phone',
    description: `split with ', ' if there are more than one`,
    inputType: 'text',
    rules: [{ required: true, whitespace: true, max: 30, message: ' ' }],
    inputProps: {
      autoComplete: "tel",
      maxLength: 30,
      allowClear: true,
      placeholder: '',
      type: 'tel',
    },
    portfolioType: ['individual', 'business'],
  },
  {
    name: 'Wechat',
    inputType: 'text',
    rules: [{ required: false, max: 50, message: ' ' }],
    inputProps: {
      maxLength: 50,
      allowClear: true,
      placeholder: '',
    },
    portfolioType: ['individual', 'business'],
  },
  {
    name: 'Address',
    inputType: 'text',
    rules: [{ required: true, max: 100, message: ' ' }],
    inputProps: {
      maxLength: 100,
      allowClear: true,
      placeholder: '',
    },
    portfolioType: ['individual', 'business'],
  },
  {
    name: 'Post_Address',
    inputType: 'text',
    rules: [{ required: false, max: 100, message: ' ' }],
    inputProps: {
      maxLength: 100,
      allowClear: true,
      placeholder: `If different from above address`,
    },
    portfolioType: ['individual', 'business'],
  },
  {
    name: 'Date_Of_Birth',
    inputType: 'date',
    rules: [{
      required: true,
      validator: async (rule, value) => {
        if (!value) return;
        if (moment(value).isAfter()) {
          throw new Error();
        }
      },
      message: 'Invalid date or not a past date'
    }],
    inputProps: {
      autoComplete: 'bday'
    },
    portfolioType: ['individual'],
  },
  {
    name: 'Due_Date',
    inputType: 'date',
    rules: [{
      required: true,
      validator: async (rule, value) => {
        if (!value) return;
        if (moment(value).isBefore()) {
          throw new Error();
        }
      },
      message: 'Invalid date or not a furture date'
    }],
    portfolioType: [],
  },
  {
    name: 'Gender',
    inputType: 'select',
    rules: [{ required: false, message: 'Please choose a gender' }],
    options: [
      {
        label: 'Male',
        value: 'male',
      },
      {
        label: 'Female',
        value: 'female',
      },
      {
        label: 'Other',
        value: 'other',
      }
    ],
    portfolioType: ['individual'],
  },
  {
    name: 'TFN',
    inputType: 'text',
    rules: [{ required: true, validator: (rule, value) => isValidTfn(value) ? Promise.resolve() : Promise.reject('Invalid TFN') }],
    inputProps: {
      maxLength: 20,
      allowClear: true,
      placeholder: '',
    },
    portfolioType: ['individual', 'business'],
  },
  {
    name: 'ABN',
    inputType: 'text',
    rules: [{ required: false, validator: (rule, value) => !value || isValidABN(value) ? Promise.resolve() : Promise.reject('Invalid ABN') }],
    inputProps: {
      maxLength: 20,
      allowClear: true,
      placeholder: '',
    },
    portfolioType: ['individual', 'business'],
  },
  {
    name: 'ACN',
    inputType: 'text',
    rules: [{ required: false, validator: (rule, value) => !value || isValidACN(value) ? Promise.resolve() : Promise.reject('Invalid ACN') }],
    inputProps: {
      maxLength: 20,
      allowClear: true,
      placeholder: '',
    },
    portfolioType: ['business'],
  },
  {
    name: 'Occupation',
    inputType: 'text',
    rules: [{ required: false, max: 50, message: ' ' }],
    inputProps: {
      maxLength: 50,
      allowClear: true,
      placeholder: '',
    },
    portfolioType: ['individual'],
  },
  {
    name: 'Industry',
    inputType: 'text',
    rules: [{ required: false, max: 50, message: ' ' }],
    inputProps: {
      maxLength: 50,
      allowClear: true,
      placeholder: '',
    },
    portfolioType: ['business'],
  },
  {
    name: 'Remark',
    inputType: 'paragraph',
    rules: [{ required: false, max: 500, message: ' ' }],
    inputProps: {
      maxLength: 500,
      allowClear: true,
      placeholder: '',
    },
    portfolioType: ['individual', 'business'],
  },
  {
    name: 'Year',
    inputType: 'year',
    rules: [{ required: true, message: 'Please choose a financial year' }],
    portfolioType: [],
  },
  {
    name: 'Month_Range',
    inputType: 'monthRange',
    rules: [{ required: true, message: 'Please choose start/end months' }],
    portfolioType: [],
  },
];

export const BuiltInFieldType = Array.from(new Set(BuiltInFieldDef.map(x => x.inputType))).filter(x => x !== 'select');

// export const BuiltInFieldLabelNames = BuiltInFieldDef.map(x => varNameToLabelName(x.name));

export const BuiltInFieldLabelValuePairs = BuiltInFieldDef.map(x => ({label: varNameToLabelName(x.name), value: x.name}));

export const getBuiltInFieldByVarName = (varName) => {
  return BuiltInFieldDef.find(x => x.name === varName);
}

export const getBuiltInFieldByLabelName = (labelName) => {
  const varName = labelNameToVarName(labelName);
  return getBuiltInFieldByVarName(varName);
}
