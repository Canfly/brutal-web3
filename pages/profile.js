// pages/profile.js
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Header from '../components/Header';
import Footer from '../components/Footer';
import useWeb3 from '../hooks/useWeb3';

const Profile = () => {
  const { address, disconnectWallet } = useWeb3();
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [newPage, setNewPage] = useState('');

  useEffect(() => {
    if (!address) {
      router.push('/');
    } else {
      fetch('/api/profile', {
        headers: {
          'x-user-address': address,
        },
      })
        .then(res => res.json())
        .then(data => setProfile(data));
    }
  }, [address]);

  const handleAddPage = async (e) => {
    e.preventDefault();
    if (!newPage) return;

    const res = await fetch('/api/add-page', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-address': address,
      },
      body: JSON.stringify({ title: newPage }),
    });

    if (res.ok) {
      const updatedProfile = await res.json();
      setProfile(updatedProfile);
      setNewPage('');
    } else {
      console.error("Ошибка при добавлении страницы");
    }
  };

  if (!profile) return <div>Loading...</div>;

  return (
    <div className="flex flex-col min-h-screen">
      <Header address={address} onConnect={() => {}} onLogout={disconnectWallet} />
      <main className="flex-grow p-4">
        <h1 className="text-2xl mb-4">Профиль пользователя</h1>
        <p><strong>Адрес кошелька:</strong> {profile.address}</p>
        {profile.name && <p><strong>Имя:</strong> {profile.name}</p>}

        <h2 className="text-xl mt-6 mb-2">Созданные страницы</h2>
        <ul className="list-disc list-inside">
          {profile.createdPages.map(page => (
            <li key={page.id}>{page.title}</li>
          ))}
        </ul>

        <form onSubmit={handleAddPage} className="mt-4">
          <input
            type="text"
            value={newPage}
            onChange={(e) => setNewPage(e.target.value)}
            placeholder="Название новой страницы"
            className="border p-2 rounded mr-2"
            required
          />
          <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded">
            Добавить
          </button>
        </form>
      </main>
      <Footer />
    </div>
  );
};

export default Profile;
