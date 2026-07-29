import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // GitHub Pages（https://<ユーザー名>.github.io/mood-diary-web/）で配信するためのベースパス。
  // リポジトリ名を変えた場合はここも合わせて変更してください。
  base: '/mood-diary-web/',
})
