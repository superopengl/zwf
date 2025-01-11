import {
  FaTextWidth,
  FaAlignLeft,
  FaCheckSquare,
  FaChevronCircleDown,
  FaDotCircle,
  FaCalendarAlt,
} from 'react-icons/fa';
import { MdOutlineFormatColorText } from 'react-icons/md'
import {BsCloudUpload} from 'react-icons/bs';
import Icon, { FilePdfFilled, FieldNumberOutlined, UploadOutlined } from '@ant-design/icons'
import { TaskFileUploader } from 'components/TaskFileUploader';
import { DateInput } from 'components/DateInput';
import { Upload } from 'antd';
import { AutoDocInput } from 'components/AutoDocInput';

export const createFieldItemSchema = (controlType) => {
  const controlDef = TaskTemplateControlDef.find(x => x.type === controlType);
  if (!controlDef) {
    throw new Error(`Unknown control type ${controlType}`);
  }
  const { type } = controlDef;

  return {
    type,
    name: '',
    description: '',
    required: false,
    value: null,
    widget: 'input',
    official: false,
    disabled: false,
  }
}

export const TaskTemplateControlDef = Object.freeze([
  {
    type: 'text',
    label: 'Text',
    icon: <MdOutlineFormatColorText />,
    widget: 'input',
    fieldProps: {
      allowClear: true,
      maxLength: 150,
    },
  },
  {
    type: 'textarea',
    label: 'Textarea',
    icon: <FaAlignLeft />,
    widget: 'textarea',
    fieldProps: {
      allowClear: true,
      showCount: true,
      maxLength: 1000,
    },
  },
  {
    type: 'digit',
    label: 'Number',
    icon: <FieldNumberOutlined />,
    widget: 'number',
    fieldProps: {
      style: {
        width: '100%'
      }
    },
  },
  {
    type: 'checkbox',
    label: 'Checkbox',
    icon: <FaCheckSquare />,
    widget: 'checkbox-group',
    fieldProps: null,
  },
  {
    type: 'select',
    label: 'Single choice',
    icon: <FaChevronCircleDown />,
    widget: 'select',
    fieldProps: null,
  },
  {
    type: 'radio',
    label: 'Multiple choice',
    icon: <FaDotCircle />,
    widget: 'radio-group',
    fieldProps: null,
  },
  {
    type: 'date',
    label: 'Date',
    icon: <FaCalendarAlt />,
    widget: DateInput,
    fieldProps: {
      picker: 'date'
    },
  },
  {
    type: 'dateMonth',
    label: 'Month',
    icon: <FaCalendarAlt />,
    widget: DateInput,
    fieldProps: {
      picker: 'month',
      format: 'YYYY-MM'
    },
  },
  {
    type: 'dateQuarter',
    label: 'Quarter',
    icon: <FaCalendarAlt />,
    widget: DateInput,
    fieldProps: {
      picker: 'quarter',
      format: 'YYYY-\\QQ'
    },
  },
  {
    type: 'dateYear',
    label: 'Year',
    icon: <FaCalendarAlt />,
    widget: DateInput,
    fieldProps: {
      picker: 'year',
      format: 'YYYY'
    },
  },
  {
    type: 'upload',
    label: 'Upload files',
    icon: <BsCloudUpload />,
    widget: TaskFileUploader,
    fieldProps: {
    },
    renderFormItem: (schema, config, form) => <TaskFileUploader />
  },
  {
    type: 'autodoc',
    label: 'Doc template (PDF)',
    icon: <FilePdfFilled />,
    fieldProps: {
    },
    renderFormItem: (schema, config, form) => <AutoDocInput />
  },
]);