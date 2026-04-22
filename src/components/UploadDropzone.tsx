'use client';

import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { UploadCloud, Loader2 } from 'lucide-react';
import { useProjectStore } from '@/store/projectStore';
import { useRouter } from 'next/navigation';

export default function UploadDropzone() {
  const [isDragging, setIsDragging] = useState(false);
  const setActiveProject = useProjectStore((state) => state.setActiveProject);
  const [isProcessing, setIsProcessing] = useState(false);
  const router = useRouter();
  const [step, setStep] = useState('UPLOAD');
  
  // 1. Create a reference to our hidden file input
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const processFile = async (file: File) => {
    if (!file.name.endsWith('.txt')) {
      alert("For now, please upload a .txt file script to test the engine!");
      return;
    }

    setIsProcessing(true);

    try {
      const text = await file.text();

      const response = await fetch('/api/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scriptText: text }),
      });

      if (!response.ok) throw new Error("Network response was not ok");

      const parsedData = await response.json();
      
      // Save data and instantly teleport WITHOUT alerts
      setActiveProject(parsedData);
      router.push('/dashboard');

    } catch (error) {
      console.error("Error parsing file:", error);
      alert("Failed to process script.");
      setStep('UPLOAD');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  // 2. When the user clicks the box, trigger the hidden file input
  const handleClick = () => {
    if (!isProcessing) {
      fileInputRef.current?.click();
    }
  };

  // 3. Catch the file when they select it from their computer browser
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.6 }}>
      
      {/* Hidden File Input */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileSelect} 
        accept=".txt" 
        className="hidden" 
      />

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick} // Added click handler here
        className={`w-full p-16 text-center transition-all duration-500 ease-out border border-dashed rounded-none relative overflow-hidden
          ${isDragging ? 'border-[#E62B1E] bg-[#E62B1E]/5 scale-[1.02] shadow-[0_0_40px_rgba(230,43,30,0.15)]' : 'border-neutral-800 bg-neutral-950/50 hover:border-neutral-600 hover:bg-neutral-900'}
          ${isProcessing ? 'border-[#E62B1E] cursor-wait pointer-events-none' : 'cursor-pointer'}
        `}
      >
        <div className={`absolute inset-0 transition-opacity duration-500 pointer-events-none ${isProcessing ? 'opacity-100 animate-pulse' : 'opacity-0'}`}>
          <div className="absolute inset-0 bg-gradient-to-b from-[#E62B1E]/20 to-transparent" />
        </div>

        <div className="flex flex-col items-center space-y-6 relative z-10">
          <motion.div
            animate={isDragging || isProcessing ? { y: -10, scale: 1.1 } : { y: 0, scale: 1 }}
            className={`p-5 rounded-full transition-colors duration-300 ${isDragging || isProcessing ? 'bg-[#E62B1E]/20' : 'bg-black border border-neutral-800'}`}
          >
            {isProcessing ? (
              <Loader2 className="w-10 h-10 text-[#E62B1E] animate-spin" />
            ) : (
              <UploadCloud className={`w-10 h-10 transition-colors duration-300 ${isDragging ? 'text-[#E62B1E]' : 'text-neutral-500'}`} />
            )}
          </motion.div>

          <div>
            <h3 className={`text-2xl font-bold tracking-tight mb-2 transition-colors duration-300 ${isDragging || isProcessing ? 'text-white' : 'text-[#E62B1E]'}`}>
              {isProcessing ? 'Extracting Assets...' : isDragging ? 'Release to upload' : 'Engage Script Parser'}
            </h3>
            <p className="text-sm text-neutral-500 font-light">
              {isProcessing ? 'Do not close this window.' : 'Click to browse or drag & drop a .txt script here.'}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}