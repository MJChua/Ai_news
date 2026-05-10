# 開發流程規範

## 分支規劃

- `master`：專案初始建置與主要基準分支。
- `dev`：日常開發整合分支，所有功能與修正都從這裡開分支。
- `sit`：每週 sprint 整合測試分支，由自動流程定期從 `dev` 合併。
- `production`：正式環境分支；未來有專屬網域與正式部署流程後才合併。

## 日常開發流程

1. 從 `dev` 更新最新內容。
2. 新功能使用 `feature/<描述>` 分支。
3. 錯誤修正使用 `bug/<描述>` 分支。
4. 完成後合回 `dev`。
5. 合回前需至少執行：

```bash
npm run lint
npm run build
```

## 每週 Sprint 與 SIT

- 每週為一個 sprint 週期。
- GitHub Actions 會每週自動嘗試將 `dev` 合併到 `sit`。
- 若自動合併發生衝突，workflow 會失敗，需人工解衝突後再推回 `sit`。
- `sit` 用於整合測試，不直接作為正式發布來源。

## Production 規則

- `production` 目前只建立分支，不做自動合併。
- 只有在未來專屬網域、部署設定與正式驗收條件完成後，才允許從穩定分支合併到 `production`。
- 合併到 `production` 前必須通過 lint、build 與人工畫面檢查。

