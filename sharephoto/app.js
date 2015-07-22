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
      // 写真をタップした時のイベント
      $('.grid-table-body').on('click', '.tappable', function(e) {
        console.log($(e.target));
        location.href = 'detail.html#' + $(e.target).attr("data-filename");
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
        // 以下を追加
        $(cell).find("img").attr("data-filename", file.get('fileName')); // ファイル名を残す
        fragment.appendChild(cell);
      });
      console.log(fragment);
      $('.grid-table-body').empty().append(fragment); 
    }

  };
  
  var PhotoController = {
    init : function() {
      this.filename = location.hash.replace(/^#/, "");
      // 戻るをタップした時の処理
      $('#back').on('click', function() {
        location.href = 'index.html';
      });
      // 写真を表示
      this.show();
    },
    
    // 写真の表示処理を行う
    show: function () {
      var objFile = new NCMB.File(this.filename, null, null, null);
      objFile.fetchImgSource($('#img').get(0));
    },    
  };

  if (document.location.pathname == "/index.html") {
    // これまで通り
    GalleryController.init();
  }else{
    // 追加
    PhotoController.init();
  }
});
