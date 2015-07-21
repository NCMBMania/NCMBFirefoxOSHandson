window.addEventListener("load", function() {
  console.log("Hello World!");
  var application_key = "f814b6cc168f4837dd9d22d4c3b37d87dde5645238d60d2e2497c90f9113cd1c"; // アプリケーションキー
  var client_key = "be16d26ec36ce4dad0cff7f0c95aea8f122cb2a499832d8cd9b8acecc3fb2a43"; // クライアントキー
  NCMB.initialize(application_key, client_key);  // 初期化の実行  
  
  var GalleryController = {
    init : function() {
      GalleryController.refresh();  // 写真のリストをリフレッシュ
      $('#image-file').change(function() {
        GalleryController.upload();
      });
    },
    
    // 画像をアップロードする
    upload : function() {
      console.log("アップロード処理開始");
      var fileInput = $("#image-file")[0];
      if (fileInput.files.length > 0) {
        var file = fileInput.files[0];            
        if (!(/\.(png|jpg|jpeg|gif)$/i).test(file.name)) {
          return true;
        }
        var ncmbFile = new NCMB.File(Date.now() + file.name, file);
        ncmbFile.save().then(function() {
          // アップロード成功
          console.log("アップロードしました！");
          GalleryController.refresh();  // 写真のリストをリフレッシュ
        }, function(error) {
          // アップロード失敗
          console.log("アップロード失敗しました", error);
        });
      }
    },
    
    // 写真データの取得
    refresh : function() {
      var query = new NCMB.Query("file");
      query.find().then(function (files) {
          console.log(files);
          GalleryController.render(files);        	
        },
        function () {
          console.log(err);
        }
      );
    },
    
    // 写真データの描画
    render : function(files) {
      var cellTemplate = $('#grid-table-cell-template')[0];
      var fragment = document.createDocumentFragment();

      files.forEach(function(file) {
        console.log("file", file);
        var cell = cellTemplate.cloneNode(true);
        var objFile = new NCMB.File(file.get('fileName'), null, null, null);
        objFile.fetchImgSource($('img', cell).get(0));
        fragment.appendChild(cell);
      });
      console.log(fragment);
      $('.grid-table-body').empty().append(fragment); 
    }

  };
  GalleryController.init();
});
