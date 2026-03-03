
import React, { useState } from 'react';
import { MapPin, Plus, Trash2, Loader2, Edit3, Check, Star, X } from 'lucide-react';
import { Button } from '../../components/Button';
import { Address } from '../../../types';

interface AddressListProps {
    addresses: Address[];
    onAddAddress: (addr: Address) => Promise<void>; 
    onUpdateAddress?: (addr: Address) => Promise<void>;
    onDeleteAddress?: (id: string) => void;
}

export const AddressList: React.FC<AddressListProps> = ({ addresses, onAddAddress, onUpdateAddress, onDeleteAddress }) => {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    
    const [formData, setFormData] = useState<Address>({ 
        id: '', 
        label: 'Alamat Saya', // Default value
        fullAddress: '', 
        receiverName: '-', // Default value
        phone: '-', // Default value
        isPrimary: false 
    });

    const resetForm = () => {
        setFormData({ id: '', label: 'Alamat Saya', fullAddress: '', receiverName: '-', phone: '-', isPrimary: false });
        setEditingId(null);
        setIsFormOpen(false);
    };

    const handleEditClick = (addr: Address) => {
        setFormData(addr);
        setEditingId(addr.id);
        setIsFormOpen(true);
    };

    const handleAddClick = () => {
        setFormData({ id: '', label: 'Alamat Saya', fullAddress: '', receiverName: '-', phone: '-', isPrimary: addresses.length === 0 });
        setEditingId(null);
        setIsFormOpen(true);
    };

    const handleSave = async () => {
        if (!formData.fullAddress) return alert("Mohon isi alamat lengkap");
        
        setIsSaving(true);
        try {
            if (editingId && onUpdateAddress) {
                await onUpdateAddress(formData);
            } else {
                const newAddr = { ...formData, id: "" };
                await onAddAddress(newAddr);
            }
            resetForm();
        } catch (e) {
            console.error(e);
        } finally {
            setIsSaving(false);
        }
    };

    const setAsPrimary = async (addr: Address) => {
        if(onUpdateAddress) {
            await onUpdateAddress({...addr, isPrimary: true});
        }
    };

    return (
        <div className="p-4 md:p-6 bg-[#FDFBF7] dark:bg-[#0C0A09] min-h-screen animate-in fade-in text-stone-900 dark:text-stone-200 transition-colors duration-300">
            {isFormOpen ? (
                <div className="bg-white dark:bg-[#1C1917] p-6 rounded-3xl border border-stone-200 dark:border-[#2C1810] space-y-6 shadow-xl relative">
                    <button onClick={resetForm} className="absolute top-6 right-6 text-stone-400 hover:text-stone-900 dark:hover:text-white transition-colors"><X className="w-6 h-6" /></button>
                    
                    <div>
                        <h3 className="text-xl font-black text-stone-900 dark:text-white uppercase tracking-tight">{editingId ? 'Edit Lokasi' : 'Lokasi Baru'}</h3>
                        <p className="text-xs text-stone-500 font-bold uppercase tracking-widest mt-1">Detail Titik Penjemputan / Pengantaran</p>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-stone-500 uppercase tracking-widest">Alamat Lengkap</label>
                            <textarea 
                                className="w-full bg-stone-50 dark:bg-[#0C0A09] border border-stone-200 dark:border-[#292524] text-stone-900 dark:text-white rounded-xl px-4 py-3 focus:outline-none focus:border-orange-500 placeholder-stone-400 dark:placeholder-stone-600 transition-all text-sm h-32 resize-none" 
                                rows={4} 
                                value={formData.fullAddress} 
                                onChange={e => setFormData({...formData, fullAddress: e.target.value})}
                                placeholder="Tuliskan nama jalan, nomor rumah, patokan, RT/RW..." 
                            />
                        </div>
                        
                        <label className="flex items-center gap-3 p-4 bg-stone-50 dark:bg-[#0C0A09] rounded-xl border border-stone-200 dark:border-[#292524] cursor-pointer hover:border-orange-500/50 transition-all">
                            <input 
                                type="checkbox" 
                                checked={formData.isPrimary} 
                                onChange={e => setFormData({...formData, isPrimary: e.target.checked})}
                                className="w-5 h-5 text-orange-600 rounded focus:ring-orange-500 bg-white dark:bg-[#1C1917] border-stone-300 dark:border-stone-600"
                            />
                            <span className="text-sm text-stone-700 dark:text-stone-300 font-bold">Jadikan Lokasi Utama</span>
                        </label>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <Button variant="ghost" onClick={resetForm} className="flex-1 border border-stone-200 dark:border-[#292524] text-stone-500 dark:text-stone-400 hover:bg-stone-100 dark:hover:text-white">BATAL</Button>
                        <Button onClick={handleSave} disabled={isSaving} className="flex-[2] bg-gradient-to-r from-orange-600 to-yellow-500 text-white dark:text-[#291300] font-black uppercase tracking-widest hover:shadow-[0_0_20px_rgba(234,88,12,0.4)] border-0 shadow-lg">
                            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'SIMPAN LOKASI'}
                        </Button>
                    </div>
                </div>
            ) : (
                <div className="space-y-4 max-w-2xl mx-auto">
                    {addresses.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 bg-white dark:bg-[#1C1917] rounded-3xl border border-dashed border-stone-200 dark:border-[#292524] shadow-sm">
                            <div className="w-20 h-20 bg-orange-50 dark:bg-[#2C1810] rounded-full flex items-center justify-center mb-6 border border-orange-100 dark:border-orange-900/30">
                                <MapPin className="w-10 h-10 text-orange-500" />
                            </div>
                            <p className="text-stone-900 dark:text-stone-300 text-lg font-bold">Belum ada lokasi tersimpan</p>
                            <p className="text-sm text-stone-500 mt-2 max-w-xs text-center px-4">Tambahkan lokasi untuk memudahkan transaksi donasi.</p>
                            
                            <Button 
                                variant="outline" 
                                className="mt-8 border-orange-500 text-orange-600 hover:bg-orange-500 hover:text-white w-auto px-10 py-4 rounded-2xl font-black uppercase text-xs tracking-widest transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-orange-500/30 active:scale-95 mx-auto" 
                                onClick={handleAddClick}
                            >
                                <Plus className="w-5 h-5 mr-2" /> Tambah Lokasi
                            </Button>
                        </div>
                    ) : (
                        <>
                            {addresses.map(addr => (
                                <div key={addr.id} className={`bg-white dark:bg-[#1C1917] p-5 rounded-2xl border transition-all relative group overflow-hidden shadow-sm hover:shadow-md ${addr.isPrimary ? 'border-orange-500 shadow-orange-500/10' : 'border-stone-200 dark:border-[#292524] hover:border-stone-300'}`}>
                                    {addr.isPrimary && (
                                        <div className="absolute top-0 right-0 bg-orange-500 text-white dark:text-[#291300] text-[9px] px-3 py-1 rounded-bl-xl font-black uppercase tracking-widest flex items-center gap-1 shadow-md">
                                            <Check className="w-3 h-3" /> Utama
                                        </div>
                                    )}
                                    
                                    <div className="flex items-start gap-4">
                                        <div className={`p-3 rounded-xl shrink-0 ${addr.isPrimary ? 'bg-orange-50 text-orange-500 dark:bg-orange-500/10' : 'bg-stone-100 dark:bg-[#0C0A09] text-stone-400 dark:text-stone-500'}`}>
                                            <MapPin className="w-6 h-6" />
                                        </div>
                                        <div className="flex-1 pr-12">
                                            <p className="text-stone-900 dark:text-stone-100 text-sm font-medium leading-relaxed mb-2">{addr.fullAddress}</p>
                                        </div>
                                    </div>

                                    <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-stone-100 dark:border-[#292524]">
                                        {!addr.isPrimary && (
                                            <button onClick={() => setAsPrimary(addr)} className="px-3 py-1.5 rounded-lg bg-stone-100 dark:bg-[#292524] text-stone-500 dark:text-stone-400 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-[#2C1810] text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 transition-colors">
                                                <Star className="w-3 h-3" /> Set Utama
                                            </button>
                                        )}
                                        <button onClick={() => handleEditClick(addr)} className="px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 transition-colors">
                                            <Edit3 className="w-3 h-3" /> Edit
                                        </button>
                                        <button onClick={() => onDeleteAddress && onDeleteAddress(addr.id)} className="px-3 py-1.5 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 transition-colors">
                                            <Trash2 className="w-3 h-3" /> Hapus
                                        </button>
                                    </div>
                                </div>
                            ))}
                            <Button 
                                onClick={handleAddClick}
                                className="w-full h-14 bg-white dark:bg-[#1C1917] border-2 border-dashed border-stone-300 dark:border-[#292524] hover:border-orange-500 hover:text-orange-600 text-stone-400 dark:text-stone-500 rounded-2xl font-black uppercase tracking-widest transition-all hover:bg-orange-50 dark:hover:bg-orange-900/10 transform hover:scale-[1.01]"
                            >
                                <Plus className="w-5 h-5 mr-2" /> Tambah Lokasi Lain
                            </Button>
                        </>
                    )}
                </div>
            )}
        </div>
    );
};
