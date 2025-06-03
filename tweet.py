import tweepy
import os
import sys
from pathlib import Path
import yaml
import re

def extract_frontmatter_title(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        match = re.match(r'^---\s*\n(.*?)\n---\s*\n', content, re.DOTALL | re.MULTILINE)
        if match:
            frontmatter_str = match.group(1)
            frontmatter_data = yaml.safe_load(frontmatter_str)
            if isinstance(frontmatter_data, dict) and 'title' in frontmatter_data:
                return frontmatter_data['title']
    except FileNotFoundError:
        print(f"⚠️ ファイルが見つかりません: {filepath}")
    except yaml.YAMLError as e:
        print(f"⚠️ YAMLのパースに失敗しました: {filepath}, エラー: {e}")
    except Exception as e:
        print(f"⚠️ フロントマターの読み込み中に予期せぬエラーが発生しました: {e}")
    return None

def tweet_blog_update(filename):
    api_key = os.getenv("TWITTER_API_KEY")
    api_secret = os.getenv("TWITTER_API_SECRET")
    access_token = os.getenv("TWITTER_ACCESS_TOKEN")
    access_secret = os.getenv("TWITTER_ACCESS_SECRET")

    client = tweepy.Client(
        consumer_key=api_key,
        consumer_secret=api_secret,
        access_token=access_token,
        access_token_secret=access_secret
    )

    mdfile_title = extract_frontmatter_title(filename)
    
    slug = Path(filename).stem

    if not mdfile_title:
        print(f"⚠️ YAMLフロントマターからtitleが取得できなかったため、ファイル名を元にタイトルを生成します: {filename}")
        mdfile_title = slug.replace('-', ' ').replace('_', ' ').capitalize()

    url = f"https://omoshirokaiwai.com/blog/{slug}"
    tweet_text = f"New Post!\n{mdfile_title} | おもしろ界隈\n{url}"

    try:
        client.create_tweet(text=tweet_text)
        print("✅ ツイート成功:", tweet_text)
    except Exception as e:
        print("⚠️ ツイート失敗:", e)
        sys.exit(1)

if __name__ == "__main__":
    if len(sys.argv) > 1:
        filepath = sys.argv[1]
        tweet_blog_update(filepath)
    else:
        print("⚠️ ファイルパスが引数として渡されていません。")
        sys.exit(1)