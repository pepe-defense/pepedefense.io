const chains = {
  mumbai: {
    chainId: '0x13881',
    chainName: 'Polygon Mumbai',
    nativeCurrency: { name: 'MATIC', decimals: 18, symbol: 'MATIC' },
    rpcUrls: ['https://matic-mumbai.chainstacklabs.com/'],
    blockExplorerUrls: ['https://mumbai.polygonscan.com/'],
  },
}

export default async chain => {
  const { ethereum } = window
  if (!ethereum) return
  const { chainId, chainName, nativeCurrency, rpcUrls, blockExplorerUrls } =
    chains[chain]
  if (ethereum.networkVersion !== chainId) {
    await window.ethereum
      .request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId }],
      })
      .catch(({ code }) => {
        // This error code indicates that the chain has not been added to MetaMask
        if (code === 4902) {
          return window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainName,
                chainId,
                nativeCurrency,
                rpcUrls,
                blockExplorerUrls,
              },
            ],
          })
        }
      })
  }
}
