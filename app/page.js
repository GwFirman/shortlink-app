"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function Home() {
  const [url, setUrl] = useState('');
  const [sc, setSc] = useState('');
  const [shortLink, setShortLink] = useState('');
  const [isAvailable, setIsAvailable] = useState(true);
  const [loading, setLoading] = useState(false);

  // ✅ Validasi Real-Time saat user mengetik di kolom Custom URL
  useEffect(() => {
    const checkAvailability = async () => {
      const trimmed = sc.trim();
      // ✅ Regex: Minimal satu huruf atau angka, boleh diikuti simbol "_" atau "-"
      const isValid = /^[a-zA-Z0-9][a-zA-Z0-9_-]*$/.test(trimmed);
  
      if (trimmed === "") {
        setIsAvailable(true);
        return;
      }
  
      if (!isValid) {
        setIsAvailable(false); // ❌ Invalid jika tidak sesuai regex
        return;
      }
  
      setLoading(true);
      const { data, error } = await supabase
        .from("links")
        .select("short_code")
        .eq("short_code", trimmed)
        .maybeSingle();
  
      setIsAvailable(!data);
      setLoading(false);
    };
  
    const timeout = setTimeout(checkAvailability, 500);
    return () => clearTimeout(timeout);
  }, [sc]);
  

  const handleShorten = () => {
    if (!url) return;

    // Lakukan proses short link di sini
    console.log("Shortening link:", url);

    // Kosongkan input setelah tombol ditekan
    setUrl("");
    setSc("");
  };
  // ✅ Handle Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAvailable && sc.trim() !== '') {
      alert('Custom URL tidak tersedia. Silakan pilih yang lain.');
      return;
    }

    const { data, error } = await supabase
      .from('links')
      .insert([{ original_url: url, short_code: sc || null }])
      .select();

    if (error) {
      console.error('Insert Error:', error);
    } else {
      console.log('Insert Success:', data);
      setShortLink(`${process.env.NEXT_PUBLIC_BASE_URL}/${data[0].short_code}`);
      handleShorten();

    }
  };


  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(shortLink);
    setIsCopied(true);
    
    // Kembalikan ikon setelah 2 detik
    alert("Link copied to clipboard!");
    setTimeout(() => setIsCopied(false), 2000);
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-600 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-6">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">Short Link Generator</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Input URL */}
          <input
            type="url"
            placeholder="Masukkan URL"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
            className="w-full border border-gray-300 rounded-lg p-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />

          {/* Input Custom URL */}
          <div className="relative">
            <input
              type="text"
              placeholder="Custom URL (Opsional)"
              value={sc}
              onChange={(e) => setSc(e.target.value)}
              className={`w-full border rounded-lg p-3 text-gray-700 focus:outline-none focus:ring-2 ${sc && (loading ? 'border-gray-300' : isAvailable ? 'border-green-500' : 'border-red-500')
                }`}
            />
            {sc && (
              <span
                className={`absolute right-3 top-3 text-sm font-medium ${loading ? 'text-gray-500' : isAvailable ? 'text-green-500' : 'text-red-500'
                  }`}
              >
                {loading ? 'Checking...' : isAvailable ? 'Available' : 'Not available'}
              </span>
            )}
          </div>

          {/* Button Submit */}
          <button
            type="submit"
            className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-3 rounded-lg transition duration-300"
            disabled={!url || (sc && !isAvailable)}
          >
            Shorten
          </button>
        </form>

        {/* Hasil Short Link */}
        {shortLink && (
          <div className="mt-6 text-center">
            <p className="text-gray-600 mb-2">Short Link:</p>
            <div className="relative w-full max-w-md">
              <input
                type="url"
                value={shortLink}
                readOnly
                className="w-full border border-gray-300 rounded-lg p-3 pr-14 text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                onClick={handleCopy}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-white px-3 py-1 rounded-lg text-sm"
              >
                <i
                  className={`bi ${isCopied ? "bi-clipboard-check-fill" : "bi-clipboard"
                    } text-indigo-500 stroke-5 text-lg`}
                ></i>
              </button>
            </div>
          </div>
        )}
      </div>      
    </div>

  );
}
