"use client";
import { useChainId, useSwitchChain } from "wagmi";
import { polygon, polygonMumbai, sepolia } from "wagmi/chains";

export default function NetworkStatus() {
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();

  const isPolygon = chainId === 137;
  const isTestnet = chainId === 11155111 || chainId === 80001;

  const networks = [
    {
      chain: polygon,
      name: "Polygon Mainnet",
      description: "✅ Production - Super low fees (~$0.01)",
      recommended: true,
      icon: "🟣"
    },
    {
      chain: polygonMumbai,
      name: "Mumbai Testnet",
      description: "⚠️ Testing only - No real value",
      recommended: false,
      icon: "🧪"
    },
    {
      chain: sepolia,
      name: "Sepolia Testnet",
      description: "⚠️ Old testnet - Use Mumbai instead",
      recommended: false,
      icon: "🧪"
    }
  ];

  return (
    <div style={{ padding: '20px' }}>
      <h3>Switch Network</h3>
      
      {/* Current Network */}
      <div style={{
        padding: '15px',
        backgroundColor: isPolygon ? '#e8f5e9' : '#fff3cd',
        borderRadius: '8px',
        marginBottom: '20px'
      }}>
        <strong>Current Network:</strong>
        <div style={{ marginTop: '5px', fontSize: '14px' }}>
          Chain ID: {chainId}
          {isPolygon && <span style={{ color: 'green', marginLeft: '10px' }}>✅ Optimal</span>}
          {isTestnet && <span style={{ color: 'orange', marginLeft: '10px' }}>⚠️ Testnet</span>}
        </div>
      </div>

      {/* Available Networks */}
      <div style={{ display: 'grid', gap: '15px' }}>
        {networks.map((network) => (
          <div
            key={network.chain.id}
            style={{
              padding: '15px',
              border: network.recommended ? '2px solid #28a745' : '1px solid #ddd',
              borderRadius: '8px',
              backgroundColor: 'white',
              position: 'relative'
            }}
          >
            {network.recommended && (
              <div style={{
                position: 'absolute',
                top: '-10px',
                right: '10px',
                backgroundColor: '#28a745',
                color: 'white',
                padding: '3px 10px',
                borderRadius: '12px',
                fontSize: '12px'
              }}>
                Recommended
              </div>
            )}
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '18px', marginBottom: '5px' }}>
                  {network.icon} <strong>{network.name}</strong>
                </div>
                <div style={{ fontSize: '13px', color: '#666' }}>
                  {network.description}
                </div>
              </div>
              
              {chainId !== network.chain.id && (
                <button
                  onClick={() => switchChain?.({ chainId: network.chain.id })}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: network.recommended ? '#28a745' : '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  Switch
                </button>
              )}
              
              {chainId === network.chain.id && (
                <div style={{
                  padding: '8px 16px',
                  backgroundColor: '#e8f5e9',
                  color: '#28a745',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: 'bold'
                }}>
                  Connected ✓
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Help Text */}
      <div style={{
        marginTop: '20px',
        padding: '15px',
        backgroundColor: '#f0f8ff',
        borderRadius: '8px',
        fontSize: '13px'
      }}>
        <strong>💡 Need to add Polygon to MetaMask?</strong>
        <p style={{ margin: '10px 0 0 0' }}>
          MetaMask should detect it automatically. If not, add manually:
        </p>
        <ul style={{ marginTop: '10px', marginBottom: 0 }}>
          <li>Network Name: Polygon Mainnet</li>
          <li>RPC URL: https://polygon-rpc.com</li>
          <li>Chain ID: 137</li>
          <li>Currency Symbol: MATIC</li>
          <li>Block Explorer: https://polygonscan.com</li>
        </ul>
      </div>
    </div>
  );
}