// components/Header.js
import Link from 'next/link';
import { useRouter } from 'next/router';

const Header = ({ address, onConnect, onLogout }) => {
  const router = useRouter();

  const truncateAddress = (addr) => {
    return addr.slice(0, 6) + '...' + addr.slice(-4);
  };

  return (
    <header className="flex justify-between items-center p-4 bg-gray-800 text-white">
      <Link href="/" className="text-xl font-bold">brutalBaby-web3</Link>
      <div>
        {address ? (
          <>
            <span className="mr-4">{truncateAddress(address)}</span>
            <button onClick={onLogout} className="bg-red-500 px-3 py-1 rounded">
              Logout
            </button>
          </>
        ) : (
          <button onClick={onConnect} className="bg-blue-500 px-3 py-1 rounded">
            Connect Wallet
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;

