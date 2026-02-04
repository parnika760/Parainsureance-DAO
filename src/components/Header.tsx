import { Shield, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useWeb3 } from '../context/Web3Context';

export const Header = () => {
  const { account, connectWallet, isConnecting } = useWeb3();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <header className="sticky top-0 z-50 glass-card !rounded-none !p-4 md:!p-6 border-b">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition">
          <div className="bg-emerald-500 p-2 rounded-lg">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-white">
              Para<span className="text-emerald-400">Shield</span>
            </h1>
            <p className="text-xs text-gray-400">Insurance DAO</p>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          <Link
            to="/"
            className={`transition ${
              isActive('/') ? 'text-emerald-400 font-semibold' : 'text-gray-300 hover:text-emerald-400'
            }`}
          >
            Dashboard
          </Link>
          <Link
            to="/policies"
            className={`transition ${
              isActive('/policies') ? 'text-emerald-400 font-semibold' : 'text-gray-300 hover:text-emerald-400'
            }`}
          >
            Policies
          </Link>
          <Link
            to="/docs"
            className={`transition ${
              isActive('/docs') ? 'text-emerald-400 font-semibold' : 'text-gray-300 hover:text-emerald-400'
            }`}
          >
            Docs
          </Link>
          <a href="#governance" className="text-gray-300 hover:text-emerald-400 transition">
            Governance
          </a>
        </nav>

        {/* Connect Wallet Button */}
        <div className="flex items-center gap-4">
          <button
            onClick={connectWallet}
            disabled={isConnecting}
            className="btn-primary !w-auto !px-4 md:!px-6 text-sm md:text-base"
          >
            {isConnecting ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin">⏳</span> Connecting...
              </span>
            ) : account ? (
              <span className="flex items-center gap-2">
                ✓ {formatAddress(account)}
              </span>
            ) : (
              '💼 Connect Wallet'
            )}
          </button>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden text-emerald-400"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <nav className="md:hidden mt-4 flex flex-col gap-4 pt-4 border-t border-emerald-400 border-opacity-20">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className={`transition ${
              isActive('/') ? 'text-emerald-400 font-semibold' : 'text-gray-300 hover:text-emerald-400'
            }`}
          >
            Dashboard
          </Link>
          <Link
            to="/policies"
            onClick={() => setMobileMenuOpen(false)}
            className={`transition ${
              isActive('/policies') ? 'text-emerald-400 font-semibold' : 'text-gray-300 hover:text-emerald-400'
            }`}
          >
            Policies
          </Link>
          <Link
            to="/docs"
            onClick={() => setMobileMenuOpen(false)}
            className={`transition ${
              isActive('/docs') ? 'text-emerald-400 font-semibold' : 'text-gray-300 hover:text-emerald-400'
            }`}
          >
            Docs
          </Link>
          <a href="#governance" className="text-gray-300 hover:text-emerald-400 transition">
            Governance
          </a>
        </nav>
      )}
    </header>
  );
};
