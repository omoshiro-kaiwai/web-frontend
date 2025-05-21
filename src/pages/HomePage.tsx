import React, {useEffect, useState} from 'react';
import grayMatter from 'gray-matter';
import './HomePage.css';

interface PostFrontmatter {
    title: string;
    date: string;
    summary: string;
    [key: string]: any;
}

interface BlogPost {
  slug: string;
  frontmatter: PostFrontmatter;
  content?: string;
}

const HomePage: React.FC = () => {

    const [latestPosts, setLatestPosts] = useState<BlogPost[]>([]);

    useEffect(() => {
    const fetchPosts = async () => {
    const modules = import.meta.glob('/src/assets/blog/**/*.md', {
        as: 'raw', // Vite 5.1+ では 'string' も可
        eager: true, // 同期的に読み込む
    });

    console.log('Vite modules:', modules); // デバッグ用

    const posts: BlogPost[] = [];
    for (const path in modules) {
        console.log('Processing path:', path); // デバッグ用

        const rawContent = modules[path];
        const { data } = grayMatter(rawContent); // contentも必要なら { data, content }

        console.log('Frontmatter (data):', data); // デバッグ用

        // ファイルパスからslugと日付を抽出（例）
        // src/assets/blog/2025-05-22-my-vite-post.md -> 2025-05-22-my-vite-post
        const slug = path
        .split('/')
        .pop()
        ?.replace(/\.md$/, '') || '';

        // フロントマターの日付を優先するが、なければファイル名から推測するロジックも追加可能
        const postDate = data.date || slug.substring(0, 10); // YYYY-MM-DD

        posts.push({
        slug,
        frontmatter: {
            title: data.title || '無題の記事',
            date: postDate,
            summary: data.summary || '概要がありません。',
            ...data, // その他のフロントマターも展開
        },
        // content: content, // contentも保持する場合
        });
    }

    // 日付で降順ソート
    const sortedPosts = posts.sort(
        (a, b) =>
        new Date(b.frontmatter.date).getTime() -
        new Date(a.frontmatter.date).getTime()
    );

    setLatestPosts(sortedPosts.slice(0, 3));
    };

    fetchPosts().catch(console.error);
    }, []);

    return (
        <div className="home-page-container">
        <header className="header">
            <div className="container header-content">
            {/* ロゴはテキストまたは画像に置き換えてください */}
            <a href="/" className="logo-link">
                おもしろ界隈
            </a>
            <nav className="navigation">
                <ul>
                <li><a href="/about">About</a></li>
                <li><a href="/blogs">Blogs</a></li>
                <li><a href="/contact">Contact</a></li>
                </ul>
            </nav>
            </div>
        </header>

        <main className="main-content">
            <div className="container">
            <section className="hero-section">
                <h1>おもしろ界隈のブログへようこそ</h1>
                <p>バナナ</p>
                <a href="/blogs" className="cta-button">最新記事を読む</a>
            </section>

            <section className="blog-posts-preview">
                <h2>最近の投稿</h2>
                <div className="post-card-container">
                {latestPosts.length > 0 ? (
                    latestPosts.map((post) => (
                    <div className="post-card" key={post.slug}>
                        <h3>{post.frontmatter.title}</h3>
                        {post.frontmatter.date && (
                        <p className="post-date">{post.frontmatter.date}</p>
                        )}
                        <p>{post.frontmatter.summary}</p>
                        <a href={`/blog/${post.slug}`} className="read-more">
                        続きを読む &rarr;
                        </a>
                    </div>
                    ))
                ) : (
                    <p>最近の投稿はありません。</p>
                )}
                </div>
            </section>
            </div>
        </main>

        <footer className="footer">
            <div className="container">
            <p>&copy; {new Date().getFullYear()} MySiteLogo. All rights reserved.</p>
            </div>
        </footer>
        </div>
    )
}

export default HomePage;