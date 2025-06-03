# .github/scripts/discord_notify.py

import os
import sys
import frontmatter # 外部ライブラリ: pip install python-frontmatter
import requests    # 外部ライブラリ: pip install requests
from pathlib import Path

def send_discord_notification(webhook_url, title, post_url):
    """Discordに通知を送信する関数"""
    message_content = f"New Post!\n{title} | おもしろ界隈\n{post_url}"
    payload = {"content": message_content}
    
    try:
        response = requests.post(webhook_url, json=payload, timeout=10)
        response.raise_for_status()  # HTTPエラーがあれば例外を発生
        print(f"Notification sent successfully for: {title}")
        print(f"Discord response status: {response.status_code}")
    except requests.exceptions.Timeout:
        print(f"Error sending Discord notification for '{title}': Request timed out.")
        sys.exit(1)
    except requests.exceptions.RequestException as e:
        print(f"Error sending Discord notification for '{title}': {e}")
        if hasattr(e, 'response') and e.response is not None:
            print(f"Discord response content: {e.response.text}")
        sys.exit(1)

def main():
    if len(sys.argv) < 2:
        print("Error: Markdown file path not provided as an argument.")
        sys.exit(1)
        
    markdown_file_path_str = sys.argv[1]
    markdown_file_path = Path(markdown_file_path_str)

    if not markdown_file_path.is_file():
        print(f"Error: File not found at '{markdown_file_path_str}'")
        sys.exit(1)

    try:
        # マークダウンファイルを読み込み、フロントマターをパース
        post = frontmatter.load(markdown_file_path)
    except Exception as e:
        print(f"Error loading or parsing frontmatter from '{markdown_file_path_str}': {e}")
        sys.exit(1)

    # YAMLフロントマターから 'title' を取得
    article_title = post.get('title')
    if not article_title:
        print(f"Error: 'title' not found in YAML frontmatter of '{markdown_file_path_str}'.")
        # 必要であれば、ここでファイル名からタイトルを生成するフォールバック処理も検討できます
        sys.exit(1) # 今回は 'title' が必須とします

    # ファイル名から拡張子を除いた部分をslugとして使用
    slug = markdown_file_path.stem 

    # 通知用URLを生成
    base_url = "https://omoshirokaiwai.com/blog/"
    full_post_url = f"{base_url}{slug}"

    # Discord Webhook URLを環境変数から取得
    discord_webhook_url = os.environ.get('DISCORD_WEBHOOK_URL')
    if not discord_webhook_url:
        print("Error: DISCORD_WEBHOOK_URL environment variable is not set.")
        sys.exit(1)
        
    print(f"Preparing notification for article: '{article_title}' (slug: '{slug}')")
    send_discord_notification(discord_webhook_url, article_title, full_post_url)

if __name__ == "__main__":
    main()