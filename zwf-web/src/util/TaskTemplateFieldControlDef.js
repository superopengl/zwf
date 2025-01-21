import {
  FaTextWidth,
  FaAlignLeft,
  FaCheckSquare,
  FaChevronCircleDown,
  FaDotCircle,
  FaCalendarAlt,
} from 'react-icons/fa';
import { MdOutlineFormatColorText } from 'react-icons/md'
import { RxSwitch } from 'react-icons/rx';
import { BsCloudUpload } from 'react-icons/bs';
import Icon, { FilePdfFilled, FieldNumberOutlined, UploadOutlined, LineOutlined, QuestionCircleOutlined } from '@ant-design/icons'
import { TaskFileUploader } from 'components/TaskFileUploader';
import { DateInput } from 'components/DateInput';
import { Tooltip, Input } from 'antd';
import { AutoDocInput } from 'components/AutoDocInput';
import { DeleteOutlined, LockFilled, HolderOutlined, EyeInvisibleFilled } from '@ant-design/icons';
import {
  ProForm,
  ProFormCheckbox,
  ProFormDigit,
  ProFormDigitRange,
  ProFormGroup,
  ProFormRadio,
  ProFormRate,
  ProFormSegmented,
  ProFormSelect,
  ProFormSlider,
  ProFormSwitch,
  ProFormText,
  ProFormTextArea,
  ProFormDateTimePicker,
  ProFormUploadButton,
  ProFormUploadDragger,
} from '@ant-design/pro-components';
import { Divider } from 'antd';

export const createFieldItemSchema = (controlType, name) => {
  const controlDef = TaskTemplateFieldControlDefMap.get(controlType);
  if (!controlDef) {
    throw new Error(`Unknown control type ${controlType}`);
  }
  const { type } = controlDef;
  const options = type === 'select' || type === 'radio' ? ['Option 1', 'Option 2'] : undefined;

  return {
    type,
    name,
    description: '',
    options
  }
}

export function createFormItemSchema(field, mode) {
  const controlDef = TaskTemplateFieldControlDefMap.get(field.type);
  if (!controlDef) {
    throw new Error(`Unknown control type ${field.type}`);
  }
  return {
    title: field.type === 'divider' ? null : mode === 'agent' && field.official ? <Tooltip title="Official only field. Client cannot see."><a>{field.name} <EyeInvisibleFilled /></a></Tooltip> : field.name,
    dataIndex: field.name,
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
    },
    control: ProFormTextArea,
  },
  {
    type: 'digit',
    label: 'Number',
    icon: <FieldNumberOutlined />,
    fieldProps: {
      style: {
        width: '100%'
      }
    },
    control: ProFormDigit,
  },
  {
    type: 'checkbox',
    label: 'Switch (checkbox)',
    icon: <RxSwitch />,
    fieldProps: null,
    control: ProFormSwitch,
  },
  {
    type: 'select',
    label: 'Single choice',
    icon: <FaChevronCircleDown />,
    fieldProps: {
    },
    control: ProFormSelect,
  },
  {
    type: 'radio',
    label: 'Multiple choice',
    icon: <FaDotCircle />,
    fieldProps: {
    },
    control: ProFormRadio.Group,
  },
  {
    type: 'date',
    label: 'Date',
    icon: <FaCalendarAlt />,
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
    icon: <FaCalendarAlt />,
    fieldProps: {
      picker: 'month',
      format: 'MMM YYYY'
    },
    control: ProFormDateTimePicker,
  },
  {
    type: 'dateQuarter',
    label: 'Quarter',
    icon: <FaCalendarAlt />,
    fieldProps: {
      picker: 'quarter',
      format: 'YYYY-\\QQ'
    },
    control: ProFormDateTimePicker,
  },
  {
    type: 'dateYear',
    label: 'Year',
    icon: <FaCalendarAlt />,
    fieldProps: {
      picker: 'year',
      format: 'YYYY'
    },
    control: ProFormDateTimePicker,
  },
  {
    type: 'upload',
    label: 'Upload files',
    icon: <BsCloudUpload />,
    fieldProps: {
    },
    control: TaskFileUploader,
  },
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
    label: 'Instraction (readonly)',
    icon: <QuestionCircleOutlined />,
    formItemProps: {
    },
    hideInForm: true,
    fieldProps: {
      bordered: false,
      disabled: true,
    },
    control: () => <div className="description-field-control"></div>,
  },
  // {
  //   type: 'autodoc',
  //   label: 'Doc template (PDF)',
  //   icon: <FilePdfFilled />,
  //   fieldProps: {
  //   },
  //   control: AutoDocInput,
  // },
]);

export const TaskTemplateFieldControlDefMap = new Map(TaskTemplateFieldControlDef.map(x => [x.type, x]));
