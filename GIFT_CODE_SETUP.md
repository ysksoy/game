# 🎁 Amazonギフトコード暗号化機能 - クイックスタート

## 📋 概要
ゲームクリア時に「合言葉」を入力させ、正しい合言葉でAmazonギフトコードを表示する機能です。

## 🚀 セットアップ（3ステップ）

### 1️⃣ ギフトコードと合言葉を設定
`scripts/encrypt-gift-code.js` を開いて編集：
```javascript
const GIFT_CODE = 'XXXX-XXXXXX-XXXX';  // ← 実際のギフトコードに変更
const PASSPHRASE = 'あけましておめでとう';  // ← 好きな合言葉に変更
```

### 2️⃣ 暗号化文字列を生成
```bash
node scripts/encrypt-gift-code.js
```
出力された `U2FsdGVkX1+...` の文字列をコピー

### 3️⃣ ゲームに組み込む
`src/components/game/Level.tsx` の15行目を編集：
```typescript
const ENCRYPTED_GIFT_CODE = "U2FsdGVkX1+..."; // ← コピーした文字列を貼り付け
```

## ✅ 完了！
これでゲームをクリアすると、合言葉を入力するプロンプトが表示されます。

## 🔒 セキュリティ
- 暗号化文字列の生成後、`scripts/encrypt-gift-code.js` からギフトコードと合言葉を削除することをお勧めします
- この暗号化は「ソースコードを直接読んでも分からない」程度の隠蔽です
- 完全なセキュリティが必要な場合は、サーバーサイドでの検証を実装してください

## 📚 詳細ドキュメント
詳しい説明は `docs/GIFT_CODE_ENCRYPTION.md` を参照してください。
