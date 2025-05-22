import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import * as yaml from 'js-yaml';
import './BlogListPage.css'; // CSSファイルをインポート

import Header from '../components/Header';
import Footer from '../components/Footer';

// BlogPostPage.tsx (または以前のHomePage.tsx) から持ってきた型定義
interface PostFrontmatter {
  title: string;
  date: string;
  summary?: string;
  author?: string;
  tags?: string[];
  [key: string]: any;
}

// BlogListPage で使用する記事の型
interface BlogListItem {
  slug: string;
  frontmatter: PostFrontmatter;
}

// BlogPostPage.tsx (または以前のHomePage.tsx) から持ってきた関数
interface ParsedContent {
  data: Partial<PostFrontmatter>; // パース直後はPartialで受ける
  body: string;
}

function parseFrontMatter(content: string): ParsedContent {
  const match = /^---\n([\s\S]+?)\n---/.exec(content);
  if (!match) return { data: {}, body: content };

  const yamlContent = match[1];
  const body = content.slice(match[0].length).trim();

  let data: Partial<PostFrontmatter> = {};
  try {
    const parsedYaml = yaml.load(yamlContent);
    if (typeof parsedYaml === 'object' && parsedYaml !== null) {
      // title と date は必須と見なす場合はここで検証やデフォルト値設定も可能
      data = parsedYaml as PostFrontmatter;
    } else {
      console.error('YAMLのパース結果に異常があります: ', parsedYaml);
    }
  } catch (e) {
    console.error('YAMLパースエラー:', e);
  }
  return { data, body };
}

const BlogListPage: React.FC = () => {
  const [posts, setPosts] = useState<BlogListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPosts() {
      try {
        // Viteの import.meta.glob を使ってMarkdownファイル群を読み込む
        // '../assets/blog/*.md' のパスは実際のプロジェクト構造に合わせて調整してください
        const modules = import.meta.glob('../assets/blog/*.md?raw');
        const loadedPosts: BlogListItem[] = [];

        for (const path in modules) {
          const module = await modules[path]();
          const rawContent = (module as any).default;

          if (typeof rawContent !== 'string') {
            console.warn(`ファイル ${path} のコンテンツが文字列ではありません。スキップします。`);
            continue;
          }

          const { data, body } = parseFrontMatter(rawContent);

          // slug をファイル名から生成 (例: '../assets/blog/my-post.md' -> 'my-post')
          const slug = path
            .split('/')
            .pop()
            ?.replace(/\.md$/, '') || '';

          if (!data.title || !data.date) {
            console.warn(`記事 '${slug}' (元ファイル: ${path}) にタイトルまたは日付がありません。一覧から除外される可能性があります。`);
            // 必須情報がない記事は一覧に表示しない場合
            // continue;
          }

          // PostFrontmatter型にキャストする前に必須プロパティの存在を確認
          // ここでは data が Partial<PostFrontmatter> のため、
          // BlogListItem の frontmatter は PostFrontmatter 型なので、
          // title と date が存在することを期待する。
          // 実際にはより厳密な型ガードやデフォルト値の設定が必要になることがあります。
          if (data.title && data.date) {
             loadedPosts.push({
              slug,
              frontmatter: data as PostFrontmatter, // ここでキャスト
            });
          } else {
            // タイトルや日付がない記事をどう扱うか（ログ出力、スキップなど）
            console.warn(`記事 ${slug} はタイトルまたは日付が不足しているため、一覧に表示されません。`);
          }
        }

        // 日付の降順でソート (新しい記事が上)
        loadedPosts.sort((a, b) => new Date(b.frontmatter.date).getTime() - new Date(a.frontmatter.date).getTime());

        setPosts(loadedPosts);
      } catch (e) {
        console.error('ブログ記事の読み込みまたはパースに失敗しました:', e);
        setError('記事一覧の読み込み中にエラーが発生しました。');
      } finally {
        setLoading(false);
      }
    }

    fetchPosts();
  }, []);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="container">
          <p>記事一覧を読み込んでいます...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="container">
          <p className="error-message">{error}</p>
          <Link to="/" className="cta-button-secondary">トップページへ戻る</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="blog-list-page-container">
      <Header />

      <main className="main-content">
        <div className="container">
          <header className="page-header">
            <h1>ブログ記事一覧</h1>
          </header>

          {posts.length === 0 && !loading ? (
            <div className="no-posts-message">
              <p>まだ記事がありません。</p>
            </div>
          ) : (
            <div className="blog-list">
              {posts.map(post => (
                <article key={post.slug} className="blog-list-item">
                  <header className="blog-list-item-header">
                    <h2>
                      <Link to={`/blog/${post.slug}`}>{post.frontmatter.title || '無題の記事'}</Link>
                    </h2>
                    <p className="post-meta">
                      公開日: <time dateTime={post.frontmatter.date}>{new Date(post.frontmatter.date).toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' })}</time>
                    </p>
                    {post.frontmatter.author && (
                      <p className="post-meta">執筆者: {post.frontmatter.author}</p>
                    )}
                  </header>
                  {post.frontmatter.summary && (
                    <p className="blog-list-item-summary">{post.frontmatter.summary}</p>
                  )}
                  {post.frontmatter.tags && post.frontmatter.tags.length > 0 && (
                    <div className="post-tags">
                      {post.frontmatter.tags.map(tag => (
                        <span key={tag} className="tag">{tag}</span>
                      ))}
                    </div>
                  )}
                  <Link to={`/blog/${post.slug}`} className="read-more-link">続きを読む &rarr;</Link>
                </article>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default BlogListPage;