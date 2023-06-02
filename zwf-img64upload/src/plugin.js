/**
 * TinyMCE version 6.4.1 (2023-03-29)
 */

(function () {
  'use strict';

  tinymce.PluginManager.add('img64upload', function (editor) {

    editor.ui.registry.addButton('img64upload', {
      icon: 'image',

      onAction: function () {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = function (event) {
          const file = event.target.files[0];
          const fileReader = new FileReader();
          fileReader.readAsDataURL(file);
          fileReader.onload = (event) => {
            const base64Data = event.target.result;
            const imageHtml = `<img src="${base64Data}" alt="Image" />`;
            editor.insertContent(imageHtml);
          }
        };
        input.click();
      }
    });




  });
})();