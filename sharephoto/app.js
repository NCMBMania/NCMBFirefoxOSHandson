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
    
    // 初期化処理
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
