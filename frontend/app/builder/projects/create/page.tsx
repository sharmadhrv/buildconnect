'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import axiosInstance from '@/services/api/axiosInstance';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';

interface PackageFormState {
  name: string;
  description: string;
  budget: number;
  timeline_start: string;
  timeline_end: string;
  scope: string;
  required_experience: string;
  skills: string[]; // Mock skill selections for V1
}

// Popular construction skills for selection
const KNOWN_SKILLS = [
  { id: '1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed', name: 'Masonry & Brickwork' },
  { id: '2b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed', name: 'Electrical Wiring' },
  { id: '3b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed', name: 'Plumbing & Pipefitting' },
  { id: '4b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed', name: 'HVAC Installation' },
  { id: '5b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed', name: 'Structural Steelwork' },
  { id: '6b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed', name: 'Roofing & Waterproofing' },
  { id: '7b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed', name: 'Carpentry & Framing' },
  { id: '8b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed', name: 'Flooring & Tiling' },
];

const CreateProjectPage = () => {
  const router = useRouter();
  
  // Wizard Step State
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Step 1: Project Details
  const [projectName, setProjectName] = useState('');
  const [projectDesc, setProjectDesc] = useState('');
  const [projectBudget, setProjectBudget] = useState('');
  const [timelineStart, setTimelineStart] = useState('');
  const [timelineEnd, setTimelineEnd] = useState('');
  const [propertyType, setPropertyType] = useState('Commercial');
  const [location, setLocation] = useState('');

  // Step 2: Packages
  const [packages, setPackages] = useState<PackageFormState[]>([
    {
      name: '',
      description: '',
      budget: 0,
      timeline_start: '',
      timeline_end: '',
      scope: '',
      required_experience: '3+ Years',
      skills: []
    }
  ]);

  const addPackage = () => {
    setPackages((prev) => [
      ...prev,
      {
        name: '',
        description: '',
        budget: 0,
        timeline_start: '',
        timeline_end: '',
        scope: '',
        required_experience: '3+ Years',
        skills: []
      }
    ]);
  };

  const removePackage = (index: number) => {
    if (packages.length === 1) return;
    setPackages((prev) => prev.filter((_, idx) => idx !== index));
  };

  const updatePackageField = (index: number, field: keyof PackageFormState, value: any) => {
    setPackages((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleSkillToggle = (packageIndex: number, skillId: string) => {
    const pkg = packages[packageIndex];
    const skillList = pkg.skills.includes(skillId)
      ? pkg.skills.filter(id => id !== skillId)
      : [...pkg.skills, skillId];
    
    updatePackageField(packageIndex, 'skills', skillList);
  };

  const validateStep1 = () => {
    if (!projectName || !projectDesc || !projectBudget || !location) {
      setErrorMsg('Please fill in all required project fields.');
      return false;
    }
    setErrorMsg(null);
    return true;
  };

  const validateStep2 = () => {
    for (let i = 0; i < packages.length; i++) {
      const pkg = packages[i];
      if (!pkg.name || pkg.budget <= 0 || !pkg.scope) {
        setErrorMsg(`Please fill in all required fields for Package #${i + 1}.`);
        return false;
      }
    }
    setErrorMsg(null);
    return true;
  };

  const handleNextStep = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      setStep(3);
    }
  };

  const handlePrevStep = () => {
    setErrorMsg(null);
    if (step === 2) setStep(1);
    if (step === 3) setStep(2);
  };

  const handleSubmit = async (submitStatus: 'draft' | 'pending_approval' | 'published') => {
    setErrorMsg(null);
    setSaving(true);
    
    const payload = {
      name: projectName,
      description: projectDesc,
      budget: parseFloat(projectBudget),
      timeline_start: timelineStart || undefined,
      timeline_end: timelineEnd || undefined,
      property_type: propertyType,
      location,
      status: submitStatus,
      packages: packages.map(pkg => ({
        ...pkg,
        description: pkg.description || pkg.scope || pkg.name,
        // Send skills array (or omit if backend table not seeded)
        skills: pkg.skills.length > 0 ? pkg.skills : undefined
      }))
    };

    try {
      const res = (await axiosInstance.post('/projects', payload)) as any;
      if (res.success) {
        router.push('/builder/projects');
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to submit project framework.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 w-full max-w-4xl mx-auto">
      {/* HEADER & STEP WIZARD STATUS */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white font-sans">New Project Workspace</h1>
          <p className="text-slate-400 text-sm mt-1">Split large projects into manageable package segments</p>
        </div>
        
        {/* Step circles */}
        <div className="flex items-center gap-3 bg-slate-900/60 border border-slate-800/80 px-4 py-2.5 rounded-2xl">
          {[1, 2, 3].map((num) => (
            <div key={num} className="flex items-center gap-1.5">
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                step === num 
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20' 
                  : step > num 
                    ? 'bg-indigo-900/50 text-indigo-300 border border-indigo-700/30' 
                    : 'bg-slate-800 text-slate-500'
              }`}>
                {num}
              </span>
              <span className={`text-xs font-semibold ${step === num ? 'text-slate-200' : 'text-slate-500'}`}>
                {num === 1 ? 'Details' : num === 2 ? 'Packages' : 'Confirm'}
              </span>
              {num < 3 && <span className="text-slate-700 font-bold">/</span>}
            </div>
          ))}
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-xs font-semibold">
          {errorMsg}
        </div>
      )}

      {/* STEP 1: GENERAL PROJECT DETAILS */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Project Architecture</CardTitle>
            <CardDescription>Enter locations, budgets, and property scopes</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            <Input
              label="Project Title"
              type="text"
              placeholder="E.g. Oakridge Residential Complex"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
            />

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-300">Project Description</label>
              <textarea
                value={projectDesc}
                onChange={(e) => setProjectDesc(e.target.value)}
                placeholder="Describe the construction site parameters, general scope, and contractor requirements..."
                className="w-full h-32 bg-slate-900/60 border border-slate-800 focus:border-purple-500/80 focus:ring-purple-500/30 focus:ring-4 rounded-xl p-4 text-sm text-slate-100 placeholder-slate-500 outline-none transition-all duration-300"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Location (City / State)"
                type="text"
                placeholder="E.g. Sector 62, Noida, UP"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
              <Input
                label="Declared Budget (INR)"
                type="number"
                placeholder="E.g. 5000000"
                value={projectBudget}
                onChange={(e) => setProjectBudget(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="Estimated Start Date"
                type="date"
                value={timelineStart}
                onChange={(e) => setTimelineStart(e.target.value)}
              />
              <Input
                label="Estimated Completion Date"
                type="date"
                value={timelineEnd}
                onChange={(e) => setTimelineEnd(e.target.value)}
              />
              
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-300">Property Category</label>
                <select
                  value={propertyType}
                  onChange={(e) => setPropertyType(e.target.value)}
                  className="w-full bg-slate-900/60 border border-slate-800 focus:border-purple-500/80 focus:ring-purple-500/30 focus:ring-4 rounded-xl px-4 py-3 text-sm text-slate-300 outline-none transition-all duration-300"
                >
                  <option value="Residential">Residential House</option>
                  <option value="Commercial">Commercial Building</option>
                  <option value="Industrial">Industrial Factory</option>
                  <option value="Infrastructure">Infrastructure Road/Bridge</option>
                </select>
              </div>
            </div>

            <Button onClick={handleNextStep} variant="primary" className="self-end mt-4">
              Configure Work Packages
            </Button>
          </CardContent>
        </Card>
      )}

      {/* STEP 2: DYNAMIC PACKAGES CONFIGURATION */}
      {step === 2 && (
        <div className="flex flex-col gap-6">
          {packages.map((pkg, idx) => (
            <Card key={idx} className="relative overflow-visible">
              {packages.length > 1 && (
                <button
                  type="button"
                  onClick={() => removePackage(idx)}
                  className="absolute top-4 right-4 p-1.5 bg-rose-950/20 border border-rose-900/30 rounded-lg text-rose-400 hover:bg-rose-950/40 transition-colors z-10"
                  title="Remove package"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              )}

              <CardHeader>
                <CardTitle className="text-base font-bold text-indigo-300">Work Package #{idx + 1}</CardTitle>
                <CardDescription>Specify targeted budgets, scopes and skill matching tags</CardDescription>
              </CardHeader>

              <CardContent className="flex flex-col gap-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Package Name"
                    type="text"
                    placeholder="E.g. Foundation Masonry & Concrete"
                    value={pkg.name}
                    onChange={(e) => updatePackageField(idx, 'name', e.target.value)}
                  />
                  <Input
                    label="Allocated Budget (INR)"
                    type="number"
                    placeholder="E.g. 1500000"
                    value={pkg.budget || ''}
                    onChange={(e) => updatePackageField(idx, 'budget', parseFloat(e.target.value) || 0)}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input
                    label="Start Date"
                    type="date"
                    value={pkg.timeline_start}
                    onChange={(e) => updatePackageField(idx, 'timeline_start', e.target.value)}
                  />
                  <Input
                    label="End Date"
                    type="date"
                    value={pkg.timeline_end}
                    onChange={(e) => updatePackageField(idx, 'timeline_end', e.target.value)}
                  />
                  <Input
                    label="Required Experience"
                    type="text"
                    placeholder="E.g. 5+ Years"
                    value={pkg.required_experience}
                    onChange={(e) => updatePackageField(idx, 'required_experience', e.target.value)}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-slate-300">Scope Statement / Scope of Work</label>
                  <textarea
                    value={pkg.scope}
                    onChange={(e) => updatePackageField(idx, 'scope', e.target.value)}
                    placeholder="Detail the materials to be used, specifications, and performance expectations..."
                    className="w-full h-24 bg-slate-900/60 border border-slate-800 focus:border-purple-500/80 focus:ring-purple-500/30 focus:ring-4 rounded-xl p-4 text-sm text-slate-100 placeholder-slate-500 outline-none transition-all duration-300"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-slate-300">Required Skills</label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {KNOWN_SKILLS.map((skill) => {
                      const selected = pkg.skills.includes(skill.id);
                      return (
                        <button
                          key={skill.id}
                          type="button"
                          onClick={() => handleSkillToggle(idx, skill.id)}
                          className={`text-xs px-3.5 py-1.5 rounded-full border transition-all duration-200 ${
                            selected
                              ? 'bg-purple-600 border-purple-500 text-white shadow-sm shadow-purple-500/10'
                              : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                          }`}
                        >
                          {skill.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          <Button
            onClick={addPackage}
            variant="secondary"
            className="w-full py-4 border-dashed border-slate-800 hover:border-slate-700 bg-slate-950/20"
            icon={
              <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
              </svg>
            }
          >
            Add Another Work Package
          </Button>

          {/* Nav buttons */}
          <div className="flex justify-between items-center mt-6">
            <Button onClick={handlePrevStep} variant="outline">
              Back to Details
            </Button>
            <Button onClick={handleNextStep} variant="primary">
              Review Project Summary
            </Button>
          </div>
        </div>
      )}

      {/* STEP 3: SUMMARY CONFIRMATION */}
      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Review Project Registration</CardTitle>
            <CardDescription>Confirm details before publishing onto the contractor boards</CardDescription>
          </CardHeader>
          
          <CardContent className="flex flex-col gap-6 text-slate-300">
            {/* General details grid */}
            <div className="p-5 bg-slate-900/60 border border-slate-800/80 rounded-2xl grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold block">Project Title</span>
                <span className="text-white font-bold text-base">{projectName}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold block">Budget Limit</span>
                <span className="text-white font-bold text-base">₹{Number(projectBudget).toLocaleString('en-IN')}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold block">Location</span>
                <span className="text-slate-300 text-sm">{location}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold block">Property Category</span>
                <span className="text-slate-300 text-sm">{propertyType}</span>
              </div>
            </div>

            {/* Packages Summary */}
            <div className="flex flex-col gap-3">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Packages Structure</span>
              <div className="flex flex-col gap-3.5">
                {packages.map((pkg, idx) => (
                  <div key={idx} className="p-4 bg-slate-950/40 border border-slate-900 rounded-xl flex justify-between items-center gap-4">
                    <div>
                      <h4 className="font-bold text-sm text-slate-200">{pkg.name}</h4>
                      <p className="text-xs text-slate-500 mt-1 max-w-[400px] truncate">{pkg.scope}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className="font-bold text-slate-100 text-sm block">₹{pkg.budget.toLocaleString('en-IN')}</span>
                      <span className="text-[10px] text-slate-500">{pkg.required_experience}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 border-t border-slate-800/40 pt-6">
              <Button onClick={handlePrevStep} variant="outline" disabled={saving}>
                Back to Packages
              </Button>
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <Button
                  onClick={() => handleSubmit('draft')}
                  variant="secondary"
                  loading={saving}
                  className="flex-1 sm:flex-none"
                >
                  Save Draft
                </Button>
                <Button
                  onClick={() => handleSubmit('published')}
                  variant="primary"
                  loading={saving}
                  className="flex-1 sm:flex-none"
                >
                  Publish Project
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CreateProjectPage;
