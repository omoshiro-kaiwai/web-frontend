// astro.config.mjs
import { defineConfig } from 'astro/config';
import fs from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

export default defineConfig({
  hooks: {
    'astro:build:done': async ({ dir }) => {
      // 出力先ディレクトリを取得（例: dist）
      const outDir = fileURLToPath(dir);

      console.log('✨ RSS生成スクリプトを実行中...');
      const { generateRSS } = await import('./src/scripts/generate-rss.mjs');
      await generateRSS(outDir);
      console.log('✅ RSS生成完了');
    },
  },
});
