import React from 'react';
import { storage } from '../utils/storage';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('App Uncaught Error:', error, errorInfo);
  }

  private handleResetAndReload = () => {
    try {
      storage.clear();
      sessionStorage.clear();
    } catch (e) {
      console.error('Error clearing storage:', e);
    }
    window.location.href = '/';
  };

  private handleGoHome = () => {
    this.setState({ hasError: false, error: undefined });
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 text-center">
          <div className="bg-slate-900 border border-emerald-500/50 p-6 rounded-2xl max-w-md w-full space-y-4 shadow-2xl">
            <h2 className="text-xl font-black">
              <span className="text-red-500 font-black">M</span>
              <span className="text-white font-black">arketBD.</span>
              <span className="text-red-500 font-black">Net</span>
            </h2>
            <p className="text-xs text-slate-300">
              অ্যাপ লোড করার সময় একটি সাময়িক সমস্যা পাওয়া গিয়েছে। নিচের বাটনে ক্লিক করে সহজেই রিস্টোর করতে পারেন।
            </p>

            {this.state.error && (
              <div className="bg-slate-950 p-3 rounded-xl text-left border border-red-500/30 overflow-auto max-h-32 text-[11px] text-red-300 font-mono">
                {this.state.error.message || String(this.state.error)}
              </div>
            )}

            <div className="flex flex-col gap-2 pt-2">
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl text-xs transition cursor-pointer"
              >
                রিলোড করুন (Reload Application)
              </button>

              <button
                onClick={this.handleGoHome}
                className="w-full bg-pink-600 hover:bg-pink-700 text-white font-bold py-2.5 rounded-xl text-xs transition cursor-pointer"
              >
                মূল পাতায় ফিরে যান (Go to Home Page)
              </button>

              <button
                onClick={this.handleResetAndReload}
                className="w-full bg-slate-800 hover:bg-slate-700 text-amber-400 border border-amber-500/30 font-bold py-2.5 rounded-xl text-xs transition cursor-pointer"
              >
                🧹 ক্যাশ পরিষ্কার করে রিস্টোর করুন (Reset Local Cache)
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}


