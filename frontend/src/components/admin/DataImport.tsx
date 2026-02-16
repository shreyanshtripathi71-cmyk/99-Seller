"use client";

import React, { useState, useRef } from "react";
import { adminAPI } from "@/services/api";

interface ImportResult {
  success: boolean;
  message: string;
  stats: {
    totalRows: number;
    properties: number;
    owners: number;
    auctions: number;
    loans: number;
    errors: number;
  };
  errors: string[];
}

const DataImport = () => {
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState<string[][] | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (selectedFile: File) => {
    if (!selectedFile.name.endsWith(".csv") && selectedFile.type !== "text/csv") {
      alert("Please upload a CSV file");
      return;
    }
    
    setFile(selectedFile);
    setResult(null);
    parsePreview(selectedFile);
  };

  const parsePreview = async (file: File) => {
    try {
      const text = await file.text();
      const lines = text.split("\n").slice(0, 11); // Header + 10 rows
      const parsed = lines.map(line => 
        line.split(",").map(cell => cell.trim().replace(/^"|"$/g, ""))
      );
      setPreview(parsed);
    } catch (error) {
      console.error("Preview error:", error);
    }
  };

  const handleImport = async () => {
    if (!file) {
      alert("Please select a file first");
      return;
    }

    setImporting(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await adminAPI.dataImport.import(formData);

      if (response.success) {
        setResult(response.data);
        alert("Data imported successfully!");
      } else {
        alert(response.error || "Import failed");
        setResult({
          success: false,
          message: response.error || "Import failed",
          stats: { totalRows: 0, properties: 0, owners: 0, auctions: 0, loans: 0, errors: 0 },
          errors: [response.error || "Unknown error"],
        });
      }
    } catch (error) {
      console.error("Import error:", error);
      alert("An error occurred during import");
      setResult({
        success: false,
        message: "Connection error",
        stats: { totalRows: 0, properties: 0, owners: 0, auctions: 0, loans: 0, errors: 0 },
        errors: ["Connection error. Please try again."],
      });
    } finally {
      setImporting(false);
    }
  };

  const resetForm = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div style={{ padding: 32, backgroundColor: "#f8fafc", minHeight: "100vh" }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: "#0f172a", margin: 0 }}>
          Data Import
        </h1>
        <p style={{ color: "#64748b", marginTop: 4 }}>
          Upload your daily CSV file containing all property, auction, owner, and loan data
        </p>
      </div>

      {/* Info Card */}
      <div style={{
        background: "#dbeafe",
        border: "1px solid #3b82f6",
        borderRadius: 12,
        padding: 20,
        marginBottom: 24,
      }}>
        <div style={{ display: "flex", gap: 12, alignItems: "start" }}>
          <i className="fa-solid fa-circle-info" style={{ color: "#3b82f6", fontSize: 20, marginTop: 2 }}></i>
          <div>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: "#1e40af", marginBottom: 8 }}>
              How it works
            </h3>
            <ul style={{ margin: 0, paddingLeft: 20, color: "#1e40af" }}>
              <li>Upload a single CSV file containing all your data</li>
              <li>The system will automatically parse and categorize the data</li>
              <li>Properties, auctions, owners, and loans will be extracted</li>
              <li>Duplicate entries will be automatically handled</li>
              <li>You&apos;ll receive a detailed import report after processing</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Upload Section */}
      <div style={{
        background: "#fff",
        borderRadius: 16,
        padding: 32,
        boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
        marginBottom: 24,
      }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, color: "#0f172a", marginBottom: 20 }}>
          Upload CSV File
        </h2>

        {/* Drop Zone */}
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          style={{
            border: `2px dashed ${dragActive ? "#3b82f6" : "#cbd5e1"}`,
            borderRadius: 12,
            padding: 48,
            textAlign: "center",
            cursor: "pointer",
            background: dragActive ? "#eff6ff" : "#f8fafc",
            transition: "all 0.2s",
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,text/csv"
            onChange={handleFileChange}
            style={{ display: "none" }}
          />
          
          <i
            className="fa-solid fa-cloud-arrow-up"
            style={{ fontSize: 48, color: dragActive ? "#3b82f6" : "#94a3b8", marginBottom: 16 }}
          ></i>
          
          <div style={{ fontSize: 16, fontWeight: 600, color: "#0f172a", marginBottom: 8 }}>
            {file ? file.name : "Drop your CSV file here or click to browse"}
          </div>
          
          <div style={{ fontSize: 14, color: "#64748b" }}>
            {file 
              ? `File size: ${(file.size / 1024 / 1024).toFixed(2)} MB`
              : "Supports CSV files up to 50MB"
            }
          </div>

          {file && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                resetForm();
              }}
              style={{
                marginTop: 16,
                padding: "8px 16px",
                background: "#ef4444",
                color: "#fff",
                border: "none",
                borderRadius: 6,
                fontSize: 14,
                fontWeight: 500,
                cursor: "pointer",
              }}
            >
              <i className="fa-solid fa-xmark" style={{ marginRight: 8 }}></i>
              Remove File
            </button>
          )}
        </div>

        {/* Preview */}
        {preview && (
          <div style={{ marginTop: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: "#0f172a", marginBottom: 12 }}>
              Preview (First 10 rows)
            </h3>
            <div style={{
              border: "1px solid #e2e8f0",
              borderRadius: 8,
              overflow: "auto",
              maxHeight: 400,
            }}>
              <table style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: 13,
              }}>
                <thead style={{ background: "#f8fafc", position: "sticky", top: 0 }}>
                  <tr>
                    {preview[0]?.map((header, idx) => (
                      <th
                        key={idx}
                        style={{
                          padding: "12px 16px",
                          textAlign: "left",
                          borderBottom: "2px solid #e2e8f0",
                          fontWeight: 600,
                          color: "#0f172a",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {header || `Column ${idx + 1}`}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {preview.slice(1).map((row, rowIdx) => (
                    <tr key={rowIdx}>
                      {row.map((cell, cellIdx) => (
                        <td
                          key={cellIdx}
                          style={{
                            padding: "12px 16px",
                            borderBottom: "1px solid #f1f5f9",
                            color: "#64748b",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {cell || "-"}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Import Button */}
        {file && (
          <button
            onClick={handleImport}
            disabled={importing}
            style={{
              marginTop: 24,
              width: "100%",
              padding: "16px",
              background: importing
                ? "#94a3b8"
                : "linear-gradient(135deg, #3b82f6, #2563eb)",
              color: "#fff",
              border: "none",
              borderRadius: 10,
              fontSize: 16,
              fontWeight: 600,
              cursor: importing ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 12,
            }}
          >
            {importing ? (
              <>
                <i className="fa-solid fa-spinner fa-spin"></i>
                Processing Import...
              </>
            ) : (
              <>
                <i className="fa-solid fa-file-import"></i>
                Import Data
              </>
            )}
          </button>
        )}
      </div>

      {/* Results */}
      {result && (
        <div style={{
          background: "#fff",
          borderRadius: 16,
          padding: 32,
          boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
            <i
              className={`fa-solid ${result.success ? "fa-circle-check" : "fa-circle-xmark"}`}
              style={{ fontSize: 32, color: result.success ? "#10b981" : "#ef4444" }}
            ></i>
            <div>
              <h2 style={{ fontSize: 20, fontWeight: 600, color: "#0f172a", margin: 0 }}>
                {result.success ? "Import Successful" : "Import Failed"}
              </h2>
              <p style={{ color: "#64748b", margin: 0 }}>{result.message}</p>
            </div>
          </div>

          {/* Stats Grid */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
            gap: 16,
            marginBottom: 24,
          }}>
            {[
              { label: "Total Rows", value: result.stats.totalRows, icon: "fa-table", color: "#3b82f6" },
              { label: "Properties", value: result.stats.properties, icon: "fa-building", color: "#10b981" },
              { label: "Owners", value: result.stats.owners, icon: "fa-user-tie", color: "#f59e0b" },
              { label: "Auctions", value: result.stats.auctions, icon: "fa-gavel", color: "#8b5cf6" },
              { label: "Loans", value: result.stats.loans, icon: "fa-money-bill", color: "#06b6d4" },
              { label: "Errors", value: result.stats.errors, icon: "fa-exclamation-triangle", color: "#ef4444" },
            ].map((stat) => (
              <div
                key={stat.label}
                style={{
                  background: "#f8fafc",
                  borderRadius: 12,
                  padding: 16,
                  textAlign: "center",
                }}
              >
                <i
                  className={`fa-solid ${stat.icon}`}
                  style={{ fontSize: 24, color: stat.color, marginBottom: 8 }}
                ></i>
                <div style={{ fontSize: 24, fontWeight: 700, color: "#0f172a" }}>
                  {stat.value.toLocaleString()}
                </div>
                <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

          {/* Errors */}
          {result.errors && result.errors.length > 0 && (
            <div style={{
              background: "#fef2f2",
              border: "1px solid #ef4444",
              borderRadius: 12,
              padding: 20,
            }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, color: "#991b1b", marginBottom: 12 }}>
                Errors Encountered:
              </h3>
              <ul style={{ margin: 0, paddingLeft: 20, color: "#991b1b" }}>
                {result.errors.map((error, idx) => (
                  <li key={idx} style={{ marginBottom: 4 }}>
                    {error}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DataImport;
