"use client";

import React, { useState, useRef, useCallback } from "react";
import { adminAPI } from "@/services/api";

interface ImportResult {
    success: boolean;
    message: string;
    stats?: {
        totalRows: number;
        properties: number;
        owners: number;
        auctions: number;
        loans: number;
        errors: number;
    };
    errors?: string[];
}

const AdminDataImportPage: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [dragActive, setDragActive] = useState(false);
    const [importing, setImporting] = useState(false);
    const [result, setResult] = useState<ImportResult | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDrag = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const droppedFile = e.dataTransfer.files[0];
            if (isValidFile(droppedFile)) {
                setFile(droppedFile);
                setResult(null);
            }
        }
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            if (isValidFile(selectedFile)) {
                setFile(selectedFile);
                setResult(null);
            }
        }
    };

    const isValidFile = (file: File): boolean => {
        const validExtensions = ['.csv', '.xlsx', '.xls'];
        const extension = '.' + file.name.split('.').pop()?.toLowerCase();
        return validExtensions.includes(extension);
    };

    const handleImport = async () => {
        if (!file) return;

        setImporting(true);
        setResult(null);

        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await adminAPI.dataImport.import(formData);

            if (response.success && response.data) {
                setResult({
                    success: true,
                    message: response.data.message || 'Import completed successfully!',
                    stats: response.data.stats,
                    errors: response.data.errors
                });
            } else {
                setResult({
                    success: false,
                    message: response.error || 'Import failed'
                });
            }
        } catch (error: any) {
            setResult({
                success: false,
                message: error.message || 'Import failed'
            });
        } finally {
            setImporting(false);
        }
    };

    const downloadTemplate = async (target: string) => {
        window.open(adminAPI.dataImport.getTemplateUrl(target), '_blank');
    };

    return (
        <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8, color: '#0f172a' }}>
                Data Import
            </h1>
            <p style={{ color: '#64748b', marginBottom: 32 }}>
                Upload CSV or Excel files to import properties, owners, auctions, and loans
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                {/* Upload Section */}
                <div style={{
                    background: '#fff',
                    borderRadius: 12,
                    padding: 24,
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }}>
                    <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 20, color: '#0f172a' }}>
                        <i className="fa-solid fa-upload me-2" style={{ color: '#3b82f6' }}></i>
                        Upload File
                    </h2>

                    {/* Drag & Drop Zone */}
                    <div
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                        style={{
                            border: `2px dashed ${dragActive ? '#3b82f6' : '#e2e8f0'}`,
                            borderRadius: 8,
                            padding: 40,
                            textAlign: 'center',
                            cursor: 'pointer',
                            background: dragActive ? '#eff6ff' : '#f8fafc',
                            transition: 'all 0.2s'
                        }}
                    >
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".csv,.xlsx,.xls"
                            onChange={handleFileChange}
                            style={{ display: 'none' }}
                        />
                        <i className="fa-solid fa-cloud-arrow-up" style={{
                            fontSize: 48,
                            color: dragActive ? '#3b82f6' : '#94a3b8',
                            marginBottom: 16
                        }}></i>
                        <p style={{ color: '#374151', fontWeight: 500, marginBottom: 4 }}>
                            {file ? file.name : 'Drag & drop your file here'}
                        </p>
                        <p style={{ color: '#94a3b8', fontSize: 13 }}>
                            or click to browse • CSV, XLSX supported
                        </p>
                    </div>

                    {file && (
                        <div style={{
                            marginTop: 16,
                            padding: 12,
                            background: '#eff6ff',
                            borderRadius: 8,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <i className="fa-solid fa-file-csv" style={{ fontSize: 24, color: '#3b82f6' }}></i>
                                <div>
                                    <p style={{ fontWeight: 500, color: '#0f172a', margin: 0 }}>{file.name}</p>
                                    <p style={{ fontSize: 12, color: '#64748b', margin: 0 }}>
                                        {(file.size / 1024).toFixed(1)} KB
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={(e) => { e.stopPropagation(); setFile(null); setResult(null); }}
                                style={{
                                    background: 'transparent',
                                    border: 'none',
                                    color: '#ef4444',
                                    cursor: 'pointer',
                                    padding: 8
                                }}
                            >
                                <i className="fa-solid fa-times"></i>
                            </button>
                        </div>
                    )}

                    <button
                        onClick={handleImport}
                        disabled={!file || importing}
                        style={{
                            width: '100%',
                            marginTop: 20,
                            padding: '12px 20px',
                            background: file && !importing ? '#3b82f6' : '#94a3b8',
                            color: '#fff',
                            border: 'none',
                            borderRadius: 8,
                            fontSize: 15,
                            fontWeight: 600,
                            cursor: file && !importing ? 'pointer' : 'not-allowed',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 8
                        }}
                    >
                        {importing ? (
                            <>
                                <i className="fa-solid fa-spinner fa-spin"></i>
                                Importing...
                            </>
                        ) : (
                            <>
                                <i className="fa-solid fa-file-import"></i>
                                Import Data
                            </>
                        )}
                    </button>
                </div>

                {/* Templates & Results Section */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                    {/* Download Templates */}
                    <div style={{
                        background: '#fff',
                        borderRadius: 12,
                        padding: 24,
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                    }}>
                        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16, color: '#0f172a' }}>
                            <i className="fa-solid fa-download me-2" style={{ color: '#10b981' }}></i>
                            Download Templates
                        </h2>
                        <p style={{ color: '#64748b', fontSize: 13, marginBottom: 16 }}>
                            Download CSV templates with the correct column headers
                        </p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                            {['properties', 'owners', 'auctions', 'loans', 'violations', 'probates', 'evictions', 'divorces', 'taxLiens'].map(target => (
                                <button
                                    key={target}
                                    onClick={() => downloadTemplate(target)}
                                    style={{
                                        padding: '8px 16px',
                                        background: '#f1f5f9',
                                        border: 'none',
                                        borderRadius: 6,
                                        fontSize: 13,
                                        color: '#374151',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 6
                                    }}
                                >
                                    <i className="fa-solid fa-file-csv"></i>
                                    {target === 'taxLiens' ? 'Tax Liens' : target.charAt(0).toUpperCase() + target.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Import Result */}
                    {result && (
                        <div style={{
                            background: '#fff',
                            borderRadius: 12,
                            padding: 24,
                            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                            border: `2px solid ${result.success ? '#10b981' : '#ef4444'}`
                        }}>
                            <h2 style={{
                                fontSize: 18,
                                fontWeight: 600,
                                marginBottom: 16,
                                color: result.success ? '#10b981' : '#ef4444',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 8
                            }}>
                                <i className={`fa-solid ${result.success ? 'fa-check-circle' : 'fa-exclamation-circle'}`}></i>
                                {result.success ? 'Import Successful!' : 'Import Failed'}
                            </h2>

                            {result.stats && (
                                <div style={{ marginBottom: 16 }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
                                        <StatBox label="Total Rows" value={result.stats.totalRows} icon="fa-table" />
                                        <StatBox label="Properties" value={result.stats.properties} icon="fa-building" color="#3b82f6" />
                                        <StatBox label="Owners" value={result.stats.owners} icon="fa-users" color="#8b5cf6" />
                                        <StatBox label="Auctions" value={result.stats.auctions} icon="fa-gavel" color="#f59e0b" />
                                        <StatBox label="Loans" value={result.stats.loans} icon="fa-hand-holding-dollar" color="#10b981" />
                                        <StatBox label="Probates" value={result.stats.probates} icon="fa-balance-scale" color="#6366f1" />
                                        <StatBox label="Violations" value={result.stats.violations} icon="fa-triangle-exclamation" color="#dc2626" />
                                        <StatBox label="Evictions" value={result.stats.evictions} icon="fa-door-open" color="#ea580c" />
                                        <StatBox label="Divorces" value={result.stats.divorces} icon="fa-heart-broken" color="#ec4899" />
                                        <StatBox label="Tax Liens" value={result.stats.taxLiens} icon="fa-file-invoice-dollar" color="#10b981" />
                                        <StatBox label="Errors" value={result.stats.errors} icon="fa-circle-xmark" color="#ef4444" />
                                    </div>
                                </div>
                            )}

                            {result.errors && result.errors.length > 0 && (
                                <div style={{
                                    background: '#fef2f2',
                                    borderRadius: 8,
                                    padding: 12,
                                    maxHeight: 150,
                                    overflow: 'auto'
                                }}>
                                    <p style={{ fontWeight: 500, color: '#991b1b', marginBottom: 8 }}>Errors:</p>
                                    {result.errors.slice(0, 5).map((err, i) => (
                                        <p key={i} style={{ fontSize: 12, color: '#991b1b', margin: '4px 0' }}>{err}</p>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const StatBox: React.FC<{ label: string; value: number; icon: string; color?: string }> =
    ({ label, value, icon, color = '#64748b' }) => (
        <div style={{
            background: '#f8fafc',
            borderRadius: 8,
            padding: 12,
            display: 'flex',
            alignItems: 'center',
            gap: 12
        }}>
            <i className={`fa-solid ${icon}`} style={{ fontSize: 20, color }}></i>
            <div>
                <p style={{ fontSize: 18, fontWeight: 600, color: '#0f172a', margin: 0 }}>{value}</p>
                <p style={{ fontSize: 12, color: '#64748b', margin: 0 }}>{label}</p>
            </div>
        </div>
    );

export default AdminDataImportPage;
