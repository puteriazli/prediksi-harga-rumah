import React, { useState, useMemo, useCallback } from 'react';
import { lokasiData } from './data/lokasi'; // ✅ ambil data dari file eksternal

// Base URL untuk server Flask
const BASE_URL = 'http://127.0.0.1:5000';

// ========================= HEADER & FOOTER ========================= //

const Header = () => (
  <header className="bg-white shadow-lg sticky top-0 z-20 border-b border-indigo-100">
    <div className="max-w-screen-xl mx-auto p-4 flex justify-between items-center">
      <div className="flex items-center">
        <span className="text-3xl font-extrabold text-indigo-700 tracking-wider">HargaPro</span>
        <span className="ml-2 text-xs font-medium text-gray-500 hidden sm:inline">ML Powered</span>
      </div>
      <nav className="hidden sm:block">
        <a href="#" className="text-gray-600 hover:text-indigo-600 font-medium ml-6 transition duration-150">Tentang</a>
        <a href="#" className="text-gray-600 hover:text-indigo-600 font-medium ml-6 transition duration-150">Model & Data</a>
      </nav>
    </div>
  </header>
);

const Footer = () => (
  <footer className="bg-gray-900 p-6 mt-16">
    <div className="max-w-screen-xl mx-auto text-center text-sm text-gray-400">
      &copy; {new Date().getFullYear()} HargaPro. Hak Cipta Dilindungi.
    </div>
  </footer>
);

// ========================= HASIL PREDIKSI ========================= //

const ResultDisplay = ({ result, loading, error }) => {
    const formatRupiah = (num) =>
        new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(num);

    if (loading)
        return (
            <div className="flex flex-col items-center justify-center h-full min-h-[300px] bg-white rounded-2xl border-2 border-indigo-200 shadow-lg">
                <svg className="animate-spin h-8 w-8 text-indigo-500 mb-3" viewBox="0 0 24 24">
                    <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                    ></circle>
                    <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                </svg>
                <p className="text-indigo-600 font-semibold text-base text-center">
                    Model sedang menghitung...
                </p>
            </div>
        );

    if (error)
        return (
            <div className="flex flex-col items-center justify-center h-full min-h-[300px] p-6 bg-red-50 rounded-2xl border-2 border-red-300 text-center shadow-sm">
                <p className="text-red-700 font-bold mb-2">Kesalahan Prediksi</p>
                <p className="text-xs text-red-500">{error}</p>
            </div>
        );

    if (!result)
        return (
            <div className="flex flex-col items-center justify-center h-full min-h-[300px] p-6 bg-white rounded-2xl border border-gray-200 shadow-sm text-center">
                <p className="text-gray-500 font-medium text-base">
                    Masukkan detail rumah untuk melihat hasil di sini.
                </p>
            </div>
        );

    return (
        <div className="bg-white rounded-2xl shadow-xl border border-indigo-200 p-8 flex flex-col justify-center items-center text-center min-h-[320px]">
            <h3 className="text-lg font-semibold text-gray-500 mb-4">
                Harga Prediksi Terbaik Kami
            </h3>
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border-4 border-indigo-300 rounded-2xl px-4 py-6 w-full shadow-inner overflow-hidden">
                <p className="text-base font-semibold text-indigo-600 mb-2">
                    Estimasi Jual:
                </p>
                {/* Kontainer fleksibel untuk menyesuaikan ukuran teks */}
                <div className="flex justify-center items-center w-full overflow-hidden">
                    <p
                        className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-700"
                        style={{
                          fontSize: 'clamp(1.5rem, 2.5vw + 1rem, 3rem)', // lebih adaptif & aman
                          maxWidth: '100%',
                          wordBreak: 'break-word',
                          lineHeight: '1.1',
                          textAlign: 'center',
                        }}
                    >
                        {formatRupiah(result.predicted_price)}
                    </p>
                </div>
            </div>
        </div>
    );
};

// ========================= INPUT CUSTOM ========================= //

const NumberStepperInput = ({ label, name, value, onChange, unit, min = 0, required = false }) => {
  const handleChange = useCallback(
    (delta) => {
      const newValue = Math.max(min, (value || 0) + delta);
      onChange({ target: { name, value: newValue } });
    },
    [name, value, onChange, min]
  );
  return (
    <div className="col-span-full sm:col-span-1">
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="flex items-center bg-white border border-gray-300 rounded-xl">
        <button type="button" onClick={() => handleChange(-1)} className="p-3 text-indigo-600 hover:bg-indigo-50">
          -
        </button>
        <input
          type="number"
          id={name}
          name={name}
          value={value || ''}
          onChange={onChange}
          min={min}
          required={required}
          className="w-full text-center p-3 border-x border-gray-300 focus:outline-none"
        />
        <button type="button" onClick={() => handleChange(1)} className="p-3 text-indigo-600 hover:bg-indigo-50">
          +
        </button>
        {unit && <span className="text-sm text-gray-500 w-10 text-right pr-4 hidden md:inline">{unit}</span>}
      </div>
    </div>
  );
};

// ========================= FORM PREDIKSI ========================= //

const CustomSelect = ({ label, name, value, onChange, options, placeholder, required = false, disabled = false }) => (
  <div className="col-span-full sm:col-span-1">
    <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <select
      id={name}
      name={name}
      value={value || ''}
      onChange={onChange}
      required={required}
      disabled={disabled}
      className="w-full p-3 border rounded-xl bg-white shadow-sm"
    >
      <option value="" disabled>{placeholder}</option>
      {options.map((opt) => (
        <option key={opt} value={opt}>{opt}</option>
      ))}
    </select>
  </div>
);

const PredictionForm = ({ formData, setFormData, handleSubmit, loading }) => {
  const handleChange = useCallback((e) => {
    const { name, value, type } = e.target;
    const newValue = type === 'number' ? parseFloat(value) || 0 : value;
    if (name === 'pulau') {
      setFormData((prev) => ({ ...prev, pulau: newValue, provinsi: '', kota: '' }));
    } else if (name === 'provinsi') {
      setFormData((prev) => ({ ...prev, provinsi: newValue, kota: '' }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: newValue }));
    }
  }, [setFormData]);

  const pulauOptions = useMemo(() => Object.keys(lokasiData).map((key) => lokasiData[key].label), []);
  const provinsiOptions = useMemo(() => {
    const key = Object.keys(lokasiData).find((k) => lokasiData[k].label === formData.pulau);
    if (!key) return [];
    return Object.values(lokasiData[key].provinsi).map((p) => p.label);
  }, [formData.pulau]);
  const kotaOptions = useMemo(() => {
    const keyPulau = Object.keys(lokasiData).find((k) => lokasiData[k].label === formData.pulau);
    if (!keyPulau) return [];
    const keyProv = Object.keys(lokasiData[keyPulau].provinsi).find(
      (p) => lokasiData[keyPulau].provinsi[p].label === formData.provinsi
    );
    if (!keyProv) return [];
    return lokasiData[keyPulau].provinsi[keyProv].kota.map((k) => k.label);
  }, [formData.pulau, formData.provinsi]);

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <h3 className="text-2xl font-bold text-indigo-700 border-b-4 border-indigo-100 pb-3 mb-4">
        1. Detail Lokasi Properti 🗺️
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <CustomSelect label="Pulau" name="pulau" value={formData.pulau} onChange={handleChange} options={pulauOptions} placeholder="Pilih Pulau" required />
        <CustomSelect label="Provinsi" name="provinsi" value={formData.provinsi} onChange={handleChange} options={provinsiOptions} placeholder="Pilih Provinsi" required disabled={!formData.pulau} />
        <div className="sm:col-span-2">
          <CustomSelect label="Kota/Kabupaten" name="kota" value={formData.kota} onChange={handleChange} options={kotaOptions} placeholder="Pilih Kota" required disabled={!formData.provinsi} />
        </div>
      </div>

      <h3 className="text-2xl font-bold text-indigo-700 border-b-4 border-indigo-100 pb-3 pt-4">
        2. Detail Ukuran & Fasilitas 🏠
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Luas Tanah (m²)</label>
          <input type="number" name="luas_tanah" value={formData.luas_tanah} onChange={handleChange} min="1" required className="w-full p-3 border rounded-xl" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Luas Bangunan (m²)</label>
          <input type="number" name="luas_bangunan" value={formData.luas_bangunan} onChange={handleChange} min="1" required className="w-full p-3 border rounded-xl" />
        </div>
        <NumberStepperInput label="Jumlah Kamar Tidur" name="jumlah_kamar_tidur" value={formData.jumlah_kamar_tidur} onChange={handleChange} unit="Kamar" min={1} required />
        <NumberStepperInput label="Jumlah Kamar Mandi" name="jumlah_kamar_mandi" value={formData.jumlah_kamar_mandi} onChange={handleChange} unit="Kamar" min={1} required />
        <NumberStepperInput label="Muatan Parkir" name="muatan_parkir" value={formData.muatan_parkir} onChange={handleChange} unit="Slot" min={0} required />
      </div>

      <button
        type="submit"
        disabled={loading}
        className={`w-full py-4 px-4 font-extrabold text-lg rounded-xl shadow-xl ${
          loading ? 'bg-gray-400' : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-500 hover:to-purple-500 transition-all'
        }`}
      >
        {loading ? 'Memproses...' : 'PREDIKSI HARGA RUMAH SEKARANG 🚀'}
      </button>
    </form>
  );
};

// ========================= APP ========================= //

const App = () => {
    const [formData, setFormData] = useState({
        pulau: '',
        provinsi: '',
        kota: '',
        luas_tanah: '',
        luas_bangunan: '',
        jumlah_kamar_tidur: '',
        jumlah_kamar_mandi: '',
        muatan_parkir: '',
    });
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const res = await fetch(`${BASE_URL}/predict`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Terjadi kesalahan');
            setResult(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            <Header />

            <main className="flex-grow flex justify-center px-4 py-10">
                {/* Grid dua kolom proporsional */}
                <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-[1.8fr_1.2fr] gap-10">
                    
                    {/* ===== Form kiri ===== */}
                    <div className="bg-white p-8 rounded-3xl shadow-2xl border border-gray-100 max-w-3xl mx-auto w-full">
                        <h1 className="text-4xl font-extrabold text-gray-800 mb-6 text-center">
                            Hitung Harga Properti Anda
                        </h1>
                        <PredictionForm
                            formData={formData}
                            setFormData={setFormData}
                            handleSubmit={handleSubmit}
                            loading={loading}
                        />
                    </div>

                    {/* ===== Hasil kanan ===== */}
                    <div className="bg-white p-8 rounded-3xl shadow-2xl border-l-8 border-indigo-500 flex items-center justify-center max-w-4xl w-full">
                        <ResultDisplay result={result} loading={loading} error={error} />
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};


export default App;
