import {
  FaTextWidth,
  FaAlignLeft,
  FaCheckSquare,
  FaChevronCircleDown,
  FaDotCircle,
  FaCalendarAlt,
} from 'react-icons/fa';
import { MdOutlineFormatColorText } from 'react-icons/md'
import {RxSwitch} from 'react-icons/rx';
import {BsCloudUpload} from 'react-icons/bs';
import Icon, { FilePdfFilled, FieldNumberOutlined, UploadOutlined } from '@ant-design/icons'
import { TaskFileUploader } from 'components/TaskFileUploader';
import { DateInput } from 'components/DateInput';
import { Upload } from 'antd';
import { AutoDocInput } from 'components/AutoDocInput';
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

export const createFieldItemSchema = (controlType, name) => {
  const controlDef = TaskTemplateFieldControlDef.find(x => x.type === controlType);
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

export const TaskTemplateFieldControlDef = Object.freeze([
  {
    type: 'text',
    label: 'Text',
    icon: <MdOutlineFormatColorText />,
    widget: 'input',
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
    widget: 'textarea',
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
    widget: 'number',
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
    widget: 'checkbox-group',
    fieldProps: null,
    control: ProFormSwitch,
  },
  {
    type: 'select',
    label: 'Single choice',
    icon: <FaChevronCircleDown />,
    widget: 'select',
    fieldProps: {
    },
    control: ProFormSelect,
  },
  {
    type: 'radio',
    label: 'Multiple choice',
    icon: <FaDotCircle />,
    widget: 'radio-group',
    fieldProps: {
    },
    control: ProFormRadio.Group,
  },
  {
    type: 'date',
    label: 'Date',
    icon: <FaCalendarAlt />,
    widget: DateInput,
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
    widget: DateInput,
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
    widget: DateInput,
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
    widget: DateInput,
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
    widget: TaskFileUploader,
    fieldProps: {
    },
    renderFormItem: (schema, config, form) => <TaskFileUploader />,
    control: TaskFileUploader,
  },
  {
    type: 'autodoc',
    label: 'Doc template (PDF)',
    icon: <FilePdfFilled />,
    fieldProps: {
    },
    renderFormItem: (schema, config, form) => <AutoDocInput />,
    control: AutoDocInput,
  },
]);