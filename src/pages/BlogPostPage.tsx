import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import * as yaml from 'js-yaml';
import ReactMarkdown from 'react-markdown';
import './BlogPostPage.css';

import Header from '../components/Header';
import Footer from '../components/Footer';

// HomePage.tsx から持ってきた型定義
interface PostFrontmatter {
    title: string;
    date: string;
    summary?: string; // summary はブログ一覧では使うが、記事ページでは必須ではない想定
    author?: string;
    tags?: string[];
    [key: string]: any;
}

interface ParsedContent {
    data: Partial<PostFrontmatter>;
    body: string;
}

interface SinglePost {
    frontmatter: Partial<PostFrontmatter>;
    content: string; // Markdown本文
    slug: string;
}

// HomePage.tsx から持ってきた関数
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
            console.error('YAMLのパース結果に異常があります');
        }
    } catch (e) {
        console.error('YAMLパースエラー:', e);
    }

    return { data, body };
}

const BlogPostPage: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const [post, setPost] = useState<SinglePost | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchPost() {
            if (!slug) {
                setError('記事のスラッグが指定されていません。');
                setLoading(false);
                return;
            }

            try {
                const postModule = await import(`../assets/blog/${slug}.md?raw`);
                const rawContent = postModule.default;

                if (typeof rawContent !== 'string') {
                    throw new Error('記事ファイルの読み込みに失敗しました。コンテンツが文字列ではありません。');
                }

                const { data, body } = parseFrontMatter(rawContent);

                if (!data.title) { // タイトルがない場合はエラー
                    console.warn(`記事 '${slug}' にタイトルがありません。`);
                }

                setPost({
                    frontmatter: data,
                    content: body,
                    slug: slug,
                });
            } catch (e: any) {
                console.error(`記事 '${slug}' の読み込みまたはパースに失敗しました:`, e);
                if (e.message.includes('Unknown variable dynamic import')) {
                    setError(`記事ファイル '../assets/blog/${slug}.md' が見つからないか、インポートパスが正しくありません。`);
                } else {
                    setError('記事の読み込み中にエラーが発生しました。');
                }
            } finally {
                setLoading(false);
            }
        }

        fetchPost();
    }, [slug]);

    if (loading) {
        return (
            <div className="loading-container">
                <div className="container">
                    <p>記事を読み込んでいます...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="error-container">
                <div className="container">
                    <p className="error-message">{error}</p>
                    <Link to="/blogs" className="cta-button-secondary">ブログ一覧へ戻る</Link>
                </div>
            </div>
        );
    }

    if (!post) {
        return (
            <div className="error-container">
                <div className="container">
                    <p>記事が見つかりませんでした。</p>
                    <Link to="/blogs" className="cta-button-secondary">ブログ一覧へ戻る</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="blog-post-page-container">
            <Header />

            <main className="main-content">
                <div className="container">
                    <article className="blog-post-content-wrapper">
                        <header className="blog-post-main-header">
                            <h1>{post.frontmatter.title || '無題の記事'}</h1>
                            {post.frontmatter.date && (
                                <p className="post-meta">
                                    公開日: <time dateTime={post.frontmatter.date}>{new Date(post.frontmatter.date).toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' })}</time>
                                </p>
                            )}
                            {post.frontmatter.author && (
                                <p className="post-meta">執筆者: {post.frontmatter.author}</p>
                            )}
                            {post.frontmatter.tags && post.frontmatter.tags.length > 0 && (
                                <div className="post-tags">
                                    {post.frontmatter.tags.map(tag => (
                                        <span key={tag} className="tag">{tag}</span>
                                    ))}
                                </div>
                            )}
                        </header>
                        <div className="blog-post-body">
                            <ReactMarkdown
                                components={{
                                    // 必要に応じて特定のHTML要素のレンダリングをカスタマイズ
                                    //例: 外部リンクに target="_blank" を自動で付与する
                                    // a: ({node, ...props}) => {
                                    //   if (props.href && props.href.startsWith('http')) {
                                    //     return <a {...props} target="_blank" rel="noopener noreferrer" />;
                                    //   }
                                    //   return <a {...props} />;
                                    // },
                                    // 例: 画像に特定のクラスを付与する
                                    // img: ({node, ...props}) => <img className="markdown-image" {...props} />
                                }}
                            >
                                {post.content}
                            </ReactMarkdown>
                        </div>
                    </article>
                    <div className="navigation-links">
                        <Link to="/blogs" className="cta-button-secondary">&larr; 他の記事を見る</Link>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default BlogPostPage;