// pages/index.js
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Header from '../components/Header';
import Footer from '../components/Footer';
import useWeb3 from '../hooks/useWeb3';

const Home = () => {
  const { address, connectWallet, disconnectWallet } = useWeb3();
  const router = useRouter();

  useEffect(() => {
    if (address) {
      router.push('/profile');
    }
  }, [address]);

  return (
    <div className="flex flex-col min-h-screen">
      <Header address={address} onConnect={connectWallet} onLogout={disconnectWallet} />
      <main className="flex-grow flex items-center justify-center">
        <button
          onClick={connectWallet}
          className="bg-blue-500 text-white px-6 py-3 rounded"
        >
          Connect Wallet
        </button>
      </main>
      <Footer />
    </div>
  );
};

export default Home;

