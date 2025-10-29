"use client";
import { useState } from "react";
import { useAccount, useBalance, useChainId } from "wagmi";

const WithdrawalGuide: React.FC = () => {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { data: balance } = useBalance({ address });
  const [copiedAddress, setCopiedAddress] = useState<boolean>(false);

  // ✅ UPDATED: Check for Polygon
  const isPolygon = isConnected && chainId === 137;
  const isTestnet = isConnected && (chainId === 11155111 || chainId === 80001);
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAddress(true);
    setTimeout(() => setCopiedAddress(false), 2000);
  };

  // ✅ UPDATED: MATIC to RWF rate
  const maticToRwfRate = 1040; // $0.80 * 1,300 RWF/USD

  const walletExchanges = [
    {
      name: 'Binance',
      url: 'https://www.binance.com',
      features: ['Low fees', 'Mobile Money support', 'MATIC/USDT trading'],
      recommended: true
    },
    {
      name: 'KuCoin',
      url: 'https://www.kucoin.com',
      features: ['MATIC support', 'Multiple payment methods'],
      recommended: false
    },
    {
      name: 'QuickSwap (DEX)',
      url: 'https://quickswap.exchange',
      features: ['Direct MATIC → USDT swap', 'No KYC', 'Fast'],
      recommended: true
    }
  ];

  return (
    <div style={{
      maxWidth: '800px',
      margin: '20px auto',
      padding: '20px',
      border: '1px solid #ddd',
      borderRadius: '10px',
      backgroundColor: '#f8f9fa'
    }}>
      <h2>💰 How to Withdraw Your MATIC</h2>
      
      {/* Testnet Warning */}
      {isTestnet && (
        <div style={{
          padding: '15px',
          backgroundColor: '#fff3cd',
          border: '1px solid #ffc107',
          borderRadius: '8px',
          marginBottom: '20px'
        }}>
          <strong>⚠️ You are on a Testnet</strong>
          <p style={{ margin: '10px 0 0 0', fontSize: '14px' }}>
            Test tokens have no real value. Switch to Polygon Mainnet to withdraw real funds.
          </p>
        </div>
      )}

      {/* Polygon Success Message */}
      {isPolygon && (
        <div style={{
          padding: '15px',
          backgroundColor: '#d4edda',
          border: '1px solid #28a745',
          borderRadius: '8px',
          marginBottom: '20px'
        }}>
          <strong>✅ You&apos;re on Polygon Mainnet</strong>
          <p style={{ margin: '10px 0 0 0', fontSize: '14px' }}>
            Perfect! You can withdraw your MATIC with super low fees (~$0.01 per transaction).
          </p>
        </div>
      )}

      {/* Current Balance */}
      {isConnected && (
        <div style={{
          padding: '15px',
          backgroundColor: isPolygon ? '#e8f5e9' : '#fff9e6',
          borderRadius: '8px',
          marginBottom: '20px'
        }}>
          <div style={{ marginBottom: '10px' }}>
            <strong>Your Wallet:</strong>
            <div style={{ 
              fontSize: '14px', 
              fontFamily: 'monospace',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginTop: '5px'
            }}>
              {address}
              <button
                onClick={() => copyToClipboard(address || '')}
                style={{
                  padding: '5px 10px',
                  fontSize: '12px',
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                {copiedAddress ? '✓ Copied' : 'Copy'}
              </button>
            </div>
          </div>
          <div>
            <strong>Balance:</strong> {balance ? `${parseFloat(balance.formatted).toFixed(6)} ${balance.symbol}` : 'Loading...'}
            {balance && isPolygon && (
              <span style={{ color: '#666', fontSize: '14px', marginLeft: '10px' }}>
                (≈ {(parseFloat(balance.formatted) * maticToRwfRate).toLocaleString()} RWF)
              </span>
            )}
          </div>
          {isTestnet && (
            <div style={{ color: 'orange', fontSize: '12px', marginTop: '5px' }}>
              Test tokens only - no real value
            </div>
          )}
        </div>
      )}

      {/* Withdrawal Methods */}
      <div style={{ marginBottom: '30px' }}>
        <h3>📤 Withdrawal Methods</h3>
        
        {/* Method 1: Direct MetaMask Transfer */}
        <div style={{
          padding: '15px',
          backgroundColor: 'white',
          border: '1px solid #ddd',
          borderRadius: '8px',
          marginBottom: '15px'
        }}>
          <h4 style={{ marginTop: 0, color: '#28a745' }}>✅ Method 1: MetaMask Direct Transfer (Fastest)</h4>
          <ol style={{ marginLeft: '20px', lineHeight: '1.8' }}>
            <li>Open MetaMask extension</li>
            <li>Make sure you&apos;re on <strong>Polygon Mainnet</strong></li>
            <li>Click <strong>&quot;Send&quot;</strong></li>
            <li>Enter recipient address (your exchange wallet)</li>
            <li>Enter amount of MATIC to send</li>
            <li>Review gas fee (should be ~$0.01) and confirm</li>
            <li>Wait for confirmation (1-3 minutes)</li>
          </ol>
          <div style={{ 
            padding: '10px', 
            backgroundColor: '#e8f5e9', 
            borderRadius: '5px',
            fontSize: '14px',
            marginTop: '10px'
          }}>
            💡 <strong>Tip:</strong> On Polygon, gas fees are incredibly cheap (~$0.01)! This makes it perfect for small transactions.
          </div>
        </div>

        {/* Method 2: Exchange to Fiat */}
        <div style={{
          padding: '15px',
          backgroundColor: 'white',
          border: '1px solid #ddd',
          borderRadius: '8px',
          marginBottom: '15px'
        }}>
          <h4 style={{ marginTop: 0, color: '#007bff' }}>💱 Method 2: Convert MATIC → RWF via Exchange</h4>
          <p style={{ marginTop: 0 }}>To convert MATIC to Mobile Money (MTN/Airtel):</p>
          <ol style={{ marginLeft: '20px', lineHeight: '1.8' }}>
            <li>Send MATIC from MetaMask to Binance (Polygon Network)</li>
            <li>On Binance: Trade MATIC → USDT</li>
            <li>Trade USDT → RWF or withdraw to Mobile Money</li>
            <li>Receive money in your MTN/Airtel wallet</li>
          </ol>
          <div style={{ 
            padding: '10px', 
            backgroundColor: '#fff3cd', 
            borderRadius: '5px',
            fontSize: '13px',
            marginTop: '10px'
          }}>
            ⚠️ <strong>Important:</strong> When withdrawing to Binance, select <strong>Polygon Network</strong>, NOT Ethereum! Fees are much lower.
          </div>
        </div>
      </div>

      {/* Recommended Exchanges */}
      <div style={{ marginBottom: '30px' }}>
        <h3>🏦 Recommended for Rwanda</h3>
        <div style={{ display: 'grid', gap: '15px' }}>
          {walletExchanges.map((exchange) => (
            <div 
              key={exchange.name}
              style={{
                padding: '15px',
                backgroundColor: 'white',
                border: exchange.recommended ? '2px solid #28a745' : '1px solid #ddd',
                borderRadius: '8px',
                position: 'relative'
              }}
            >
              {exchange.recommended && (
                <div style={{
                  position: 'absolute',
                  top: '-10px',
                  right: '10px',
                  backgroundColor: '#28a745',
                  color: 'white',
                  padding: '3px 10px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}>
                  Recommended
                </div>
              )}
              <h4 style={{ marginTop: 0 }}>
                {exchange.name}
                <a 
                  href={exchange.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ 
                    marginLeft: '10px', 
                    fontSize: '14px',
                    color: '#007bff'
                  }}
                >
                  Visit →
                </a>
              </h4>
              <ul style={{ marginBottom: 0, lineHeight: '1.6' }}>
                {exchange.features.map((feature, idx) => (
                  <li key={idx} style={{ fontSize: '14px' }}>{feature}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Step-by-Step: Binance Withdrawal */}
      <div style={{
        padding: '15px',
        backgroundColor: '#e3f2fd',
        borderRadius: '8px',
        marginBottom: '20px'
      }}>
        <h3 style={{ marginTop: 0 }}>📋 Complete Process: MATIC → RWF</h3>
        <ol style={{ marginLeft: '20px', lineHeight: '2' }}>
          <li><strong>Create Binance Account:</strong> Sign up at binance.com</li>
          <li><strong>Complete KYC:</strong> Verify identity (1-2 days)</li>
          <li><strong>Get Deposit Address:</strong> 
            <ul style={{ marginTop: '5px' }}>
              <li>Go to Wallet → Deposit</li>
              <li>Select: MATIC</li>
              <li>Network: <strong>Polygon (MATIC)</strong> ⚠️ NOT Ethereum!</li>
              <li>Copy deposit address</li>
            </ul>
          </li>
          <li><strong>Send from MetaMask:</strong> Transfer MATIC to Binance address</li>
          <li><strong>Wait for Confirmation:</strong> 2-5 minutes</li>
          <li><strong>Trade on Binance:</strong>
            <ul style={{ marginTop: '5px' }}>
              <li>MATIC → USDT (instant)</li>
              <li>USDT → RWF (or keep as USDT)</li>
            </ul>
          </li>
          <li><strong>Withdraw to Mobile Money:</strong>
            <ul style={{ marginTop: '5px' }}>
              <li>Select MTN or Airtel</li>
              <li>Enter phone number</li>
              <li>Confirm withdrawal</li>
              <li>Receive money in 1-3 days</li>
            </ul>
          </li>
        </ol>
      </div>

      {/* Important Notes */}
      <div style={{
        padding: '15px',
        backgroundColor: '#fff3cd',
        border: '1px solid #ffc107',
        borderRadius: '8px'
      }}>
        <h4 style={{ marginTop: 0 }}>⚠️ Critical Information</h4>
        <ul style={{ marginBottom: 0, lineHeight: '1.8' }}>
          <li><strong>Network Selection:</strong> ALWAYS choose <strong>Polygon</strong> network, not Ethereum!</li>
          <li><strong>Gas Fees:</strong> Keep 0.1 MATIC (~$0.08) for future transactions</li>
          <li><strong>Minimum Withdrawal:</strong> Binance minimum is usually 1 MATIC (~$0.80)</li>
          <li><strong>Processing Time:</strong> 
            <ul style={{ marginTop: '5px' }}>
              <li>Polygon transaction: 2-5 minutes</li>
              <li>Binance to Mobile Money: 1-3 business days</li>
            </ul>
          </li>
          <li><strong>Fees Comparison:</strong>
            <ul style={{ marginTop: '5px' }}>
              <li>Polygon gas: ~$0.01 ✅</li>
              <li>Ethereum gas: $20-50 ❌ (Avoid!)</li>
            </ul>
          </li>
        </ul>
      </div>

      {/* Polygon Benefits */}
      <div style={{
        marginTop: '20px',
        padding: '15px',
        backgroundColor: '#e8f5e9',
        borderRadius: '8px'
      }}>
        <h4 style={{ marginTop: 0 }}>🟣 Why We Use Polygon</h4>
        <ul style={{ marginBottom: 0, lineHeight: '1.8' }}>
          <li>✅ <strong>Super cheap fees:</strong> ~$0.01 per transaction (vs $20-50 on Ethereum)</li>
          <li>✅ <strong>Fast confirmations:</strong> 2-3 minutes (vs 10-15 minutes)</li>
          <li>✅ <strong>Same wallet address:</strong> Your ETH address works on Polygon!</li>
          <li>✅ <strong>Wide exchange support:</strong> Binance, KuCoin, etc. all support it</li>
          <li>✅ <strong>Growing ecosystem:</strong> More dApps and services every day</li>
        </ul>
      </div>

      {/* Quick Reference */}
      <div style={{
        marginTop: '20px',
        padding: '15px',
        backgroundColor: '#f0f8ff',
        borderRadius: '8px'
      }}>
        <h4 style={{ marginTop: 0 }}>📊 Quick Reference</h4>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
          <tbody>
            <tr style={{ borderBottom: '1px solid #ddd' }}>
              <td style={{ padding: '8px', fontWeight: 'bold' }}>Network:</td>
              <td style={{ padding: '8px' }}>Polygon Mainnet</td>
            </tr>
            <tr style={{ borderBottom: '1px solid #ddd' }}>
              <td style={{ padding: '8px', fontWeight: 'bold' }}>Chain ID:</td>
              <td style={{ padding: '8px' }}>137</td>
            </tr>
            <tr style={{ borderBottom: '1px solid #ddd' }}>
              <td style={{ padding: '8px', fontWeight: 'bold' }}>Currency:</td>
              <td style={{ padding: '8px' }}>MATIC</td>
            </tr>
            <tr style={{ borderBottom: '1px solid #ddd' }}>
              <td style={{ padding: '8px', fontWeight: 'bold' }}>Gas Fee:</td>
              <td style={{ padding: '8px' }}>~$0.01 USD</td>
            </tr>
            <tr style={{ borderBottom: '1px solid #ddd' }}>
              <td style={{ padding: '8px', fontWeight: 'bold' }}>MATIC Price:</td>
              <td style={{ padding: '8px' }}>~1,040 RWF ($0.80)</td>
            </tr>
            <tr>
              <td style={{ padding: '8px', fontWeight: 'bold' }}>Explorer:</td>
              <td style={{ padding: '8px' }}>
                <a href="https://polygonscan.com" target="_blank" rel="noopener noreferrer">
                  polygonscan.com
                </a>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Help Section */}
      <div style={{
        marginTop: '20px',
        padding: '10px',
        backgroundColor: '#f8f9fa',
        borderRadius: '5px',
        fontSize: '13px',
        textAlign: 'center'
      }}>
        Need help? Contact support at <strong>support@rootrise.com</strong> or join our community
      </div>
    </div>
  );
};

export default WithdrawalGuide;