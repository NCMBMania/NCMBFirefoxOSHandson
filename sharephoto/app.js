window.addEventListener("load", function() {
  console.log("Hello World!");
  var application_key = "cd9e16e539b6aa8bf567e90b95aec87472e3d957ec1183b535fa70f1f0067052"; // アプリケーションキー
  var client_key = "3de0306f0a03b8698040820f6cb309141011985af493e863a9504fd813e52c9f"; // クライアントキー
  NCMB.initialize(application_key, client_key);  // 初期化の実行  
  
  var GalleryController = {
    init : function() {
      console.log(GalleryController);
      GalleryController.refresh();
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
        
        // ファイルリーダーオブジェクト
        var reader = new FileReader();
        // 縮小画像を当てはめる画像オブジェクト
        var image = new Image();
        
        // ファイルリーダーで読み込んだら以下の処理を実行
        reader.onloadend = function() {
          
          // 画像オブジェクトに読み込んだら以下の処理を実行
          image.onload = function() {
            // 画像を加工するためのCanvasオブジェクト生成
            var canvas = $("<canvas />")[0];
            var max  = 200; // 加工する画像の幅
            ctx = canvas.getContext('2d');
            
            ctx.clearRect(0, 0, 0, 0);
            if (image.width < image.height) {
              // 縦長の場合
              canvas.height = max; // 高さ固定
              canvas.width  = max * image.width / image.height; // 加工後の画像の高さ
            }else{
              canvas.width  = max; // 幅固定
              canvas.height = max * image.height / image.width; // 加工後の画像の高さ
            }
            ctx.drawImage(image, 0, 0, canvas.width, canvas.height); // 縮小処理
            
            // toDataURLで取り出せるデータはBase64なのでBlobに変換します。
            var data = toBlob(canvas.toDataURL());
            
            // NCMB ファイルストレージの生成
            var ncmbFile = new NCMB.File(Date.now() + file.name, data, "image/png");
            
            // 保存処理
            ncmbFile.save().then(function() {
              // アップロード成功
              console.log("アップロードしました！");
              GalleryController.refresh();
            }, function(error) {
              // アップロード失敗
              console.log("アップロード失敗しました", error);
            });
          };
          
          // ファイルリーダーの結果を画像オブジェクトに適用
          image.src = reader.result;
        };
        
        // ファイルリーダーの読み込み処理開始
        reader.readAsDataURL(file);        
      }
    },

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
});

var PhotoController = {
    init : function() {
      this.filename = location.hash.replace(/^#/, "");
      // コメント用オブジェクトを定義
      this.Comment = NCMB.Object.extend("Comment"); // 追加
      // 戻るをタップした時の処理
      $('#back').on('click', function() {
        location.href = 'index.html';
      });
      $("#comment").on("click", function (e) {
        e.preventDefault();
        PhotoController.addComment();
      });

      // 写真を表示
      this.show();
      // コメントを表示
      this.showComments(); // 追加
    },
    
    // 写真の表示処理を行う
    show: function () {
      var objFile = new NCMB.File(this.filename, null, null, null);
      objFile.fetchImgSource($('#img').get(0));
    },    
    
    // コメントの取得
    showComments: function () {
       // 検索用オブジェクト、NCMB.Queryのインスタンス作成
       var query = new NCMB.Query(this.Comment);
       
       // ファイル名を検索条件に指定
       query.equalTo("filename", this.filename);
       
       // 検索実行
       query.find().then(function (comments) {
           // 検索成功
           // 既存の内容は一旦すべて破棄
           $("#comments").empty();
           PhotoController.renderComments(comments);
       });        
    },
    
    // コメント描画処理
    renderComments: function(comments) {
    	$(comments).each(function (i, comment) {
        $("#comments").append("<div class='comment'>"+comment.get("message")+"</div>")
       });
    },
    
    // コメント追加処理
    addComment: function () {
      // 入力内容の取得
      var message = $("#message").val();
      
      // コメントオブジェクトを作成（インスタンス化）
      var comment = new this.Comment();
      
      // コメントおよびファイル名をセット
      comment.set("filename", this.filename);
      comment.set("message", message);
      
      // 保存処理の実行
      comment.save().then(function (comment) {
        // 成功時はまずコメント入力欄を消去
        $("#message").val("");
        
        // コメントを追記で描画
        PhotoController.renderComments([comment]);
      }, function (e) {
        console.debug(e); 
      });
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

function toBlob(base64) {
  var bin = atob(base64.replace(/^.*,/, ''));
  var buffer = new Uint8Array(bin.length);
  for (var i = 0; i < bin.length; i++) {
    buffer[i] = bin.charCodeAt(i);
  }
  // Blobを作成
  try{
    var blob = new Blob([buffer.buffer], {
      type: 'image/png'
    });
  }catch (e){
    return false;
  }
  return blob;
}
