# 情報系研究室HP デザイン案

Jekyll + Bootstrapを想定した静的サイトのデザイン案です。

## 構成

- `index.html`: トップページ
- `assets/css/style.css`: 追加スタイル
- `assets/js/news.js`: CSV読み込み処理
- `assets/data/news.csv`: NEWS表示用CSV
- `_config.yml`: Jekyll設定

## 確認方法

Jekyll環境がある場合:

```bash
jekyll serve
```

Jekyllがない場合も、静的サーバーで確認できます:

```bash
python -m http.server 4000
```

その後、ブラウザで `http://localhost:4000/` を開いてください。
