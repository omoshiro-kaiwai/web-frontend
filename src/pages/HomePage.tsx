import React, {useEffect, useState} from 'react';
import { Link } from 'react-router-dom';
import * as yaml from 'js-yaml';
import './HomePage.css';

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
        if(typeof parsedYaml === 'object' && parsedYaml !== null){
            data = parsedYaml as PostFrontmatter;
        }
        else {
            console.error('yamlのパース結果に異常があります');
        }
    } catch (e) {
        console.error('YAMLパースエラー:', e);
    }

    return { data, body };
}

const getAuthorImagePath = (authorID?: number): string | null => {
    if (!authorID) return null;
    const imageName = 'user' + authorID + '.jpg';
    return `/images/${imageName}`;
};

const HomePage: React.FC = () => {

    const [posts, setPosts] = useState<Post[]>([]);
    
        useEffect(() => {
            async function loadPosts() {
            const loadedPosts = [];

            console.log('postFiles:', postFiles); // デバッグ用
    
            for (const path in postFiles) {
                console.log('Processing path:', path); // デバッグ用
                const contentModule = await postFiles[path]();
                const content = typeof contentModule === 'string' ? contentModule: (contentModule as any).default;
                
                if(typeof content !== 'string') {
                    console.error(`Failed to load content for ${path}`);
                    continue;
                }

                const { data } = parseFrontMatter(content);
                const fileName = path.split('/').pop();

                if(fileName) {
                    loadedPosts.push({
                        frontmatter: data,
                        slug: fileName.replace(/\.md$/, ''),
                    });
                } else {
                    console.warn(`Could not extract filename from path: ${path}`);
                }
            }
    
            const sorted = loadedPosts
                .filter(post =>
                    post.frontmatter &&
                    typeof post.frontmatter.date === 'string' &&
                    !isNaN(new Date(post.frontmatter.date).getTime())
                )
                .sort((a, b) => 
                    new Date(b.frontmatter.date as string).getTime() - new Date(a.frontmatter.date as string).getTime())
                .slice(0, 3);

                setPosts(sorted);
            }

            loadPosts();
        }, []);

    return (
        <div className="home-page-container">
        <Header />

        <main className="main-content">
            <div className="container">
            <section className="hero-section">
                <h1>おもしろ界隈のブログへようこそ</h1>
                <p>俺たちの「おもしろ」を、世界へ。</p>
                <a href="/blogs" className="cta-button">最新記事を読む</a>
            </section>

            <section className="blog-posts-preview">
                <h2>最近の投稿</h2>
                <div className="post-card-container">
                    {posts.map((post) => {
                        const authorImagePath = getAuthorImagePath(post.frontmatter.authorID);
                        return (
                            <div key={post.slug} className="post-card">
                                <h3>{post.frontmatter.title}</h3>
                                {post.frontmatter.date && (
                                <p className="post-date">{post.frontmatter.date}</p>
                                )}
                                <p>{post.frontmatter.summary}</p>
                                {post.frontmatter.author && ( 
                                    <div className="author-info"> 
                                        {authorImagePath && (
                                            <img 
                                                src={authorImagePath} 
                                                alt={post.frontmatter.author} 
                                                className="author-image"
                                            />
                                        )}
                                        <span className="author-name">{post.frontmatter.author}</span>
                                    </div>
                                )}
                                <Link to={`/blog/${post.slug}`} className="read-more">
                                続きを読む &rarr;
                                </Link>
                            </div>
                        );
                    })}
                </div>
            </section>
            <div className="navigation-links">
                <Link to="/blogs" className="cta-button-secondary">他の記事を見る &rarr;</Link>
            </div>
            </div>
        </main>

        <Footer />
        </div>
    )
}

export default HomePage;