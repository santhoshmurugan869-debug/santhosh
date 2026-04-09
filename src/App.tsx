import { useState, useEffect } from "react";
import { 
  Book, 
  Code, 
  FileText, 
  Github, 
  Layout, 
  Loader2, 
  Play, 
  Search, 
  Zap,
  ChevronRight,
  Info,
  Layers,
  Terminal,
  FileCode,
  Copy,
  Check,
  Sparkles,
  Cpu,
  FileSearch,
  CheckCircle2
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { generateDocumentation, DocResult } from "./geminiService";
import Markdown from "./components/Markdown";

export default function App() {
  const [manualCode, setManualCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [currentStep, setCurrentStep] = useState(0);
  const [docResult, setDocResult] = useState<DocResult | null>(null);
  const [copied, setCopied] = useState(false);

  const steps = [
    { id: 1, label: "Analyzing Syntax", icon: <Code className="w-4 h-4" /> },
    { id: 2, label: "Mapping Logic Flow", icon: <Layers className="w-4 h-4" /> },
    { id: 3, label: "Deep Logic Analysis", icon: <FileSearch className="w-4 h-4" /> },
    { id: 4, label: "Finalizing Docs", icon: <Sparkles className="w-4 h-4" /> },
  ];

  useEffect(() => {
    let interval: any;
    if (isLoading) {
      setCurrentStep(0);
      interval = setInterval(() => {
        setCurrentStep(prev => (prev < steps.length - 1 ? prev + 1 : prev));
      }, 2500);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  const handleCopyDiagram = () => {
    if (docResult?.architectureDiagram) {
      // Extract the mermaid code from the markdown block if necessary
      const mermaidCode = docResult.architectureDiagram.replace(/```mermaid\n?|\n?```/g, '').trim();
      navigator.clipboard.writeText(mermaidCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleGenerate = async () => {
    if (!manualCode) return;
    
    setIsLoading(true);
    setDocResult(null);
    setStatus("Analyzing provided code...");
    
    try {
      const filesToAnalyze = [{ name: "sample-code.ts", content: manualCode }];

      setStatus("Generating comprehensive documentation...");
      const result = await generateDocumentation(filesToAnalyze);
      setDocResult(result);
      setStatus("");
    } catch (error: any) {
      console.error(error);
      const isRateLimit = error?.message?.includes("429") || 
                          error?.status === "RESOURCE_EXHAUSTED" ||
                          JSON.stringify(error).includes("429");
      
      if (isRateLimit) {
        setStatus("AI Engine is busy. Please wait a moment and try again.");
      } else {
        setStatus(`Error: ${error.message || "An unexpected error occurred"}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-slate-200 font-sans relative overflow-hidden">
      {/* Background Animation */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-[0.03] grayscale invert">
          <img 
            src="https://picsum.photos/seed/programming/1920/1080" 
            alt="Code Background" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="absolute top-0 left-0 w-full h-full bg-grid-white opacity-20" />
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px] animate-blob" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[120px] animate-blob animation-delay-2000" />
        <div className="absolute top-[30%] right-[10%] w-[30%] h-[30%] bg-indigo-600/10 rounded-full blur-[100px] animate-blob animation-delay-4000" />
      </div>

      {/* Header */}
      <header className="border-b border-white/10 bg-black/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 group cursor-pointer">
            <motion.div 
              className="bg-blue-600 p-1.5 rounded-lg shadow-lg shadow-blue-500/20"
              whileHover={{ 
                scale: 1.1, 
                rotate: [0, -10, 10, -10, 0],
                transition: { duration: 0.5 }
              }}
              animate={{
                y: [0, -2, 0],
              }}
              transition={{
                y: {
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }
              }}
            >
              <Book className="w-5 h-5 text-white" />
            </motion.div>
            <motion.h1 
              className="text-xl font-bold tracking-tight text-white"
              whileHover={{ x: 2 }}
            >
              DocGen <span className="text-blue-400">AI</span>
            </motion.h1>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="secondary" className="bg-blue-500/10 text-blue-400 border-blue-500/20">Prototype v1.0</Badge>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 relative z-10">
        {/* Input Section */}
        <section className="mb-12">
          <div className="max-w-2xl mx-auto text-center mb-8">
            <motion.h2 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="text-4xl font-bold mb-4 text-white tracking-tight"
            >
              Turn Code into Documentation
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
              className="text-slate-400 text-lg"
            >
              Paste your sample code below to generate comprehensive technical docs, logic flows, and interactive diagrams.
            </motion.p>
          </div>
          
          <Card className="max-w-3xl mx-auto shadow-2xl border-white/10 bg-slate-900/40 backdrop-blur-xl overflow-hidden">
            <CardHeader className="bg-white/5 border-b border-white/10 p-4">
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.4 }}
                className="flex items-center gap-2 text-sm font-medium text-slate-300"
              >
                <FileCode className="w-4 h-4 text-blue-400" />
                Paste Sample Code
              </motion.div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <textarea
                  placeholder="Paste your code here (e.g. a React component, an Express route, or a Python class)..."
                  className="w-full h-64 p-4 bg-black/40 border border-white/10 rounded-lg focus:ring-2 focus:ring-blue-500/50 focus:outline-none font-mono text-sm resize-none transition-all focus:bg-black/60 text-slate-200 placeholder:text-slate-600"
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                />
                <div className="flex justify-end items-center gap-4">
                  <Button 
                    className="h-12 px-8 bg-blue-600 hover:bg-blue-500 text-white transition-all shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 active:scale-95 border-none"
                    onClick={handleGenerate}
                    disabled={isLoading || !manualCode}
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <Zap className="w-4 h-4 mr-2" />
                    )}
                    Generate Documentation
                  </Button>
                </div>
              </div>

              <AnimatePresence>
                {isLoading && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-8 pt-6 border-t border-white/10"
                  >
                    <div className="flex flex-col items-center gap-6">
                      <div className="relative">
                        <div className="w-16 h-16 rounded-full border-4 border-white/5 border-t-blue-500 animate-spin" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Cpu className="w-6 h-6 text-blue-400 animate-pulse" />
                        </div>
                      </div>
                      
                      <div className="w-full max-w-md space-y-4">
                        <div className="flex justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider">
                          <span>Processing Pipeline</span>
                          <span>{Math.round(((currentStep + 1) / steps.length) * 100)}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                          <motion.div 
                            className="h-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                            initial={{ width: "0%" }}
                            animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                            transition={{ duration: 0.5 }}
                          />
                        </div>
                        
                        <div className="grid grid-cols-4 gap-2">
                          {steps.map((step, idx) => (
                            <div key={step.id} className="flex flex-col items-center gap-2">
                              <div className={`
                                w-8 h-8 rounded-full flex items-center justify-center transition-all duration-500
                                ${idx < currentStep ? 'bg-green-500/20 text-green-400' : 
                                  idx === currentStep ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 
                                  'bg-white/5 text-slate-600'}
                              `}>
                                {idx < currentStep ? <CheckCircle2 className="w-4 h-4" /> : step.icon}
                              </div>
                              <span className={`text-[10px] font-medium text-center leading-tight ${idx === currentStep ? 'text-blue-400' : 'text-slate-500'}`}>
                                {step.label}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <motion.p 
                        key={status}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-sm text-slate-400 italic"
                      >
                        {status || "Initializing AI engine..."}
                      </motion.p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </section>


        {/* Results Section */}
        <AnimatePresence mode="wait">
          {docResult ? (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 lg:grid-cols-4 gap-8"
            >
              {/* Sidebar Navigation */}
              <aside className="lg:col-span-1">
                <div className="sticky top-24 space-y-1">
                  <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 px-3">Documentation</h3>
                  <SidebarItem icon={<Info className="w-4 h-4" />} label="Overview" active />
                  <SidebarItem icon={<FileSearch className="w-4 h-4" />} label="Code Explanation" />
                  <SidebarItem icon={<Layers className="w-4 h-4" />} label="Flow Chart Explanation" />
                  
                  <Separator className="my-6 border-white/10" />
                  
                  <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 px-3">Files</h3>
                  <ScrollArea className="h-[300px]">
                    {docResult.fileExplanations.map((file, idx) => (
                      <div key={idx} className="px-3 py-2 text-sm hover:bg-white/5 rounded-md cursor-pointer transition-colors group">
                        <div className="flex items-center gap-2 text-slate-300 font-medium mb-0.5">
                          <FileText className="w-3 h-3 text-slate-500" />
                          {file.fileName}
                        </div>
                        <p className="text-[11px] text-slate-500 line-clamp-1">{file.explanation}</p>
                      </div>
                    ))}
                  </ScrollArea>
                </div>
              </aside>

              {/* Main Content */}
              <div className="lg:col-span-3">
                <Tabs defaultValue="overview" className="w-full">
                  <TabsList className="grid grid-cols-3 w-full mb-8 bg-white/5 border border-white/10 p-1 h-auto">
                    <TabsTrigger value="overview" className="py-2.5 data-[state=active]:bg-blue-500/10 data-[state=active]:text-blue-400 text-slate-400 transition-all duration-300">
                      <motion.span whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>Overview</motion.span>
                    </TabsTrigger>
                    <TabsTrigger value="codeExplanation" className="py-2.5 data-[state=active]:bg-blue-500/10 data-[state=active]:text-blue-400 text-slate-400 transition-all duration-300">
                      <motion.span whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>Code Explanation</motion.span>
                    </TabsTrigger>
                    <TabsTrigger value="flowChart" className="py-2.5 data-[state=active]:bg-blue-500/10 data-[state=active]:text-blue-400 text-slate-400 transition-all duration-300">
                      <motion.span whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>Flow Chart Explanation</motion.span>
                    </TabsTrigger>
                  </TabsList>

                  <Card className="border-white/10 shadow-2xl bg-slate-900/40 backdrop-blur-xl min-h-[600px]">
                    <CardContent className="p-8">
                      <TabsContent value="overview" className="mt-0">
                        <div className="prose prose-invert max-w-none">
                          <Markdown content={docResult.overview} />
                        </div>
                      </TabsContent>
                      <TabsContent value="codeExplanation" className="mt-0">
                        <div className="prose prose-invert max-w-none">
                          <Markdown content={docResult.codeExplanation} />
                        </div>
                      </TabsContent>
                      <TabsContent value="flowChart" className="mt-0">
                        <motion.div 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.5 }}
                          className="space-y-8"
                        >
                          <motion.section
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                          >
                            <div className="flex items-center justify-between mb-4">
                              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                <Layers className="w-5 h-5 text-blue-400" />
                                Logic Flow Diagram
                              </h3>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="h-8 gap-2 text-xs border-white/10 hover:bg-white/5 text-slate-300"
                                onClick={handleCopyDiagram}
                              >
                                {copied ? (
                                  <>
                                    <Check className="w-3.5 h-3.5 text-green-400" />
                                    Copied!
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3.5 h-3.5" />
                                    Copy Mermaid Code
                                  </>
                                )}
                              </Button>
                            </div>
                            <div className="bg-black/40 rounded-xl border border-white/10 p-6 shadow-inner">
                              <Markdown content={docResult.architectureDiagram} />
                            </div>
                          </motion.section>
                          
                          <Separator className="border-white/10" />
                          
                          <motion.section
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.4 }}
                          >
                            <div className="flex items-center gap-2 mb-4">
                              <Sparkles className="w-5 h-5 text-blue-400" />
                              <h3 className="text-lg font-semibold text-white">Flow Logic & Error Handling</h3>
                            </div>
                            <div className="prose prose-invert max-w-none">
                              <Markdown content={docResult.flowChartExplanation} />
                            </div>
                          </motion.section>
                        </motion.div>
                      </TabsContent>
                    </CardContent>
                  </Card>
                </Tabs>
              </div>
            </motion.div>
          ) : !isLoading && (
            <motion.div 
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-20 text-center"
            >
              <div className="bg-white/5 p-6 rounded-full mb-6 border border-white/10">
                <Code className="w-12 h-12 text-slate-700" />
              </div>
              <motion.h3 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-lg font-semibold text-white"
              >
                No Documentation Generated
              </motion.h3>
              <motion.p 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-slate-500 max-w-sm mt-2"
              >
                Paste your source code above to start the intelligent documentation process.
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

function SidebarItem({ icon, label, active = false }: { icon: React.ReactNode, label: string, active?: boolean }) {
  return (
    <motion.div 
      whileHover={{ x: 4, backgroundColor: "rgba(255, 255, 255, 0.05)" }}
      whileTap={{ scale: 0.98 }}
      className={`
        flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer
        ${active ? 'bg-blue-500/10 text-blue-400' : 'text-slate-500 hover:text-slate-200'}
      `}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {icon}
      </motion.div>
      <motion.span
        initial={{ opacity: 0, x: -5 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        {label}
      </motion.span>
      {active && (
        <motion.div
          initial={{ opacity: 0, x: -5 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <ChevronRight className="w-4 h-4 ml-auto" />
        </motion.div>
      )}
    </motion.div>
  );
}
