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
import { FileUploader } from 'components/FileUploader';

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
    icon: <Icon component={() => <small style={{position:'relative', top: -4}}><strong>123</strong></small>} />,
    widget: 'number',
    widgetPorps: {
      allowClear: true,
      min: 0,
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
    type: 'upload',
    label: 'File upload',
    icon: <UploadOutlined />,
    forwardRef: true,
    widget: FileUploader,
    widgetPorps: null,
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
    widget: 'date-picker',
    widgetPorps: {
      picker: 'date'
    },
  },
  {
    type: 'month',
    label: 'Month',
    icon: <FaCalendarAlt />,
    widget: 'date-picker',
    widgetPorps: {
      picker: 'month'
    },
  },
  {
    type: 'quarter',
    label: 'Quarter',
    icon: <FaCalendarAlt />,
    widget: 'date-picker',
    widgetPorps: {
      picker: 'quarter'
    },
  },
  {
    type: 'year',
    label: 'Year',
    icon: <FaCalendarAlt />,
    widget: 'date-picker',
    widgetPorps: {
      picker: 'year'
    },
  },
]);