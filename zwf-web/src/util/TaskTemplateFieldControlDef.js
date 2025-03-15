import React from 'react';
import {
  FaAlignLeft,
  FaHireAHelper,
} from 'react-icons/fa';
import { MdOutlineFormatColorText } from 'react-icons/md'
import { RxDropdownMenu, RxSwitch } from 'react-icons/rx';
import { LineOutlined } from '@ant-design/icons'
import { Tooltip } from 'antd';
import { EyeInvisibleFilled } from '@ant-design/icons';
import {
  ProFormDigit,
  ProFormRadio,
  ProFormSelect,
  ProFormCheckbox,
  ProFormSwitch,
  ProFormText,
  ProFormTextArea,
  ProFormDateTimePicker,
} from '@ant-design/pro-components';
import { Divider } from 'antd';
import { v4 as uuidv4 } from 'uuid';
import { IoCheckbox } from 'react-icons/io5';
import { BsCalendarRangeFill, BsFillCalendarDateFill, BsFillCalendarFill, BsFillCalendarMonthFill } from 'react-icons/bs';
import {TbNumbers} from 'react-icons/tb';
import {RiRadioButtonFill} from'react-icons/ri';

const getControleDefOrDefault = (controlType)  => {
  let controlDef = TaskTemplateFieldControlDefMap.get(controlType);
  if (!controlDef) {
    console.error(`Unknown control type ${controlType}. Fail back to textarea`);
    controlDef =  TaskTemplateFieldControlDefMap.get('textarea');
  }
  return controlDef;;
}

export const createFieldItemSchema = (controlType, name) => {
  const controlDef = getControleDefOrDefault(controlType);
  const { type } = controlDef;
  const options = type === 'select' || type === 'radio' ? ['Option 1', 'Option 2'] : undefined;

  return {
    id: uuidv4(),
    type,
    name,
    description: '',
    options
  }
}

export function createFormItemSchema(field, mode) {
  const controlDef = getControleDefOrDefault(field.type);
  return {
    title: field.type === 'divider' ? null : mode === 'agent' && field.official ? <Tooltip title="Official only field. Client cannot see."><a>{field.name} <EyeInvisibleFilled /></a></Tooltip> : field.name,
    dataIndex: field.id,
    initialValue: field.value,
    formItemProps: {
      ...field.formItemProps,
      help: field.description,
      rules: [{ required: field.required, whitespace: true }]
    },
    fieldProps: {
      ...controlDef.fieldProps,
      placeholder: field.name,
      options: field.options,
    },
    renderFormItem: (schema, config, form) => <controlDef.control />,
  };
}

export function generateSchemaFromColumns(fields, mode = 'agent' | 'client') {
  return fields
    .filter(f => mode === 'agent' || !f.official)
    .map(f => createFormItemSchema(f, mode));
}

export const TaskTemplateFieldControlDef = Object.freeze([
  {
    type: 'text',
    label: 'Text',
    icon: <MdOutlineFormatColorText />,
    fieldProps: {
      allowClear: true,
      maxLength: 150,
      placeholder: 'Enter text',
    },
    control: ProFormText,
  },
  {
    type: 'textarea',
    label: 'Textarea',
    icon: <FaAlignLeft />,
    fieldProps: {
      allowClear: true,
      showCount: true,
      maxLength: 1000,
      placeholder: 'Enter text',
    },
    control: ProFormTextArea,
  },
  {
    type: 'digit',
    label: 'Number',
    icon: <TbNumbers />,
    fieldProps: {
      placeholder: 'Enter number',
      style: {
        width: '100%'
      }
    },
    control: ProFormDigit,
  },
  {
    type: 'checkbox',
    label: 'Switch',
    icon: <RxSwitch />,
    fieldProps: null,
    control: ProFormSwitch,
  },
  {
    type: 'select',
    label: 'Dropdown',
    icon: <RxDropdownMenu />,
    fieldProps: {
    },
    control: ProFormSelect,
  },
  {
    type: 'checkbox',
    label: 'Multiple choices',
    icon: <IoCheckbox />,
    fieldProps: {
    },
    control: ProFormCheckbox.Group,
  },
  {
    type: 'radio',
    label: 'Single choice',
    icon: <RiRadioButtonFill />,
    fieldProps: {
    },
    control: ProFormRadio.Group,
  },
  {
    type: 'date',
    label: 'Date',
    icon: <BsFillCalendarDateFill />,
    fieldProps: {
      picker: 'date',
      format: 'DD MMM YYYY',
      showTime: false,
    },
    control: ProFormDateTimePicker,
  },
  {
    type: 'dateMonth',
    label: 'Month',
    icon: <BsFillCalendarMonthFill />,
    fieldProps: {
      picker: 'month',
      format: 'MMM YYYY'
    },
    control: ProFormDateTimePicker,
  },
  {
    type: 'dateQuarter',
    label: 'Quarter',
    icon: <BsCalendarRangeFill />,
    fieldProps: {
      picker: 'quarter',
      format: 'YYYY-\\QQ'
    },
    control: ProFormDateTimePicker,
  },
  {
    type: 'dateYear',
    label: 'Year',
    icon: <BsFillCalendarFill />,
    fieldProps: {
      picker: 'year',
      format: 'YYYY'
    },
    control: ProFormDateTimePicker,
  },
  // {
  //   type: 'upload',
  //   label: 'Upload files',
  //   icon: <BsCloudUpload />,
  //   fieldProps: {
  //   },
  //   control: TaskFileUploader,
  // },
  {
    type: 'divider',
    label: 'Divider',
    icon: <LineOutlined />,
    formItemProps: {
      label: null,
    },
    fieldProps: {
    },
    control: Divider,
  },
  {
    type: 'instruction',
    label: 'Instruction (help text)',
    icon: <FaHireAHelper />,
    formItemProps: {
    },
    hideInForm: true,
    fieldProps: {
      bordered: false,
      disabled: true,
    },
    control: () => <div className="description-field-control"></div>,
  },
]);

export const TaskTemplateFieldControlDefMap = new Map(TaskTemplateFieldControlDef.map(x => [x.type, x]));
