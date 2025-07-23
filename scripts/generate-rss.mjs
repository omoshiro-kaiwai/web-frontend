import fs from 'fs';
import path from 'path';
import RSS from 'rss';
import matter from 'gray-matter';
import { glob } from 'glob';

async function generate() {
  const feed = new RSS({
    title: 'おもしろ界隈',
    description: 'おもしろ界隈の最新投稿',
    site_url: 'https://omoshirokaiwai.com', // 自分のサイトのURLに書き換える
    feed_url: 'https://omoshirokaiwai.com/rss.xml',
    language: 'ja',
  });

  // src/assets/blogにあるmdファイルを全て取得
  const files = await glob('src/assets/blog/*.md');

  const allPosts = files.map((file) => {
    const fileContents = fs.readFileSync(file, 'utf8');
    const { data: frontmatter } = matter(fileContents);
    const basename = path.basename(file, '.md'); // ファイル名から拡張子を除去

    return {
      title: frontmatter.title,
      description: frontmatter.description,
      // 実際の記事URLに合わせて調整してください
      url: `https://omoshirokaiwai.com/blog/${basename}`,
      date: frontmatter.date,
      custom_elements: [
        { 'thumb': frontmatter.thumb },
      ],
    };
  });

  // 日付でソート
  allPosts.sort((a, b) => new Date(b.date) - new Date(a.date));

  // フィードに追加
  allPosts.forEach((post) => feed.item(post));

  // public/rss.xml にファイルとして書き出す
  fs.writeFileSync('./public/rss.xml', feed.xml({ indent: true }));
  console.log('✅ RSS feed generated successfully!');
}

generate();