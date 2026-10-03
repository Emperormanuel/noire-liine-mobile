'use client';
import { useEffect, useState } from 'react';

// Relay page for the mobile app's Google sign-in.
// Supabase sends the browser here (a normal https/http page it trusts) with ?code=...
// and this page forwards the browser to the app's own address (exp:// or noireliine://).
export default function MobileAuthRelay() {
  const [target, setTarget] = useState('');
  const [problem, setProblem] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const app = params.get('app') || '';
    // Only ever hand control to the app, never to an arbitrary website.
    if (!/^(exp|exps|noireliine):\/\//.test(app)) {
      setProblem('This page is only for signing in from the Noire Liine app.');
      return;
    }
    params.delete('app');
    const rest = params.toString();
    const url = app + (rest ? (app.includes('?') ? '&' : '?') + rest : '') + window.location.hash;
    setTarget(url);
    window.location.href = url;
  }, []);

  return (
    <div className="center">
      <h1>{problem ? 'Oops' : 'Signed in'}</h1>
      <p className="muted">{problem || 'Returning you to the app…'}</p>
      {target && (
        <a href={target} className="btn">Open the app</a>
      )}
    </div>
  );
}
