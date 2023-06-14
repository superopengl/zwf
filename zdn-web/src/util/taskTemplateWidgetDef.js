import {
  FaTextWidth,
  FaAlignLeft,
  FaCheckSquare,
  FaChevronCircleDown,
  FaDotCircle,
  FaCheck,
  FaCalendarAlt,
  FaClock,
} from 'react-icons/fa';
import Icon, { DeleteOutlined, UploadOutlined } from '@ant-design/icons'

export const TaskTemplateWidgetDef = Object.freeze([
  {
    type: 'input',
    label: 'Text',
    icon: <FaTextWidth />,
    widget: 'input',
    widgetPorps: null,
  },
  {
    type: 'textarea',
    label: 'Paragraph (multiple lines)',
    icon: <FaAlignLeft />,
    widget: 'textarea',
    widgetPorps: null,
  },
  {
    type: 'upload',
    label: 'File upload',
    icon: <UploadOutlined />,
    widget: 'upload',
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