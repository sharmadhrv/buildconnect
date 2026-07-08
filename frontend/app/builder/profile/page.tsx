'use client';

import React, { useEffect, useState } from 'react';
import axiosInstance from '@/services/api/axiosInstance';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';

interface VerificationDoc {
  name: string;
  url: string;
  type: string;
}

const BuilderProfilePage = () => {
  // States
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState<string | null>(null); // Track which file is uploading
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Profile forms
  const [companyName, setCompanyName] = useState('');
  const [website, setWebsite] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [address, setAddress] = useState('');

  // Verification forms
  const [companyRegNo, setCompanyRegNo] = useState('');
  const [gstNo, setGstNo] = useState('');
  const [panNo, setPanNo] = useState('');
  const [uploadedDocs, setUploadedDocs] = useState<VerificationDoc[]>([]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = (await axiosInstance.get('/builders/profile')) as any;
      if (res.success && res.data) {
        const p = res.data;
        setProfile(p);
        setCompanyName(p.company_name || '');
        setWebsite(p.website || '');
        setLogoUrl(p.logo_url || '');
        setAddress(p.address || '');
        setCompanyRegNo(p.company_reg_no || '');
        setGstNo(p.gst_no || '');
        setPanNo(p.pan_no || '');
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to load builder profile.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // Update company profile details
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg(null);
    setErrorMsg(null);
    setSaving(true);
    try {
      const res = (await axiosInstance.put('/builders/profile', {
        company_name: companyName,
        website,
        logo_url: logoUrl,
        address
      })) as any;
      if (res.success) {
        setSuccessMsg('Profile updated successfully!');
        setProfile(res.data);
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to update profile details.');
    } finally {
      setSaving(false);
    }
  };

  // Convert file to Base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  // Handle local document upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, docLabel: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMsg(null);
    setSuccessMsg(null);
    setUploadingDoc(docLabel);

    try {
      const base64Data = await fileToBase64(file);
      
      // Call backend base64 file upload API
      const res = (await axiosInstance.post('/builders/upload-document', {
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
        // Add to uploaded documents list
        setUploadedDocs((prev) => {
          // Remove old document with the same label if exists to replace it
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

  // Submit company verification form
  const handleVerificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg(null);
    setErrorMsg(null);
    
    if (!companyRegNo || !gstNo || !panNo) {
      setErrorMsg('Please enter company registration, GSTIN, and PAN details.');
      return;
    }

    if (uploadedDocs.length < 1) {
      setErrorMsg('Please upload at least one registration/verification document.');
      return;
    }

    setSaving(true);
    try {
      const res = (await axiosInstance.post('/builders/verify', {
        company_reg_no: companyRegNo,
        gst_no: gstNo,
        pan_no: panNo,
        documents: uploadedDocs
      })) as any;

      if (res.success) {
        setSuccessMsg('Verification documents submitted successfully for review.');
        setProfile(res.data);
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to submit verification request.');
    } finally {
      setSaving(false);
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

  const verifBadgeVariant = {
    pending: 'warning',
    approved: 'success',
    rejected: 'danger'
  } as const;

  const verifBanners = {
    approved: {
      title: 'Company Profile Verified',
      desc: 'Your company profile is verified. You have full access to publish projects and award bids to contractors.',
      style: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300 shadow-emerald-500/5',
      icon: (
        <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      )
    },
    pending: {
      title: 'Verification Awaiting Review',
      desc: 'Your registration papers have been uploaded and are currently under verification review by BuildConnect administrators.',
      style: 'bg-amber-500/10 border-amber-500/20 text-amber-300 shadow-amber-500/5',
      icon: (
        <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    rejected: {
      title: 'Verification Rejected',
      desc: profile?.status_remarks 
        ? `Remarks: ${profile.status_remarks}. Please upload corrected registration forms.` 
        : 'Your registration documents were rejected. Please review and submit updated details.',
      style: 'bg-rose-500/10 border-rose-500/20 text-rose-300 shadow-rose-500/5',
      icon: (
        <svg className="w-5 h-5 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      )
    }
  };

  const currentBanner = profile ? verifBanners[profile.verification_status as 'pending' | 'approved' | 'rejected'] : null;

  return (
    <div className="flex flex-col gap-8 w-full max-w-5xl mx-auto">
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Company Profile & Trust Setup</h1>
        <p className="text-slate-400 text-sm mt-1">Configure company profiles, upload certifications, and verify tax indicators</p>
      </div>

      {/* VERIFICATION STATE BANNER */}
      {currentBanner && (
        <div className={`p-5 rounded-2xl border flex gap-4 items-start shadow-lg ${currentBanner.style}`}>
          <div className="p-3 bg-slate-950/20 rounded-xl mt-0.5">{currentBanner.icon}</div>
          <div>
            <h4 className="font-semibold text-sm">{currentBanner.title}</h4>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">{currentBanner.desc}</p>
          </div>
        </div>
      )}

      {/* SUCCESS / ERROR MESSAGES */}
      {(successMsg || errorMsg) && (
        <div className={`p-4 rounded-xl text-xs font-semibold ${successMsg ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border border-rose-500/20 text-rose-400'}`}>
          {successMsg || errorMsg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* EDIT PROFILE FORM */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Company Details</CardTitle>
              <CardDescription>Update name, address, website and brand details</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateProfile} className="flex flex-col gap-5">
                <Input
                  label="Company Name"
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  disabled={saving}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Website URL"
                    type="url"
                    placeholder="https://mycompany.com"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    disabled={saving}
                  />
                  <Input
                    label="Logo URL"
                    type="url"
                    placeholder="https://mycompany.com/logo.png"
                    value={logoUrl}
                    onChange={(e) => setLogoUrl(e.target.value)}
                    disabled={saving}
                  />
                </div>

                <Input
                  label="Office Address"
                  type="text"
                  placeholder="Street, City, ZIP, Country"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  disabled={saving}
                />

                <Button type="submit" variant="primary" loading={saving} className="self-start">
                  Save Profile Details
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* TRUST INDEX DETAILS CARD */}
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Robustness</CardTitle>
              <CardDescription>Platform integrity diagnostics</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex items-center justify-between py-2 border-b border-slate-800/40">
                <span className="text-xs text-slate-400">Trust Score Rating</span>
                <Badge variant="primary" size="md">
                  {profile ? Math.round(profile.trust_score) : 0}%
                </Badge>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-slate-800/40">
                <span className="text-xs text-slate-400">AI Profile score</span>
                <Badge variant="glass" size="md" className="border-purple-500/20 text-purple-300">
                  {profile ? Math.round(profile.ai_profile_score) : 0}%
                </Badge>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-xs text-slate-400">Verification Status</span>
                <Badge variant={profile ? verifBadgeVariant[profile.verification_status as 'pending'|'approved'|'rejected'] : 'neutral'} size="md" className="capitalize">
                  {profile?.verification_status}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* REGISTRATION PAPERS AND DOCUMENTS SUBMISSION */}
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Official Company Verification Forms</CardTitle>
          <CardDescription>Submit official records to gain verified status and boost your trust scores</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleVerificationSubmit} className="flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="Company Reg. Number"
                type="text"
                placeholder="U12345DL2023PTC123456"
                value={companyRegNo}
                onChange={(e) => setCompanyRegNo(e.target.value)}
                disabled={saving}
              />
              <Input
                label="GSTIN (Tax ID)"
                type="text"
                placeholder="07AAAAA1111A1Z1"
                value={gstNo}
                onChange={(e) => setGstNo(e.target.value)}
                disabled={saving}
              />
              <Input
                label="PAN Card Number"
                type="text"
                placeholder="ABCDE1234F"
                value={panNo}
                onChange={(e) => setPanNo(e.target.value)}
                disabled={saving}
              />
            </div>

            {/* Drag-Drop / Local file selectors */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
              {['GST Certificate', 'PAN Card Scan', 'Incorporation Certificate'].map((docLabel) => {
                const isUploaded = uploadedDocs.some(d => d.name.startsWith(docLabel));
                return (
                  <div key={docLabel} className="flex flex-col gap-2 p-5 border border-dashed border-slate-800 hover:border-slate-700 bg-slate-950/40 rounded-2xl transition-all duration-200">
                    <span className="text-xs font-semibold text-slate-300">{docLabel}</span>
                    
                    <div className="relative flex-1 flex flex-col items-center justify-center py-6 cursor-pointer">
                      {uploadingDoc === docLabel ? (
                        <div className="flex flex-col items-center gap-2">
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
                          <span className="text-[10px]">Select PDF or Image</span>
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
              Submit Papers for Verification
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default BuilderProfilePage;
