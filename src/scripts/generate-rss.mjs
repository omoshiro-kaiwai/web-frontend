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

    // 基本的な投稿データを作成
    const postData = {
      title: frontmatter.title,
      description: frontmatter.summary,
      url: `https://omoshirokaiwai.com/blog/${basename}`,
      date: frontmatter.date,
      author: frontmatter.author,
    };

    // frontmatter.thumbが存在する場合のみ、custom_elementsを追加
    if (frontmatter.thumb) {
      postData.custom_elements = [
        { 'thumb': `https://omoshirokaiwai.com/${frontmatter.thumb}` }
      ];
    }

    return postData;
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
