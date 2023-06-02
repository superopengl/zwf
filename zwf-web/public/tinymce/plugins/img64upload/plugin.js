(function () {
    'use strict';
    tinymce.PluginManager.add('img64upload', function (editor) {
        editor.ui.registry.addButton('img64upload', {
            icon: 'image',
            onAction: function () {
                var input = document.createElement('input');
                input.type = 'file';
                input.accept = 'image/*';
                input.onchange = function (event) {
                    var file = event.target.files[0];
                    var fileReader = new FileReader();
                    fileReader.readAsDataURL(file);
                    fileReader.onload = function (event) {
                        var base64Data = event.target.result;
                        var imageHtml = "<img src=\"".concat(base64Data, "\" alt=\"Image\" />");
                        editor.insertContent(imageHtml);
                    };
                };
                input.click();
            }
        });
    });
})();
