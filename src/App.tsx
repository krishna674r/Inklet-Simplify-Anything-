import React, { useState, useRef } from "react";
import { UploadCloud, X, ArrowRight, FileText, AlertCircle, RefreshCw, Copy, Check } from "lucide-react";
import Markdown from "react-markdown";
import { motion, AnimatePresence } from "motion/react";
import { AnimatedBackground } from "./AnimatedBackground";
import { extractTextFromFile } from "./utils/fileParser";

const EXAMPLES = [
  {
    label: "Example: App Terms of Service",
    text: "By using this application, you agree to grant us a non-exclusive, worldwide, royalty-free, irrevocable, sub-licensable, perpetual license to use, display, edit, modify, reproduce, distribute, store, and prepare derivative works of your content. Furthermore, you agree to indemnify and hold harmless the company from any claims, damages, or expenses arising from your use of the service.",
  },
  {
    label: "Example: Lease Clause",
    text: "Tenant shall not make any alterations, additions, or improvements to the Premises without the prior written consent of Landlord, which consent may be withheld in Landlord's sole and absolute discretion. Any such alterations shall become the property of Landlord upon termination of this Lease, unless Landlord requests Tenant to remove them, in which case Tenant shall do so at its sole cost.",
  }
];

export default function App() {
  const [text, setText] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCopy = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text", err);
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    if (val.length <= 5000) {
      setText(val);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError("File exceeds 5MB limit. Please upload a smaller file.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const extractedText = await extractTextFromFile(file);
      if (!extractedText.trim()) {
        throw new Error("No readable text found in file.");
      }
      setText(extractedText.slice(0, 5000));
      setFileName(file.name);
    } catch (err: any) {
      setError(err.message || "Couldn't read that file. Try pasting the text instead.");
    } finally {
      setLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const clearFile = () => {
    setFileName(null);
    setText("");
  };

  const handleSubmit = async () => {
    if (!text.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to explain text.");
      
      setResult(data.result);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const startOver = () => {
    setResult(null);
    setText("");
    setFileName(null);
    setError(null);
  };

  return (
    <>
      <AnimatedBackground />
      <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12 md:py-0 relative">
        <nav className="hidden md:block absolute top-10 left-12">
          <div className="text-xl font-semibold tracking-tighter text-stone-800">inklet.</div>
        </nav>
        
        <div className="md:hidden w-full max-w-[640px] mb-8">
          <div className="text-xl font-semibold tracking-tighter text-stone-800">inklet.</div>
        </div>

        <main className="w-full max-w-[640px] space-y-8 relative z-10">
          <header className="space-y-4">
            <h1 className="text-4xl font-semibold tracking-tight text-stone-900">
              Paste anything confusing.<br/>
              Get it in <span className="serif-italic">plain English</span>.
            </h1>
            <p className="text-stone-500 text-lg leading-relaxed max-w-[540px]">
              Contracts, terms and conditions, dense articles, school policies — inklet breaks it down in seconds. No signup.
            </p>
          </header>

          <AnimatePresence mode="wait">
            {!result ? (
              <motion.div
                key="input"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                {/* Error Banner */}
                {error && (
                  <div className="bg-red-50 text-red-700 p-4 rounded-xl flex items-start gap-3 border border-red-100">
                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                    <p className="text-sm">{error}</p>
                  </div>
                )}

                {/* Upload & Text Area */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <label 
                      htmlFor="file-upload" 
                      className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-white border border-stone-200 rounded-full text-sm font-medium text-stone-600 hover:bg-stone-50 transition-colors shadow-sm"
                    >
                      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"></path></svg>
                      Upload a file (.txt, .pdf, .docx)
                    </label>
                    <span className="text-xs text-stone-400">Max 5MB</span>
                    <input 
                      id="file-upload" 
                      type="file" 
                      ref={fileInputRef}
                      className="hidden" 
                      accept=".txt,.pdf,.docx" 
                      onChange={handleFileUpload}
                    />
                  </div>

                  <div className="textarea-container bg-white border border-stone-200 rounded-2xl overflow-hidden transition-all duration-300">
                    {fileName && (
                      <div className="flex items-center justify-between bg-stone-50 px-5 py-3 border-b border-stone-100 text-sm font-medium">
                        <div className="flex items-center gap-2 text-stone-600">
                          <FileText className="w-4 h-4 text-stone-400" />
                          {fileName}
                        </div>
                        <button onClick={clearFile} className="p-1 hover:bg-stone-200 rounded-full transition-colors text-stone-500">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}

                    <textarea
                      value={text}
                      onChange={handleTextChange}
                      placeholder="Paste text here — a contract clause, terms of service, a confusing email..."
                      className="w-full h-48 p-5 text-stone-700 placeholder:text-stone-300 resize-none outline-none text-base leading-relaxed bg-transparent"
                    />

                    <div className="flex items-center justify-between px-5 py-4 bg-stone-50/50 border-t border-stone-100">
                      <span className="text-xs font-mono text-stone-400">{text.length} / 5000</span>
                      <button
                        onClick={handleSubmit}
                        disabled={!text.trim() || loading}
                        className="flex items-center gap-2 bg-stone-900 text-white px-6 py-2.5 rounded-xl font-medium text-sm hover:bg-stone-800 disabled:bg-stone-300 disabled:cursor-not-allowed transition-all active:scale-95 shadow-sm"
                      >
                        {loading ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            Explaining...
                          </>
                        ) : (
                          <>
                            Explain this &rarr;
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Examples */}
                  <div className="flex items-center gap-4 pt-2 flex-wrap">
                    <span className="text-xs font-semibold text-stone-400 uppercase tracking-widest shrink-0">Examples</span>
                    <div className="flex gap-2 flex-wrap">
                      {EXAMPLES.map((ex, i) => (
                        <button
                          key={i}
                          onClick={() => {
                            setText(ex.text);
                            setFileName(null);
                            setError(null);
                          }}
                          className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-600 rounded-lg text-xs font-medium transition-colors"
                        >
                          {ex.label.replace('Example: ', '')}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white border border-stone-200 rounded-3xl p-8 shadow-sm glass-card"
              >
                <div className="prose prose-stone max-w-none prose-headings:font-semibold prose-headings:tracking-tight prose-h2:text-xl prose-h2:mt-8 prose-h2:mb-4 prose-p:leading-relaxed first:prose-h2:mt-0 prose-li:my-1">
                  <Markdown>{result}</Markdown>
                </div>
                
                <div className="mt-12 pt-8 border-t border-stone-100 flex items-center justify-between">
                  <button
                    onClick={startOver}
                    className="flex items-center gap-2 text-sm font-medium text-stone-600 hover:text-stone-900 transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Start over
                  </button>
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-2 text-sm font-medium text-stone-600 hover:text-stone-900 transition-colors"
                  >
                    {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                    {copied ? "Copied!" : "Copy to clipboard"}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
        
        <footer className="hidden md:block absolute bottom-10 text-stone-400 text-xs tracking-wide">
          Designed for clarity. Powered by intelligence.
        </footer>
      </div>
    </>
  );
}
