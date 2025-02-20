// ./app/[slug]/page.js

import { redirect } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default async function Page({ params }) {
    const { slug } = params;

    // ✅ Fetch data dari Supabase di server
    const { data, error } = await supabase
        .from('links')
        .select('original_url')
        .eq('short_code', slug)   
        .single();


    // 🚨 Redirect jika URL ditemukan
    if (data?.original_url) {
        redirect(data.original_url);
    }

    // ❌ Tampilkan error jika slug tidak ditemukan
    return (
        <div className="min-h-screen flex items-center justify-center">
            <h1 className="text-2xl font-bold">Link tidak ditemukan</h1>
        </div>
    );
}
