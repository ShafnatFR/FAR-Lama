
import React, { useState, useMemo } from 'react';
import { Mail, Lock, Eye, EyeOff, UserCircle, Truck, Utensils, ArrowRight, User, ArrowLeft, CheckCircle, Phone, AlertCircle, Check, X } from 'lucide-react';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { UserRole } from '../../types';
import { db } from '../../services/db';

interface RegisterViewProps {
  onNavigate: (view: 'login' | 'register' | 'forgot-password') => void;
  onRegister: (formData: any, remember: boolean) => void;
}

export const RegisterView: React.FC<RegisterViewProps> = ({ onNavigate, onRegister }) => {
  const [selectedRole, setSelectedRole] = useState<UserRole>('receiver');
  const [showPass, setShowPass] = useState({ pass: false, confirm: false });
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [rememberMe, setRememberMe] = useState(true); // Default checked for better UX on register
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [apiError, setApiError] = useState<string | null>(null);
  
  // Password Analysis
  const passwordAnalysis = useMemo(() => {
      const pwd = formData.password;
      return {
          length: pwd.length >= 8,
          number: /[0-9]/.test(pwd),
          uppercase: /[A-Z]/.test(pwd),
          symbol: /[^A-Za-z0-9]/.test(pwd)
      };
  }, [formData.password]);

  const passwordScore = useMemo(() => {
      let score = 0;
      if (passwordAnalysis.length) score += 25;
      if (passwordAnalysis.number) score += 25;
      if (passwordAnalysis.uppercase) score += 25;
      if (passwordAnalysis.symbol) score += 25;
      return score;
  }, [passwordAnalysis]);

  const strengthLabel = useMemo(() => {
      if (formData.password.length === 0) return { text: '', color: 'bg-stone-800' };
      if (passwordScore <= 25) return { text: 'Lemah', color: 'bg-red-500' };
      if (passwordScore <= 50) return { text: 'Kurang Kuat', color: 'bg-orange-500' };
      if (passwordScore <= 75) return { text: 'Cukup Kuat', color: 'bg-yellow-500' };
      return { text: 'Sangat Kuat', color: 'bg-green-500' };
  }, [passwordScore, formData.password]);

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    if (!formData.name.trim()) newErrors.name = "Nama wajib diisi";
    if (!formData.email.includes('@')) newErrors.email = "Email tidak valid";
    if (!formData.phone || formData.phone.length < 9) newErrors.phone = "Nomor HP wajib diisi";
    
    // Strict Password Validation on Submit
    if (passwordScore < 75) newErrors.password = "Password belum memenuhi standar keamanan";
    
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Konfirmasi password tidak cocok!";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);
    
    if (!validateForm()) return;

    setIsLoading(true);
    
    try {
        const result = await db.registerUser({
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            password: formData.password,
            role: selectedRole,
            isNewUser: true // Default untuk user baru agar tour muncul
        });

        // --- FIX: Update joinDate to WIB Timestamp ---
        // Backend default is just date (DD/MM/YYYY). We want full timestamp in WIB.
        const now = new Date();
        const jakartaDate = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Jakarta"}));
        const year = jakartaDate.getFullYear();
        const month = String(jakartaDate.getMonth() + 1).padStart(2, '0');
        const day = String(jakartaDate.getDate()).padStart(2, '0');
        const hour = String(jakartaDate.getHours()).padStart(2, '0');
        const minute = String(jakartaDate.getMinutes()).padStart(2, '0');
        const second = String(jakartaDate.getSeconds()).padStart(2, '0');
        
        const wibTimestamp = `${year}-${month}-${day} ${hour}:${minute}:${second}`;

        // Optimistically update the result object
        result.joinDate = wibTimestamp;

        // Send update to backend to fix the timestamp
        await db.upsertUser({
            ...result,
            joinDate: wibTimestamp,
            status: 'active'
        });

        // Panggil onRegister (yang sebenarnya adalah wrapper handleLogin di App.tsx)
        // untuk otomatis login tanpa input ulang
        onRegister(result, rememberMe);

    } catch (error: any) {
        console.error("Registration Failed:", error);
        setApiError(error.message || "Gagal mendaftar. Silakan coba lagi.");
    } finally {
        setIsLoading(false);
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value.replace(/\D/g, '');
      setFormData({...formData, phone: val});
  };

  return (
    <div className="flex w-full h-screen bg-[#1A0F0A] font-sans text-stone-100 overflow-hidden relative selection:bg-orange-500 selection:text-white">
      {/* ... Content ... */}
      <div className="absolute top-[-10%] right-[-10%] w-[800px] h-[800px] bg-orange-900/30 rounded-full blur-[150px] pointer-events-none z-0 mix-blend-screen"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-yellow-700/20 rounded-full blur-[120px] pointer-events-none z-0 mix-blend-screen"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-[#2C1810]/50 rounded-full blur-[100px] pointer-events-none z-0"></div>

      {/* Left Side - Hero Section */}
      <div className="hidden lg:flex lg:w-6/12 relative flex-col justify-between p-16 overflow-hidden border-r border-[#3E2319]/50 h-full">
        <div className="absolute inset-0 z-0">
            <img src="https://images.unsplash.com/photo-1488459716781-31db52582fe9?q=80&w=2070&auto=format&fit=crop" alt="Register Background" className="w-full h-full object-cover opacity-30 mix-blend-overlay scale-105" />
            <div className="absolute inset-0 bg-gradient-to-br from-[#1A0F0A] via-[#2C1810]/90 to-[#432311]/80"></div>
        </div>
        <div className="relative z-10">
            <button onClick={() => onNavigate('login')} className="flex items-center gap-2 text-[#8C7B75] hover:text-white transition-colors group">
                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                <span className="font-bold text-xs uppercase tracking-widest">Kembali ke Login</span>
            </button>
        </div>
        <div className="relative z-10 max-w-lg mb-12">
            <h1 className="text-6xl font-black leading-none mb-6 tracking-tight text-white drop-shadow-xl">
                <span className="text-stone-600">JOIN THE</span><br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-yellow-500 to-orange-600 filter drop-shadow-sm">MOVEMENT.</span>
            </h1>
            <p className="text-[#D6D3D1] font-medium leading-relaxed border-l-4 border-orange-600 pl-6 text-lg">
                Mulai perjalanan Anda mengurangi limbah pangan dan membantu sesama hari ini. Jadilah pahlawan bagi bumi dan kemanusiaan.
            </p>
        </div>
      </div>

      {/* Right Side - Register Form */}
      <div className="w-full lg:w-6/12 flex items-center justify-center p-6 relative z-10 bg-[#1A0F0A]/80 backdrop-blur-xl border-l border-white/5 h-full overflow-y-auto">
          <div className="w-full max-w-[480px] py-10 relative z-20">
             
             <div className="mb-8">
                <h2 className="text-4xl font-black text-white mb-2 tracking-tighter leading-none">Daftar Akun</h2>
                <p className="text-[#A8A29E] text-sm font-medium">Lengkapi data diri untuk akses penuh ke ekosistem.</p>
             </div>

             {apiError && (
                <div className="mb-6 p-4 bg-red-950/40 border border-red-900/50 rounded-2xl flex items-start gap-3 text-red-400 text-xs font-bold animate-in slide-in-from-top-2">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <p>{apiError}</p>
                </div>
             )}

             <div className="mb-8">
                <label className="text-[10px] font-black text-orange-500 uppercase tracking-widest mb-3 block ml-1">Pilih Peran Anda</label>
                <div className="grid grid-cols-3 gap-3">
                    {[{ id: 'provider', label: 'Donatur', icon: Utensils }, { id: 'receiver', label: 'Penerima', icon: UserCircle }, { id: 'volunteer', label: 'Relawan', icon: Truck }].map((role) => (
                        <button 
                            key={role.id} 
                            type="button" 
                            onClick={() => setSelectedRole(role.id as UserRole)} 
                            className={`
                                relative flex flex-col items-center justify-center p-4 rounded-2xl transition-all duration-300 border h-24 group
                                ${selectedRole === role.id 
                                    ? 'bg-[#2C1810] border-orange-600 text-orange-500 shadow-lg shadow-orange-900/20 z-10' 
                                    : 'bg-[#1C100B] border-[#2C1810] text-[#57534E] hover:bg-[#2C1810] hover:text-[#A8A29E] hover:border-orange-500/30'
                                }
                            `}
                        >
                            {selectedRole === role.id && (<div className="absolute top-2 right-2 text-orange-500"><CheckCircle className="w-4 h-4" /></div>)}
                            <role.icon className={`w-7 h-7 mb-2 transition-colors ${selectedRole === role.id ? 'stroke-orange-500' : 'stroke-current group-hover:stroke-[#A8A29E]'}`} />
                            <span className="text-[10px] font-black uppercase tracking-wider">{role.label}</span>
                        </button>
                    ))}
                </div>
             </div>

             <form onSubmit={handleRegister} className="space-y-5">
                <Input 
                    label="Nama Lengkap" 
                    icon={<User className="w-5 h-5 group-focus-within:text-orange-500 transition-colors" />}
                    placeholder="Contoh: Budi Santoso" 
                    value={formData.name} 
                    onChange={(e) => setFormData({...formData, name: e.target.value})} 
                    className="!bg-[#2C1810] !border-[#3E2319] !text-orange-50 placeholder:!text-[#5C4035] focus:!border-orange-500 focus:!bg-[#351D14] rounded-2xl py-3.5 transition-all font-medium"
                    labelClassName="text-orange-500 font-black text-[10px] uppercase tracking-widest group-focus-within:text-yellow-500"
                    containerClassName="space-y-1"
                    error={errors.name}
                />
                
                <Input 
                    label="Email Address" 
                    type="email" 
                    icon={<Mail className="w-5 h-5 group-focus-within:text-orange-500 transition-colors" />}
                    placeholder="nama@email.com" 
                    value={formData.email} 
                    onChange={(e) => setFormData({...formData, email: e.target.value})} 
                    className="!bg-[#2C1810] !border-[#3E2319] !text-orange-50 placeholder:!text-[#5C4035] focus:!border-orange-500 focus:!bg-[#351D14] rounded-2xl py-3.5 transition-all font-medium"
                    labelClassName="text-orange-500 font-black text-[10px] uppercase tracking-widest group-focus-within:text-yellow-500"
                    containerClassName="space-y-1"
                    error={errors.email}
                />

                <Input 
                    label="Nomor WhatsApp" 
                    type="tel" 
                    placeholder="812-3456-7890" 
                    leftAddon={<span className="text-[#8C7B75] font-bold px-1">+62</span>}
                    value={formData.phone} 
                    onChange={handlePhoneChange}
                    className="!bg-[#2C1810] !border-[#3E2319] !text-orange-50 placeholder:!text-[#5C4035] focus:!border-orange-500 focus:!bg-[#351D14] rounded-r-2xl py-3.5 transition-all font-medium"
                    labelClassName="text-orange-500 font-black text-[10px] uppercase tracking-widest group-focus-within:text-yellow-500"
                    containerClassName="space-y-1"
                    error={errors.phone}
                />
                
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Input 
                            label="Password" 
                            type={showPass.pass ? "text" : "password"} 
                            icon={<Lock className="w-5 h-5 group-focus-within:text-orange-500 transition-colors" />}
                            placeholder="••••••" 
                            value={formData.password} 
                            onChange={(e) => setFormData({...formData, password: e.target.value})}
                            className={`!bg-[#2C1810] !border-[#3E2319] !text-orange-50 placeholder:!text-[#5C4035] focus:!border-orange-500 focus:!bg-[#351D14] rounded-2xl py-3.5 transition-all font-medium ${errors.password ? '!border-red-600' : ''}`}
                            labelClassName="text-orange-500 font-black text-[10px] uppercase tracking-widest group-focus-within:text-yellow-500"
                            containerClassName="space-y-1"
                            rightElement={
                                <button type="button" onClick={() => setShowPass({...showPass, pass: !showPass.pass})} className="text-[#5C4035] hover:text-orange-500 transition-colors">
                                    {showPass.pass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            }
                        />
                        
                        {/* Dynamic Alert & Strength Meter */}
                        {formData.password && (
                            <div className="bg-[#1C100B] border border-[#2C1810] rounded-xl p-3 space-y-3 animate-in slide-in-from-top-2">
                                {/* Strength Bar */}
                                <div>
                                    <div className="flex justify-between items-end mb-1.5">
                                        <span className="text-[9px] font-black text-stone-500 uppercase tracking-widest">Kekuatan</span>
                                        <span className={`text-[10px] font-bold ${strengthLabel.color.replace('bg-', 'text-')}`}>
                                            {strengthLabel.text}
                                        </span>
                                    </div>
                                    <div className="flex gap-1 h-1.5">
                                        {[25, 50, 75, 100].map((step, idx) => (
                                            <div 
                                                key={idx} 
                                                className={`flex-1 rounded-full transition-all duration-500 ${
                                                    passwordScore >= step ? strengthLabel.color : 'bg-[#3E2319]'
                                                }`} 
                                            />
                                        ))}
                                    </div>
                                </div>

                                {/* Requirements List */}
                                <div className="grid grid-cols-2 gap-2">
                                    {[
                                        { met: passwordAnalysis.length, label: "Min 8 Karakter" },
                                        { met: passwordAnalysis.number, label: "Ada Angka (0-9)" },
                                        { met: passwordAnalysis.uppercase, label: "Huruf Besar (A-Z)" },
                                        { met: passwordAnalysis.symbol, label: "Simbol (!@#$)" },
                                    ].map((req, i) => (
                                        <div key={i} className="flex items-center gap-2">
                                            <div className={`w-4 h-4 rounded-full flex items-center justify-center border transition-colors ${req.met ? 'bg-green-500/10 border-green-500/50 text-green-500' : 'bg-stone-800 border-stone-700 text-stone-500'}`}>
                                                {req.met ? <Check className="w-2.5 h-2.5" /> : <X className="w-2.5 h-2.5" />}
                                            </div>
                                            <span className={`text-[10px] font-medium transition-colors ${req.met ? 'text-stone-300' : 'text-stone-600'}`}>{req.label}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        {errors.password && <p className="text-red-500 text-[10px] font-bold ml-2">{errors.password}</p>}
                    </div>

                    <div className="space-y-1">
                        <Input 
                            label="Konfirmasi Password" 
                            type={showPass.confirm ? "text" : "password"} 
                            icon={<Lock className="w-5 h-5 group-focus-within:text-orange-500 transition-colors" />}
                            placeholder="••••••" 
                            value={formData.confirmPassword} 
                            onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})} 
                            className={`!bg-[#2C1810] !border-[#3E2319] !text-orange-50 placeholder:!text-[#5C4035] focus:!border-orange-500 focus:!bg-[#351D14] rounded-2xl py-3.5 transition-all font-medium ${errors.confirmPassword ? '!border-red-600' : ''}`}
                            labelClassName="text-orange-500 font-black text-[10px] uppercase tracking-widest group-focus-within:text-yellow-500"
                            containerClassName="space-y-1"
                            rightElement={
                                <button type="button" onClick={() => setShowPass({...showPass, confirm: !showPass.confirm})} className="text-[#5C4035] hover:text-orange-500 transition-colors">
                                    {showPass.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            }
                        />
                        {/* Real-time Match Indicator */}
                        {formData.confirmPassword && (
                            <div className={`flex items-center gap-2 mt-1.5 ml-1 transition-all duration-300 ${formData.password === formData.confirmPassword ? 'text-green-500' : 'text-red-500'}`}>
                                {formData.password === formData.confirmPassword 
                                    ? <Check className="w-3.5 h-3.5" /> 
                                    : <X className="w-3.5 h-3.5" />
                                }
                                <span className="text-[10px] font-black uppercase tracking-widest">
                                    {formData.password === formData.confirmPassword ? "Password Cocok" : "Password Tidak Cocok"}
                                </span>
                            </div>
                        )}
                        {errors.confirmPassword && <p className="text-red-500 text-[10px] font-bold ml-2">{errors.confirmPassword}</p>}
                    </div>
                </div>
                
                {/* Remember Me Checkbox for Registration Auto-Login */}
                <div className="flex items-center gap-3 ml-1">
                    <label className="flex items-center gap-2 cursor-pointer group">
                        <input 
                            type="checkbox" 
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                            className="w-5 h-5 rounded border border-[#3E2319] bg-[#1E120A] text-orange-500 focus:ring-offset-0 focus:ring-2 focus:ring-orange-500/50 accent-orange-600 cursor-pointer"
                        />
                        <span className="text-xs font-bold text-[#A67C52] group-hover:text-orange-500 transition-colors select-none">Ingat Saya (Auto Login)</span>
                    </label>
                </div>

                <div className="pt-2 relative z-50">
                    <Button 
                        type="submit" 
                        variant="primary" 
                        isLoading={isLoading} 
                        className="w-full h-16 text-base font-black bg-gradient-to-r from-orange-600 via-orange-500 to-yellow-500 hover:from-orange-500 hover:to-yellow-400 text-[#291300] border-0 rounded-2xl tracking-[0.2em] uppercase shadow-[0_10px_40px_-10px_rgba(234,88,12,0.5)] transition-all transform hover:-translate-y-1 cursor-pointer group overflow-hidden"
                    >
                        <span className="relative z-10 flex items-center justify-center gap-2">DAFTAR SEKARANG <ArrowRight className="w-5 h-5" /></span>
                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                    </Button>
                </div>
             </form>

             <p className="mt-8 text-center text-[#8C7B75] text-xs font-medium">
                Sudah punya akun? <button onClick={() => onNavigate('login')} className="text-orange-500 hover:text-yellow-500 transition-colors ml-1 font-black underline decoration-orange-800 underline-offset-4 decoration-2">Masuk disini</button>
             </p>
          </div>
      </div>
    </div>
  );
};
