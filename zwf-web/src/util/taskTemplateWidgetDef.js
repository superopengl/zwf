import {
  FaTextWidth,
  FaAlignLeft,
  FaCheckSquare,
  FaChevronCircleDown,
  FaDotCircle,
  FaCalendarAlt,
} from 'react-icons/fa';
import {TiSortNumerically} from 'react-icons/ti'
import Icon, { UploadOutlined } from '@ant-design/icons'
import { TaskFileUploader } from 'components/TaskFileUploader';
import { DateInput } from 'components/DateInput';
import { Upload } from 'antd';
import { AutoDocInput } from 'components/AutoDocInput';

export const TaskTemplateWidgetDef = Object.freeze([
  {
    type: 'input',
    label: 'Text',
    icon: <FaTextWidth />,
    widget: 'input',
    widgetPorps: {
      allowClear: true,
      maxLength: 150,
    },
  },
  {
    type: 'number',
    label: 'Number',
    icon: <Icon component={() => <small><strong>123</strong></small>} />,
    widget: 'number',
    widgetPorps: {
      style: {
        width: '100%'
      }
    },
  },
  {
    type: 'textarea',
    label: 'Paragraph (multiple lines)',
    icon: <FaAlignLeft />,
    widget: 'textarea',
    widgetPorps: {
      allowClear: true,
      showCount: true,
      maxLength: 1000,
    },
  },
  {
    type: 'radio',
    label: 'Multiple choice',
    icon: <FaDotCircle />,
    widget: 'radio-group',
    widgetPorps: null,
  },
  {
    type: 'checkbox',
    label: 'Checkboxes',
    icon: <FaCheckSquare />,
    widget: 'checkbox-group',
    widgetPorps: null,
  },
  {
    type: 'select',
    label: 'Dropdown',
    icon: <FaChevronCircleDown />,
    widget: 'select',
    widgetPorps: null,
  },
  {
    type: 'date',
    label: 'Date',
    icon: <FaCalendarAlt />,
    widget: DateInput,
    widgetPorps: {
      picker: 'date'
    },
  },
  {
    type: 'month',
    label: 'Month',
    icon: <FaCalendarAlt />,
    widget: DateInput,
    widgetPorps: {
      picker: 'month',
      format: 'YYYY-MM'
    },
  },
  {
    type: 'quarter',
    label: 'Quarter',
    icon: <FaCalendarAlt />,
    widget: DateInput,
    widgetPorps: {
      picker: 'quarter',
      format: 'YYYY-\\QQ'
    },
  },
  {
    type: 'year',
    label: 'Year',
    icon: <FaCalendarAlt />,
    widget: DateInput,
    widgetPorps: {
      picker: 'year',
      format: 'YYYY'
    },
  },
  {
    type: 'upload',
    label: 'Attachments',
    icon: <UploadOutlined />,
    widget: TaskFileUploader,
    widgetPorps: {
    },
  },
  {
    type: 'autodoc',
    label: 'Auto doc',
    icon: <UploadOutlined />,
    widget: AutoDocInput,
    widgetPorps: {
    },
  },
]);