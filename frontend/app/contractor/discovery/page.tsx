'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axiosInstance from '@/services/api/axiosInstance';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Input from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';

interface PackageItem {
  id: string;
  name: string;
  description: string;
  budget: string;
  scope: string;
  required_experience: string | null;
  skills: string[] | null;
}

interface ProjectListing {
  id: string;
  name: string;
  description: string;
  budget: string;
  location: string;
  property_type: string | null;
  builder_name: string;
  builder_trust_score: string;
  packages: PackageItem[];
}

const ContractorDiscoveryPage = () => {
  const router = useRouter();

  // Project lists states
  const [projects, setProjects] = useState<ProjectListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters state
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [minBudget, setMinBudget] = useState('');
  const [maxBudget, setMaxBudget] = useState('');
  const [matchingOnly, setMatchingOnly] = useState(false);

  const fetchOpenProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const queryParams = new URLSearchParams();
      if (search) queryParams.append('search', search);
      if (location) queryParams.append('location', location);
      if (propertyType) queryParams.append('propertyType', propertyType);
      if (minBudget) queryParams.append('minBudget', minBudget);
      if (maxBudget) queryParams.append('maxBudget', maxBudget);
      if (matchingOnly) queryParams.append('matching', 'true');

      const res = (await axiosInstance.get(`/discovery/projects?${queryParams.toString()}`)) as any;
      if (res.success) {
        setProjects(res.data);
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to retrieve open project boards.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOpenProjects();
  }, [matchingOnly]); // Auto trigger on matching toggle change

  const handleFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOpenProjects();
  };

  const handleResetFilters = () => {
    setSearch('');
    setLocation('');
    setPropertyType('');
    setMinBudget('');
    setMaxBudget('');
    setMatchingOnly(false);
    // Reload
    setTimeout(() => fetchOpenProjects(), 100);
  };

  if (loading && projects.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <svg className="animate-spin h-8 w-8 text-purple-500" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 w-full max-w-7xl mx-auto">
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white font-sans">Open Work Bidding Board</h1>
        <p className="text-slate-400 text-sm mt-1">Discover published builder projects and apply for active construction work packages</p>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-xs font-semibold">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* SIDEBAR FILTER PANEL */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-300">Filter Workspace</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleFilterSubmit} className="flex flex-col gap-4 text-slate-300">
                <Input
                  label="Keywords Search"
                  type="text"
                  placeholder="Title, description..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                
                <Input
                  label="Location"
                  type="text"
                  placeholder="City, State"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-400">Property Type</label>
                  <select
                    value={propertyType}
                    onChange={(e) => setPropertyType(e.target.value)}
                    className="w-full bg-slate-900/60 border border-slate-800 focus:border-purple-500/80 focus:ring-purple-500/30 focus:ring-4 rounded-xl px-3.5 py-2.5 text-xs text-slate-300 outline-none transition-all duration-300"
                  >
                    <option value="">All Categories</option>
                    <option value="Residential">Residential</option>
                    <option value="Commercial">Commercial</option>
                    <option value="Industrial">Industrial</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="Min Budget"
                    type="number"
                    placeholder="Min"
                    value={minBudget}
                    onChange={(e) => setMinBudget(e.target.value)}
                  />
                  <Input
                    label="Max Budget"
                    type="number"
                    placeholder="Max"
                    value={maxBudget}
                    onChange={(e) => setMaxBudget(e.target.value)}
                  />
                </div>

                {/* Match Specialties check */}
                <div
                  onClick={() => setMatchingOnly(!matchingOnly)}
                  className={`flex items-center gap-3 p-3.5 border rounded-xl cursor-pointer select-none transition-all duration-200 mt-2 ${
                    matchingOnly
                      ? 'bg-purple-600/10 border-purple-500 text-purple-300'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={matchingOnly}
                    readOnly
                    className="w-4 h-4 rounded text-purple-600 bg-slate-950 border-slate-800"
                  />
                  <span className="text-xs font-semibold">Specialties Matches Only</span>
                </div>

                <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-slate-800/40">
                  <Button type="submit" variant="primary" className="w-full">
                    Apply Filters
                  </Button>
                  <Button
                    type="button"
                    onClick={handleResetFilters}
                    variant="outline"
                    className="w-full"
                  >
                    Reset All
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* LISTINGS BOARD */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          {projects.length === 0 ? (
            <Card className="py-12 border-dashed border-slate-800">
              <CardContent className="flex flex-col items-center gap-4 text-center">
                <div className="p-4 bg-slate-900 rounded-2xl text-slate-500">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">No Matching Packages Found</h3>
                  <p className="text-xs text-slate-500 max-w-sm mt-1.5 leading-relaxed">
                    Try adjusting search keywords, expanding location parameters, or toggling matching filter checkmarks.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            projects.map((proj) => (
              <Card key={proj.id} className="relative overflow-hidden">
                {/* Decorative border top line */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-indigo-600 to-sky-500" />
                
                <CardHeader className="pb-3 border-b border-slate-800/40">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <CardTitle className="text-lg font-bold text-white hover:text-indigo-400 transition-colors cursor-pointer">
                        {proj.name}
                      </CardTitle>
                      <CardDescription className="text-xs mt-1">
                        Posted by <span className="font-semibold text-slate-300">{proj.builder_name}</span> (Trust: {Math.round(Number(proj.builder_trust_score))}% verified) &bull; Location: {proj.location}
                      </CardDescription>
                    </div>
                    <Badge variant="glass" size="md" className="border-indigo-500/20 text-indigo-300">
                      {proj.property_type || 'General'}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-4 flex flex-col gap-4">
                  <p className="text-xs text-slate-400 leading-relaxed">{proj.description}</p>
                  
                  <div className="flex flex-col gap-3 mt-2">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Available Work Packages ({proj.packages.length})</span>
                    
                    <div className="flex flex-col gap-3">
                      {proj.packages.map((pkg) => (
                        <div key={pkg.id} className="p-4 bg-slate-950/40 border border-slate-900 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-colors hover:border-slate-800/80">
                          <div className="flex-1">
                            <h4 className="font-bold text-sm text-slate-200">{pkg.name}</h4>
                            <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">{pkg.description}</p>
                            
                            {/* Skills tags */}
                            {pkg.skills && pkg.skills.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2.5">
                                {pkg.skills.map((skill, sIdx) => (
                                  <Badge key={sIdx} variant="neutral" size="sm" className="bg-slate-900 border-none text-slate-400">
                                    {skill}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                          
                          <div className="flex-shrink-0 text-right flex sm:flex-col items-end justify-between sm:justify-start gap-4 sm:gap-2 w-full sm:w-auto mt-2 sm:mt-0 border-t sm:border-none border-slate-800/40 pt-2 sm:pt-0">
                            <div>
                              <span className="text-xs text-slate-500 block">Package Budget</span>
                              <span className="font-extrabold text-purple-400 text-sm">₹{Number(pkg.budget).toLocaleString('en-IN')}</span>
                            </div>
                            <Button
                              onClick={() => router.push(`/contractor/discovery/${pkg.id}`)}
                              variant="primary"
                              size="sm"
                              className="mt-1"
                            >
                              Bid on Package
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ContractorDiscoveryPage;
