const fs = require('fs');
const files = [
  'src/components/ClaimModal.tsx',
  'src/components/PaymentSelectionModal.tsx',
  'src/components/ImageCropper.tsx',
  'src/components/EditListingModal.tsx',
  'src/components/ListingDetailModal.tsx'
];
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/bg-gold-gradient/g, 'btn-primary-cyan');
  content = content.replace(/text-\[#e5c158\]/g, 'text-cyan-400');
  content = content.replace(/bg-\[#e5c158\]/g, 'bg-cyan-400');
  content = content.replace(/border-\[#e5c158\]/g, 'border-cyan-400');
  content = content.replace(/accent-\[#e5c158\]/g, 'accent-cyan-400');
  content = content.replace(/rgba\(229,193,88/g, 'rgba(0,212,255');
  
  // Specific fix for non-button bg-gold-gradient that got replaced with btn-primary-cyan
  content = content.replace(/className="h-1 btn-primary-cyan/g, 'className="h-1 bg-cyan-gradient');
  content = content.replace(/className=\{`w-6 h-6 rounded-full flex items-center justify-center font-bold \$\{step === 1 \? "btn-primary-cyan text-slate-950"/g, 'className={`w-6 h-6 rounded-full flex items-center justify-center font-bold ${step === 1 ? "bg-cyan-gradient text-slate-950"');
  content = content.replace(/className=\{`w-6 h-6 rounded-full flex items-center justify-center font-bold \$\{step === 2 \? "btn-primary-cyan text-slate-950"/g, 'className={`w-6 h-6 rounded-full flex items-center justify-center font-bold ${step === 2 ? "bg-cyan-gradient text-slate-950"');
  content = content.replace(/className=\{`w-6 h-6 rounded-full flex items-center justify-center font-bold \$\{step === 3 \? "btn-primary-cyan text-slate-950"/g, 'className={`w-6 h-6 rounded-full flex items-center justify-center font-bold ${step === 3 ? "bg-cyan-gradient text-slate-950"');
  
  // Fix the "Most Popular" badge bg
  content = content.replace(/btn-primary-cyan text-slate-950 text-\[10px\]/g, 'bg-cyan-gradient text-slate-950 text-[10px]');
  
  // Fix the continue button in ClaimModal to have readable text
  content = content.replace(/btn-primary-cyan text-slate-950 font-bold/g, 'btn-primary-cyan font-bold');
  
  fs.writeFileSync(file, content);
  console.log('Fixed ' + file);
});
