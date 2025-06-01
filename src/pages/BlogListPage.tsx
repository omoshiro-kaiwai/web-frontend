import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import * as yaml from 'js-yaml';
import './BlogListPage.css'; // 既存のCSSファイルをインポート

import Header from '../components/Header';
import Footer from '../components/Footer';

interface PostFrontmatter {
    title: string;
    date: string;
    summary: string;
    author?: string;
    authorID?: number; // 執筆者ID
    tags?: string[];
    [key: string]: any;
}

interface ParsedContent {
    data: Partial<PostFrontmatter>;
    body: string;
}

interface Post {
    frontmatter: Partial<PostFrontmatter>;
    slug: string;
}

const postFiles = import.meta.glob('../assets/blog/*.md', { query: '?raw', import: 'default' });

function parseFrontMatter(content: string): ParsedContent {
    const match = /^---\n([\s\S]+?)\n---/.exec(content);
    if (!match) return { data: {}, body: content };

    const yamlContent = match[1];
    const body = content.slice(match[0].length).trim();

    let data: Partial<PostFrontmatter> = {};
    try {
        const parsedYaml = yaml.load(yamlContent);
        if (typeof parsedYaml === 'object' && parsedYaml !== null) {
            data = parsedYaml as PostFrontmatter;
        } else {
            console.error('yamlのパース結果に異常があります');
        }
    } catch (e) {
        console.error('YAMLパースエラー:', e);
    }
    return { data, body };
}

// authorIDから画像のパスを取得する関数
const getAuthorImagePath = (authorID?: number): string | null => {
    if (!authorID) return null;
    const imageName = 'user' + authorID + '.jpg';
    // publicディレクトリからの絶対パスを想定
    return `/images/${imageName}`;
};

const BlogListPage: React.FC = () => {
    const [posts, setPosts] = useState<Post[]>([]);

    useEffect(() => {
        async function loadPosts() {
            const loadedPosts: Post[] = [];
            try {
                for (const path in postFiles) {
                    const contentModule = await postFiles[path]();
                    const content = typeof contentModule === 'string' ? contentModule : (contentModule as any).default;

                    if (typeof content !== 'string') {
                        console.error(`Failed to load content for ${path}`);
                        continue;
                    }

                    const { data } = parseFrontMatter(content);
                    const fileName = path.split('/').pop();

                    if (fileName) {
                        loadedPosts.push({
                            frontmatter: data,
                            slug: fileName.replace(/\.md$/, ''),
                        });
                    } else {
                        console.warn(`Could not extract filename from path: ${path}`);
                    }
                }

                const sortedPosts = loadedPosts
                    .filter(post =>
                        post.frontmatter &&
                        typeof post.frontmatter.date === 'string' &&
                        !isNaN(new Date(post.frontmatter.date).getTime())
                    )
                    .sort((a, b) =>
                        new Date(b.frontmatter.date as string).getTime() - new Date(a.frontmatter.date as string).getTime()
                    );
                setPosts(sortedPosts);
            } catch (e) {
                console.error("Failed to load posts:", e);
            }
        }

        loadPosts();
    }, []);

    return (
        <div className="blog-list-page-container">
            <Header />
            <main className="main-content">
                <div className="container">
                    <section className="page-header">
                        <h1>ブログ記事一覧</h1>
                        <p>すべての投稿を新しい順で表示しています。</p>
                    </section>

                    <div className="blog-list">
                        {posts.length > 0 ? (
                            posts.map((post) => {
                                const authorName = post.frontmatter.author;
                                const authorImagePath = getAuthorImagePath(post.frontmatter.authorID);

                                return (
                                    <article key={post.slug} className="blog-list-item">
                                        <header className="blog-list-item-header">
                                            <h2>
                                                <Link to={`/blog/${post.slug}`}>
                                                    {post.frontmatter.title || 'タイトルなし'}
                                                </Link>
                                            </h2>
                                        </header>
                                        {(post.frontmatter.date || authorName) && (
                                            <div className="post-meta">
                                                {post.frontmatter.date && (
                                                    <time dateTime={new Date(post.frontmatter.date as string).toISOString().split('T')[0]}>
                                                        {new Date(post.frontmatter.date as string).toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' })}
                                                    </time>
                                                )}
                                                {authorName && (
                                                    <span className="author-info">
                                                        {authorImagePath ? (
                                                            <img
                                                                src={authorImagePath}
                                                                alt={`${authorName}のアイコン`}
                                                                className="author-icon"
                                                                onError={() => {
                                                                    console.warn(`著者の画像が見つかりませんでした: ${authorImagePath}`);
                                                                    // ここでは表示の切り替えは行わず、altテキストが表示されるか、
                                                                    // CSS側で壊れた画像アイコンのスタイルを調整することを想定します。
                                                                }}
                                                            />
                                                        ) : (
                                                            <span className="author-icon default-author-icon">
                                                                {/* デフォルトアイコンはCSSで::before contentやbackground-imageで指定、またはSVGを直接記述 */}
                                                            </span>
                                                        )}
                                                        <span className="author-name">{authorName}</span>
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                        <p className="blog-list-item-summary">
                                            {post.frontmatter.summary || '概要がありません。'}
                                        </p>
                                        <Link to={`/blog/${post.slug}`} className="read-more-link">
                                            続きを読む &rarr;
                                        </Link>
                                    </article>
                                );
                            })
                        ) : (
                            <div className="no-posts-message">
                                <p>投稿はまだありません。</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}

export default BlogListPage;