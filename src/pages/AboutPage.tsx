import React from 'react';
import './AboutPage.css';

import Header from '../components/Header';
import Footer from '../components/Footer';

interface Member {
  id: number;
  name: string;
  bio: string;
  twitterUsername: string;
  profileIcon: string;
}

const membersData: Member[] = [
	{
		id: 99,
		name: 'おもしろ界隈',
		bio: 'みんなで記事をあげるときのユーザー',
		twitterUsername: 'omoshirokaiwai',
		profileIcon: 'user99.jpg',
	},
	{
		id: 1,
		name: 'Tsusu',
		bio: 'Web学習、自炊、ラーメン…日々の小さな好きを大切に、のほほんと生きています。',
		twitterUsername: 'tsusu0409',
		profileIcon: 'user1.jpg',
	},
	{
		id: 2,
		name: 'いけじーん',
		bio: 'ゲームスキルがとにかく高い生粋のゲームオタク。',
		twitterUsername: 'i_ke_ke_ke',
		profileIcon: 'user2.jpg',
	},
	{
		id: 3,
		name: 'れんきゅんなう☆',
		bio: '夢と魔法の国の住人。年中夢中なディズニー愛で、あなたを魔法の世界へ☆',
		twitterUsername: 'omoshirokaiwai',
		profileIcon: 'user3.jpg',
	},
	{
		id: 4,
		name: 'ogeeeen',
		bio: '理系とゲームの二刀流。知性と戦略を武器に、あらゆる勝利を掴み獲る！',
		twitterUsername: 'omoshirokaiwai',
		profileIcon: 'user4.jpg',
	},
	{
		id: 5,
		name: 'Sailing',
		bio: 'NBAを愛する巨漢がおもしろ界隈に見参！',
		twitterUsername: 'omoshirokaiwai',
		profileIcon: 'user5.jpg',
	},
];

const AboutPage: React.FC = () => {
	return (
		<div className="about-page-container">
			<Header />

			<main className="main-content">
			<div className="container">
				<section className="about-hero-section">
					<h1>About Us</h1>
					<p>このブログを運営しているメンバーを紹介します。</p>
				</section>

				<section className="members-section">
					<h2>メンバー紹介</h2>
					<div className="members-grid">
					{membersData.map((member) => {
						if (member.id === 99) {
							return null;
						}
						else return (
							<div key={member.id} className="member-card">
							<div className="member-icon-container">
							<img
								src={`/images/${member.profileIcon}`}
								alt={`${member.name}のプロフィールアイコン`}
								className="member-profile-icon"
							/>
							</div>
							<div className="member-info">
							<h3>{member.name}</h3>
							<p className="member-bio">{member.bio}</p>
							<a
								href={`https://twitter.com/${member.twitterUsername}`}
								target="_blank"
								rel="noopener noreferrer"
								className="twitter-link"
							>
								<img
									src="/images/x-twitter-brands.svg"
									alt="Twitter"
									className="twitter-icon"
								/>
								@{member.twitterUsername}
							</a>
							</div>
						</div>
						)
					})}
					</div>
				</section>
			</div>
			</main>

			<Footer />
		</div>
	);
};

export default AboutPage;
