export const GalleryDef = [
  {
    label: 'Picture or Video Link',
    name: 'imageIdOrVideoUrl',
    type: 'imageVideoUploader',
    rules: [
      {
        required: true,
        message: 'Image or video is required'
      }
    ]
  },
  {
    label: 'Title',
    name: 'title',
    rules: [
      {
        required: false
      }
    ],
    inputProps: {
      placeholder: 'Picture title',
      maxLength: 100,
      allowClear: true
    }
  },
  {
    label: 'Description',
    name: 'description',
    type: 'textarea',
    rules: [
      {
        required: false
      }
    ],
    inputProps: {
      placeholder: 'Picture description',
      maxLength: 300,
      autoSize: true,
      allowClear: true
    }
  },
  {
    label: 'Group',
    name: 'group',
    type: 'enum',
    rules: [
      {
        required: true,
        message: 'Please input gallery group'
      }
    ],
    inputProps: {
      options: [
        {value: 'badminton', label: 'Badminton'},
        {value: 'tennis', label: 'Tennis'},
        {value: 'gourmet', label: 'Gourmet'},
        {value: 'hiking', label: 'Hiking'},
        {value: 'gathering', label: 'Business Partners Gathering'},
        {value: 'tour', label: 'Touring & Sightseeing'},
      ]
    }
  },
  {
    label: 'Ordinal',
    name: 'ordinal',
    type: 'number',
    rules: [
      {
        required: false,
        type: 'number'
      }
    ],
    inputProps: {
      placeholder: 'A number used for sorting pictures in the gallery',
      min: 0
    }
  },
]