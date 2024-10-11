// hooks/useWeb3.js
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import Web3Modal from 'web3modal';

const useWeb3 = () => {
  const [provider, setProvider] = useState(null);
  const [address, setAddress] = useState(null);

  const connectWallet = async () => {
    try {
      const web3Modal = new Web3Modal({
        cacheProvider: true,
      });
      const connection = await web3Modal.connect();
      const newProvider = new ethers.providers.Web3Provider(connection);
      setProvider(newProvider);

      const signer = newProvider.getSigner();
      const userAddress = await signer.getAddress();
      setAddress(userAddress);

      localStorage.setItem('address', userAddress);

      // Вызов API для логина
      await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: userAddress }),
      });
    } catch (error) {
      console.error("Ошибка подключения кошелька:", error);
    }
  };

  const disconnectWallet = () => {
    setProvider(null);
    setAddress(null);
    localStorage.removeItem('address');
    // Можно также сбросить состояние в Web3Modal, если требуется
  };

  useEffect(() => {
    const storedAddress = localStorage.getItem('address');
    if (storedAddress) {
      setAddress(storedAddress);
      // Можно дополнительно проверить валидность адреса или обновить состояние
    }
  }, []);

  return { provider, address, connectWallet, disconnectWallet };
};

export default useWeb3;
