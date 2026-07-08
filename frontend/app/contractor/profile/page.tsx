'use client';

import React, { useEffect, useState } from 'react';
import axiosInstance from '@/services/api/axiosInstance';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';

interface ItemSelection {
  id: string;
  name: string;
}

interface VerificationDoc {
  name: string;
  url: string;
  type: string;
}

const ContractorProfilePage = () => {
  // Loading & Action States
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Master Lists
  const [masterSkills, setMasterSkills] = useState<ItemSelection[]>([]);
  const [masterCategories, setMasterCategories] = useState<ItemSelection[]>([]);

  // Profile forms
  const [businessName, setBusinessName] = useState('');
  const [website, setWebsite] = useState('');
  const [address, setAddress] = useState('');
  const [locationPref, setLocationPref] = useState('');
  const [budgetPrefMax, setBudgetPrefMax] = useState('');

  // Selected Checkboxes
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  // Verification Form
  const [panNo, setPanNo] = useState('');
  const [aadhaarNo, setAadhaarNo] = useState('');
  const [businessRegNo, setBusinessRegNo] = useState('');
  const [uploadedDocs, setUploadedDocs] = useState<VerificationDoc[]>([]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);

      // Fetch master skills & categories
      const [skillsRes, catsRes] = await Promise.all([
        axiosInstance.get('/master/skills') as any,
        axiosInstance.get('/master/categories') as any
      ]);

      if (skillsRes.success) setMasterSkills(skillsRes.data);
      if (catsRes.success) setMasterCategories(catsRes.data);

      // Fetch profile
      const res = (await axiosInstance.get('/contractors/profile')) as any;
      if (res.success && res.data) {
        const p = res.data;
        setProfile(p);
        setBusinessName(p.business_name || '');
        setWebsite(p.website || '');
        setAddress(p.address || '');
        
        // Parse preferences
        const prefs = p.preferences || {};
        setLocationPref(prefs.location || '');
        setBudgetPrefMax(prefs.budgetMax ? String(prefs.budgetMax) : '');

        // Set selected checkboxes
        setSelectedSkills((p.skills || []).map((s: any) => s.id));
        setSelectedCategories((p.categories || []).map((c: any) => c.id));

        setPanNo(p.pan_no || '');
        setAadhaarNo(p.aadhaar_no || '');
        setBusinessRegNo(p.business_reg_no || '');
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to retrieve contractor profiles.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Update profile details and preferences
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg(null);
    setErrorMsg(null);
    setSaving(true);

    try {
      const res = (await axiosInstance.put('/contractors/profile', {
        business_name: businessName,
        website,
        address,
        preferences: {
          location: locationPref,
          budgetMax: budgetPrefMax ? parseFloat(budgetPrefMax) : undefined
        }
      })) as any;

      if (res.success) {
        setSuccessMsg('Business details updated successfully!');
        setProfile(res.data);
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to update details.');
    } finally {
      setSaving(false);
    }
  };

  // Synchronize Specialties (Skills & Categories Checkboxes)
  const handleSaveSpecialties = async () => {
    setSuccessMsg(null);
    setErrorMsg(null);
    setSaving(true);
    try {
      // Sync skills
      const skillRes = (await axiosInstance.put('/contractors/skills', { skills: selectedSkills })) as any;
      // Sync categories
      const catRes = (await axiosInstance.put('/contractors/categories', { categories: selectedCategories })) as any;

      if (skillRes.success && catRes.success) {
        setSuccessMsg('Specialties synchronized successfully!');
        setProfile(catRes.data);
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to save specialties.');
    } finally {
      setSaving(false);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  // Document Upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, docLabel: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMsg(null);
    setSuccessMsg(null);
    setUploadingDoc(docLabel);

    try {
      const base64Data = await fileToBase64(file);
      const res = (await axiosInstance.post('/contractors/upload-document', {
        fileName: `${docLabel}_${file.name}`,
        fileType: file.type,
        fileData: base64Data
      })) as any;

      if (res.success && res.data) {
        const newDoc: VerificationDoc = {
          name: res.data.name,
          url: res.data.url,
          type: res.data.type
        };

        setUploadedDocs((prev) => {
          const filtered = prev.filter(d => !d.name.startsWith(docLabel));
          return [...filtered, newDoc];
        });
        setSuccessMsg(`${docLabel} uploaded successfully!`);
      }
    } catch (err: any) {
      setErrorMsg(err?.message || `Failed to upload ${docLabel}.`);
    } finally {
      setUploadingDoc(null);
    }
  };

  // Submit Verification request
  const handleVerificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg(null);
    setErrorMsg(null);

    if (!panNo || !aadhaarNo || !businessRegNo) {
      setErrorMsg('Aadhaar, PAN, and License Registration ID are all required.');
      return;
    }

    if (uploadedDocs.length < 1) {
      setErrorMsg('Please upload at least one verification PDF/Image document.');
      return;
    }

    setSaving(true);
    try {
      const res = (await axiosInstance.post('/contractors/verify', {
        pan_no: panNo,
        aadhaar_no: aadhaarNo,
        business_reg_no: businessRegNo,
        documents: uploadedDocs
      })) as any;

      if (res.success) {
        setSuccessMsg('Identity verification documents filed successfully for review.');
        setProfile(res.data);
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to submit verification request.');
    } finally {
      setSaving(false);
    }
  };

  const handleCheckboxToggle = (id: string, list: string[], setList: React.Dispatch<React.SetStateAction<string[]>>) => {
    if (list.includes(id)) {
      setList(prev => prev.filter(item => item !== id));
    } else {
      setList(prev => [...prev, id]);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <svg className="animate-spin h-8 w-8 text-purple-500" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      </div>
    );
  }

  const verifBadgeVariants = {
    pending: 'warning',
    approved: 'success',
    rejected: 'danger'
  } as const;

  return (
    <div className="flex flex-col gap-8 w-full max-w-5xl mx-auto">
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Profile & Verification Setup</h1>
        <p className="text-slate-400 text-sm mt-1">Configure business settings, skills specialties, and tax/license verifications</p>
      </div>

      {/* VERIFICATION STATE STATUS BANNER */}
      {profile && (
        <div className={`p-4 rounded-xl border flex gap-3.5 items-center text-xs font-semibold ${
          profile.verification_status === 'approved' 
            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
            : profile.verification_status === 'pending'
              ? 'bg-amber-500/10 border-amber-500/20 text-amber-400'
              : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
        }`}>
          <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <div>
            <span>Company Account Status: <span className="uppercase font-bold">{profile.verification_status}</span>.</span>
            {profile.status_remarks && <span className="block text-slate-400 mt-1 font-normal">Remarks: {profile.status_remarks}</span>}
          </div>
        </div>
      )}

      {(successMsg || errorMsg) && (
        <div className={`p-4 rounded-xl text-xs font-semibold ${successMsg ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border border-rose-500/20 text-rose-400'}`}>
          {successMsg || errorMsg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* BUSINESS DETAILS & PREFERENCES */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Business Details</CardTitle>
              <CardDescription>Setup address, website and bidding size preferences</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateProfile} className="flex flex-col gap-4">
                <Input
                  label="Registered Business Name"
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  disabled={saving}
                />
                <Input
                  label="Website URL"
                  type="url"
                  placeholder="https://apexelectricals.com"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  disabled={saving}
                />
                <Input
                  label="Office Address"
                  type="text"
                  placeholder="Street, City, Country"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  disabled={saving}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                  <Input
                    label="Preferred Bidding Location"
                    type="text"
                    placeholder="E.g. Delhi NCR"
                    value={locationPref}
                    onChange={(e) => setLocationPref(e.target.value)}
                    disabled={saving}
                  />
                  <Input
                    label="Preferred Max Project Budget (INR)"
                    type="number"
                    placeholder="E.g. 2000000"
                    value={budgetPrefMax}
                    onChange={(e) => setBudgetPrefMax(e.target.value)}
                    disabled={saving}
                  />
                </div>

                <Button type="submit" variant="primary" loading={saving} className="self-start mt-2">
                  Save Business Details
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* DYNAMIC CHECKBOXES SPECIALTIES */}
          <Card>
            <CardHeader>
              <CardTitle>Service Categories & Trade Skills</CardTitle>
              <CardDescription>Select construction services you qualify to bid on</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-6">
              {/* Work categories */}
              <div className="flex flex-col gap-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Service Categories</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1">
                  {masterCategories.map((cat) => {
                    const checked = selectedCategories.includes(cat.id);
                    return (
                      <div
                        key={cat.id}
                        onClick={() => handleCheckboxToggle(cat.id, selectedCategories, setSelectedCategories)}
                        className={`flex items-center gap-3 p-3.5 border rounded-xl cursor-pointer select-none transition-all duration-200 ${
                          checked
                            ? 'bg-indigo-600/10 border-indigo-500 text-indigo-300'
                            : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          readOnly
                          className="w-4 h-4 rounded text-indigo-600 bg-slate-950 border-slate-800"
                        />
                        <span className="text-xs font-semibold">{cat.name}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Trade skills checklist */}
              <div className="flex flex-col gap-2 border-t border-slate-800/40 pt-4">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Trade Specialties / Skills</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1">
                  {masterSkills.map((skill) => {
                    const checked = selectedSkills.includes(skill.id);
                    return (
                      <div
                        key={skill.id}
                        onClick={() => handleCheckboxToggle(skill.id, selectedSkills, setSelectedSkills)}
                        className={`flex items-center gap-3 p-3.5 border rounded-xl cursor-pointer select-none transition-all duration-200 ${
                          checked
                            ? 'bg-purple-600/10 border-purple-500 text-purple-300'
                            : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          readOnly
                          className="w-4 h-4 rounded text-purple-600 bg-slate-950 border-slate-800"
                        />
                        <span className="text-xs font-semibold">{skill.name}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <Button onClick={handleSaveSpecialties} variant="primary" loading={saving} className="self-start">
                Save Specialties
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* METRICS PANEL */}
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Score Diagnostics</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4 text-xs">
              <div className="flex justify-between items-center py-2 border-b border-slate-800/40">
                <span className="text-slate-400 font-medium">Verification Status</span>
                <Badge variant={profile ? verifBadgeVariants[profile.verification_status as 'pending'|'approved'|'rejected'] : 'neutral'} size="sm" className="capitalize">
                  {profile?.verification_status}
                </Badge>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-800/40">
                <span className="text-slate-400 font-medium">Trust Score</span>
                <span className="text-white font-bold">{profile ? Math.round(profile.trust_score) : 0}%</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-slate-400 font-medium">AI Completeness Score</span>
                <span className="text-white font-bold">{profile ? Math.round(profile.ai_profile_score) : 0}%</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* IDENTITY VERIFICATION UPLOADS */}
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Identity & Trade Certification Uploads</CardTitle>
          <CardDescription>File Aadhaar/PAN cards and licensing documents to authenticate your company identity</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleVerificationSubmit} className="flex flex-col gap-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="Personal 12-Digit Aadhaar No"
                type="text"
                placeholder="123456789012"
                maxLength={12}
                value={aadhaarNo}
                onChange={(e) => setAadhaarNo(e.target.value.replace(/\D/g, ''))}
                disabled={saving}
              />
              <Input
                label="Personal 10-Character PAN"
                type="text"
                placeholder="ABCDE1234F"
                maxLength={10}
                value={panNo}
                onChange={(e) => setPanNo(e.target.value.toUpperCase())}
                disabled={saving}
              />
              <Input
                label="Trade License / Registration ID"
                type="text"
                placeholder="LIC-1234-EXP-2027"
                value={businessRegNo}
                onChange={(e) => setBusinessRegNo(e.target.value)}
                disabled={saving}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              {['Aadhaar Card Scan', 'PAN Card Scan', 'Trade License Scan', 'Insurance Certificate'].map((docLabel) => {
                const isUploaded = uploadedDocs.some(d => d.name.startsWith(docLabel));
                return (
                  <div key={docLabel} className="flex flex-col gap-2 p-4 border border-dashed border-slate-800 hover:border-slate-700 bg-slate-950/40 rounded-2xl transition-all duration-200">
                    <span className="text-xs font-semibold text-slate-300">{docLabel}</span>
                    <div className="relative flex-1 flex flex-col items-center justify-center py-6 cursor-pointer">
                      {uploadingDoc === docLabel ? (
                        <div className="flex flex-col items-center gap-1.5">
                          <svg className="animate-spin h-5 w-5 text-purple-500" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          <span className="text-[10px] text-slate-500">Uploading...</span>
                        </div>
                      ) : isUploaded ? (
                        <div className="flex flex-col items-center gap-1.5 text-emerald-400">
                          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-[10px] text-emerald-500 font-bold">Uploaded</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-1.5 text-slate-500 hover:text-slate-400 transition-colors">
                          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                          <span className="text-[10px]">Select PDF/Image</span>
                        </div>
                      )}
                      
                      <input
                        type="file"
                        accept="application/pdf,image/*"
                        onChange={(e) => handleFileUpload(e, docLabel)}
                        disabled={uploadingDoc !== null || saving}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <Button
              type="submit"
              variant="primary"
              loading={saving}
              disabled={uploadedDocs.length < 1}
              className="self-start mt-4"
            >
              Submit Verification Papers
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ContractorProfilePage;
