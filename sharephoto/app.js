window.addEventListener("load", function() {
  console.log("Hello World!");
  var application_key = "f814b6cc168f4837dd9d22d4c3b37d87dde5645238d60d2e2497c90f9113cd1c"; // アプリケーションキー
  var client_key = "be16d26ec36ce4dad0cff7f0c95aea8f122cb2a499832d8cd9b8acecc3fb2a43"; // クライアントキー
  NCMB.initialize(application_key, client_key);  // 初期化の実行  
  
  var Hello = NCMB.Object.extend("Hello");
  var hello = new Hello();
  hello.set("message", "Hello World");
  hello.save().then(function (obj) {
    console.log("保存されました", obj);
  }, function (err) {
    console.log("保存失敗しました", err);
  });
});
