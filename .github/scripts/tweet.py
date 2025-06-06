import tweepy
import os
import sys
from pathlib import Path
import yaml
import re

def extract_frontmatter_data(filepath):
    """
    MarkdownファイルからYAMLフロントマターを抽出し、
    titleとauthorを含む辞書を返す。
    """
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # --- で囲まれたフロントマター部分を正規表現で探す
        match = re.match(r'^---\s*\n(.*?)\n---\s*\n', content, re.DOTALL | re.MULTILINE)
        if match:
            frontmatter_str = match.group(1)
            frontmatter_data = yaml.safe_load(frontmatter_str)
            if isinstance(frontmatter_data, dict):
                # titleとauthorを辞書として返す (存在しない場合はNoneになる)
                return {
                    'title': frontmatter_data.get('title'),
                    'author': frontmatter_data.get('author')
                }
    except FileNotFoundError:
        print(f"⚠️ ファイルが見つかりません: {filepath}")
    except yaml.YAMLError as e:
        print(f"⚠️ YAMLのパースに失敗しました: {filepath}, エラー: {e}")
    except Exception as e:
        print(f"⚠️ フロントマターの読み込み中に予期せぬエラーが発生しました: {e}")
    
    # エラーが発生した場合やフロントマターがない場合は空の辞書を返す
    return {}

def tweet_blog_update(filename):
    """
    ブログの更新情報をTwitterに投稿する。
    """
    api_key = os.getenv("TWITTER_API_KEY")
    api_secret = os.getenv("TWITTER_API_SECRET")
    access_token = os.getenv("TWITTER_ACCESS_TOKEN")
    access_secret = os.getenv("TWITTER_ACCESS_SECRET")

    # 環境変数が設定されているか確認 (オプション)
    if not all([api_key, api_secret, access_token, access_secret]):
        print("⚠️ TwitterのAPIキー/アクセストークンが環境変数に設定されていません。")
        sys.exit(1)

    client = tweepy.Client(
        consumer_key=api_key,
        consumer_secret=api_secret,
        access_token=access_token,
        access_token_secret=access_secret
    )

    # フロントマターからデータを取得
    frontmatter = extract_frontmatter_data(filename)
    mdfile_title = frontmatter.get('title')
    author = frontmatter.get('author')
    
    slug = Path(filename).stem

    # titleが取得できなかった場合のフォールバック処理
    if not mdfile_title:
        print(f"⚠️ YAMLフロントマターからtitleが取得できなかったため、ファイル名を元にタイトルを生成します: {filename}")
        mdfile_title = slug.replace('-', ' ').replace('_', ' ').capitalize()

    url = f"https://omoshirokaiwai.com/blog/{slug}"
    
    # authorの有無によってツイートの文面を変更
    if author:
        tweet_text = f"New Post by {author}!\n{mdfile_title} | おもしろ界隈\n{url}"
    else:
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