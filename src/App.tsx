import { useAuth } from './hooks/useAuth';
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, 
  Mail, 
  Lock, 
  Phone, 
  Briefcase, 
  GraduationCap, 
  Upload, 
  CheckCircle2, 
  ArrowRight,
  ChevronDown,
  Globe,
  Loader2,
  Building
} from 'lucide-react';
import { SchoolDashboard } from './components/Dashboard';

// --- Types ---
type Specialization = 
  | 'الإيقاظ العلمي' 
  | 'اللغة العربية' 
  | 'الرياضيات' 
  | 'التربية التكنولوجية' 
  | 'التربية الفنية' 
  | 'التربية البدنية' 
  | 'اللغة الفرنسية' 
  | 'اللغة الإنجليزية';

interface FormData {
  fullName: string;
  email: string;
  phone: string;
  specialization: Specialization | '';
  experience: string;
  cv: File | null;
}

// --- Components ---

const Header = ({ onSwitch, user, logout, signInWithGoogle }: { 
  onSwitch: () => void, 
  user: any, 
  logout: () => void,
  signInWithGoogle: (role: 'teacher' | 'school') => void 
}) => (
  <nav className="w-full py-5 px-12 flex justify-between items-center border-b border-white/10 bg-brand-dark text-white sticky top-0 z-50 shadow-lg">
    <div className="flex items-center gap-3">
      <div className="w-9 h-9 bg-brand-blue rounded-lg flex items-center justify-center">
        <span className="text-white text-lg font-bold italic">P</span>
      </div>
      <span className="text-xl font-bold tracking-wide text-white">بيداغو <span className="opacity-80 font-normal text-base ml-1">Pedago</span></span>
    </div>
    <div className="hidden md:flex items-center gap-8">
      <button className="text-sm font-medium text-white/80 hover:text-white transition-colors">من نحن</button>
      <button 
        onClick={() => signInWithGoogle('school')}
        className="flex items-center gap-2 text-sm font-bold text-white/80 hover:text-white transition-colors"
      >
        <Building className="w-4 h-4" />
        بوابة المدارس
      </button>
      {user ? (
        <button 
          onClick={logout}
          className="px-6 py-2 rounded-md bg-white/10 text-white text-sm font-bold hover:bg-white/20 transition-all border border-white/10"
        >
          خروج
        </button>
      ) : (
        <button 
          onClick={() => signInWithGoogle('teacher')}
          className="px-6 py-2 rounded-md bg-brand-blue text-white text-sm font-bold hover:bg-blue-700 transition-all shadow-sm"
        >
          دخول المعلمين
        </button>
      )}
    </div>
  </nav>
);

const StepIndicator = ({ currentStep }: { currentStep: number }) => {
  const steps = [
    { id: 1, label: 'إنشاء الحساب' },
    { id: 2, label: 'التفاصيل الشخصية' },
    { id: 3, label: 'التفاصيل المهنية' }
  ];
  
  return (
    <div className="flex items-center justify-center gap-4 mb-8">
      {steps.map((step, idx) => (
        <React.Fragment key={step.id}>
          <div className="flex flex-col items-center gap-2">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all duration-500 font-bold ${
              currentStep >= step.id 
                ? 'bg-brand-blue border-brand-blue text-white shadow-md' 
                : 'border-slate-200 text-slate-400 bg-white'
            }`}>
              {currentStep > step.id ? <CheckCircle2 className="w-5 h-5" /> : step.id}
            </div>
            <span className={`text-[11px] font-bold ${currentStep >= step.id ? 'text-brand-dark' : 'text-slate-400'}`}>
              {step.label}
            </span>
          </div>
          {idx < steps.length - 1 && (
            <div className={`h-[2px] w-10 -mt-6 transition-all duration-700 ${currentStep > step.id ? 'bg-brand-blue' : 'bg-slate-200'}`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default function App() {
  const [view, setView] = useState<'teacher' | 'school'>('teacher');
  const { user, profile, loading: authLoading, signInWithGoogle, logout } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    email: '',
    phone: '',
    specialization: '',
    experience: '',
    cv: null
    
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-switch view based on profile role
  useEffect(() => {
    if (profile?.role === 'school') {
      setView('school');
    } else if (profile?.role === 'teacher') {
      setView('teacher');
    }
  }, [profile]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#f1f5f9] flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-brand-blue animate-spin" />
      </div>
    );
  }

  if (view === 'school' && profile?.role === 'school') {
    return <SchoolDashboard />;
  }

  const handleNext = () => setStep(s => s + 1);
  const handleBack = () => setStep(s => s - 1);

  const handleSubmit = async (e: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const { doc, setDoc, serverTimestamp } = await import('firebase/firestore');
      const { db, handleFirestoreError, OperationType } = await import('./lib/firebase');
      
      // Save profile
      await setDoc(doc(db, 'teachers', user.uid), {
        fullName: formData.fullName,
        email: user.email,
        phone: formData.phone,
        specialization: formData.specialization,
        yearsOfExperience: parseInt(formData.experience),
        cvUrl: "https://example.com/cv-placeholder.pdf", // Simulate upload
        createdAt: serverTimestamp()
      });
      
      setSuccess(true);
    } catch (error) {
      const { handleFirestoreError, OperationType } = await import('./lib/firebase');
      handleFirestoreError(error, OperationType.WRITE, 'teachers');
    } finally {
      setLoading(false);
    }
  };

  const specializations: Specialization[] = [
    'الإيقاظ العلمي', 
    'اللغة العربية', 
    'الرياضيات', 
    'التربية التكنولوجية', 
    'التربية الفنية', 
    'التربية البدنية', 
    'اللغة الفرنسية', 
    'اللغة الإنجليزية'
  ];

  if (success) {
    return (
      <div className="min-h-screen bg-[#f1f5f9] flex flex-col font-sans">
        <Header 
          onSwitch={() => setView('school')} 
          user={user} 
          logout={logout} 
          signInWithGoogle={signInWithGoogle} 
        />
        <div className="flex-1 flex items-center justify-center p-6 bg-brand-dark/10">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md w-full bg-white rounded-2xl p-12 shadow-2xl border border-slate-100 text-center"
          >
            <div className="w-16 h-16 bg-[#22c55e] text-white rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold shadow-lg shadow-green-200">
              ✓
            </div>
            <h1 className="text-2xl font-bold text-brand-dark mb-4 tracking-tight">تم إرسال طلبك بنجاح!</h1>
            <p className="text-slate-500 mb-10 leading-relaxed text-sm font-medium">
              شكراً لانضمامك إلى بيداغو. سيقوم فريق التوظيف لدينا بمراجعة ملفك الشخصي والتواصل معك في أقرب وقت ممكن.
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="w-full py-3.5 bg-brand-blue text-white rounded-md font-bold hover:bg-blue-700 transition-all flex items-center justify-center gap-2 group text-sm shadow-md shadow-blue-200"
            >
              العودة للرئيسية
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f1f5f9] flex flex-col font-sans selection:bg-blue-100 selection:text-blue-700">
      <Header 
        onSwitch={() => setView('school')} 
        user={user} 
        logout={logout} 
        signInWithGoogle={signInWithGoogle} 
      />

      <main className="flex-1 flex flex-col items-center px-4 py-12 md:py-20 relative overflow-hidden">
        {/* Background Decorative Elements */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-100/50 rounded-full blur-3xl -z-10 animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-slate-200/40 rounded-full blur-3xl -z-10" />

        <div className="max-w-4xl w-full text-center mb-10">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold text-brand-dark mb-5 tracking-tight"
          >
            بوابة انضمام الكفاءات التربوية
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-slate-500 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed"
          >
            انضم إلى أكبر شبكة توظيف تعليمية وابدأ مسيرتك المهنية مع نخبة من أفضل المؤسسات.
          </motion.p>
        </div>

        <div className="max-w-2xl w-full bg-white rounded-xl p-8 md:p-10 shadow-xl shadow-slate-200/50 border border-slate-200 relative">
          <StepIndicator currentStep={step} />

          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <h2 className="text-xl font-bold text-slate-800 border-r-4 border-brand-blue pr-3 mb-6">إنشاء الحساب</h2>
                
                <div className="space-y-4">
                  <button 
                    onClick={() => signInWithGoogle('teacher')}
                    className="w-full flex items-center justify-center gap-3 py-3 border border-slate-200 rounded-md hover:bg-slate-50 transition-all font-bold text-slate-600 text-sm"
                  >
                    <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 48 48'%3E%3Cpath fill='%23FFC107' d='M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z'/%3E%3Cpath fill='%23FF3D00' d='m6.306 14.691 6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z'/%3E%3Cpath fill='%234CAF50' d='M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z'/%3E%3Cpath fill='%231976D2' d='M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z'/%3E%3C/svg%3E" alt="Google" className="w-4.5 h-4.5" referrerPolicy="no-referrer" />
                    المتابعة باستخدام جوجل
                  </button>
                  <div className="flex items-center gap-4 py-2">
                    <div className="flex-1 h-px bg-slate-100" />
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">أو بالبريد الإلكتروني</span>
                    <div className="flex-1 h-px bg-slate-100" />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600 mr-1 block">البريد الإلكتروني</label>
                    <div className="relative group">
                      <Mail className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 group-focus-within:text-brand-blue transition-colors" />
                      <input 
                        type="email" 
                        placeholder="name@example.com"
                        className="w-full pr-11 pl-4 py-3 bg-white border border-slate-200 rounded-md focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/5 transition-all outline-none text-sm"
                        value={formData.email}
                        onChange={e => setFormData({...formData, email: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600 mr-1 block">كلمة المرور</label>
                    <div className="relative group">
                      <Lock className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 group-focus-within:text-brand-blue transition-colors" />
                      <input 
                        type="password" 
                        placeholder="••••••••"
                        className="w-full pr-11 pl-4 py-3 bg-white border border-slate-200 rounded-md focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/5 transition-all outline-none text-sm"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-6">
                  <button 
                    onClick={handleNext}
                    disabled={!formData.email}
                    className="w-full py-3.5 bg-brand-blue text-white rounded-md font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md flex items-center justify-center gap-2 text-sm"
                  >
                    إنشاء حساب
                    <ArrowRight className="w-4 h-4 -scale-x-100" />
                  </button>
                  <p className="text-[10px] text-slate-400 mt-4 text-center">
                    بإنشائك للحساب، أنت توافق على <a href="#" className="underline">شروط الخدمة</a> و<a href="#" className="underline">سياسة الخصوصية</a>.
                  </p>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <h2 className="text-xl font-bold text-slate-800 border-r-4 border-brand-blue pr-3 mb-6">التفاصيل الشخصية</h2>
                
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600 mr-1 block">الاسم واللقب</label>
                    <div className="relative group">
                      <User className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 group-focus-within:text-brand-blue transition-colors" />
                      <input 
                        type="text" 
                        placeholder="أحمد بن علي"
                        className="w-full pr-11 pl-4 py-3 bg-white border border-slate-200 rounded-md focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/5 transition-all outline-none text-sm"
                        value={formData.fullName}
                        onChange={e => setFormData({...formData, fullName: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600 mr-1 block">رقم الهاتف</label>
                    <div className="relative group">
                      <Phone className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 group-focus-within:text-brand-blue transition-colors" />
                      <input 
                        type="tel" 
                        placeholder="216+ -- --- ---"
                        className="w-full pr-11 pl-4 py-3 bg-white border border-slate-200 rounded-md focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/5 transition-all outline-none text-sm text-left"
                        dir="ltr"
                        value={formData.phone}
                        onChange={e => setFormData({...formData, phone: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600 mr-1 block">التخصص</label>
                    <div className="relative group">
                      <GraduationCap className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 group-focus-within:text-brand-blue transition-colors" />
                      <select 
                        className="w-full pr-11 pl-4 py-3 bg-white border border-slate-200 rounded-md focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/5 transition-all outline-none appearance-none cursor-pointer text-sm"
                        value={formData.specialization}
                        onChange={e => setFormData({...formData, specialization: e.target.value as Specialization})}
                      >
                        <option value="" disabled>اختر التخصص</option>
                        {specializations.map(spec => (
                          <option key={spec} value={spec}>{spec}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                </div>

                <div className="pt-6 flex gap-4">
                  <button 
                    onClick={handleBack}
                    className="flex-1 py-3 bg-slate-50 text-slate-600 border border-slate-200 rounded-md font-bold hover:bg-slate-100 transition-all text-sm"
                  >
                    رجوع
                  </button>
                  <button 
                    onClick={handleNext}
                    disabled={!formData.fullName || !formData.phone || !formData.specialization}
                    className="flex-[2] py-3 bg-brand-blue text-white rounded-md font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md text-sm"
                  >
                    متابعة
                  </button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <h2 className="text-xl font-bold text-slate-800 border-r-4 border-brand-blue pr-3 mb-6">التفاصيل المهنية</h2>
                
                <div className="space-y-6">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600 mr-1 block">سنوات الخبرة</label>
                    <div className="relative group">
                      <Briefcase className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 group-focus-within:text-brand-blue transition-colors" />
                      <input 
                        type="number" 
                        min="0"
                        placeholder="0"
                        className="w-full pr-11 pl-4 py-3 bg-white border border-slate-200 rounded-md focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/5 transition-all outline-none text-sm"
                        value={formData.experience}
                        onChange={e => setFormData({...formData, experience: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600 mr-1 block">رفع السيرة الذاتية (CV)</label>
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className={`relative w-full p-8 border-2 border-dashed rounded-lg flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${
                        formData.cv 
                          ? 'bg-blue-50/50 border-brand-blue/30' 
                          : 'bg-slate-50/50 border-slate-200 hover:bg-slate-50 hover:border-brand-blue/30'
                      }`}
                    >
                      <input 
                        type="file" 
                        ref={fileInputRef}
                        className="hidden" 
                        accept=".pdf,.doc,.docx"
                        onChange={e => setFormData({...formData, cv: e.target.files?.[0] || null})}
                      />
                      {formData.cv ? (
                        <>
                          <div className="w-10 h-10 bg-brand-blue/10 text-brand-blue rounded-full flex items-center justify-center">
                            <CheckCircle2 className="w-5 h-5" />
                          </div>
                          <span className="text-xs font-bold text-brand-blue">{formData.cv.name}</span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-7 h-7 text-slate-400" />
                          <span className="text-sm font-medium text-slate-500">قم بسحب الملف هنا أو انقر للاختيار</span>
                          <span className="text-[10px] text-slate-400">PDF, DOCX (بحد أقصى 5MB)</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="pt-6 flex gap-4">
                  <button 
                    onClick={handleBack}
                    className="flex-1 py-3 bg-slate-50 text-slate-600 border border-slate-200 rounded-md font-bold hover:bg-slate-100 transition-all text-sm"
                  >
                    رجوع
                  </button>
                  <button 
                    onClick={handleSubmit}
                    disabled={loading || !formData.experience || !formData.cv}
                    className="flex-[2] py-3 bg-brand-blue text-white rounded-md font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md flex items-center justify-center gap-2 text-sm"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        جاري المعالجة...
                      </>
                    ) : (
                      'إرسال طلب التسجيل'
                    )}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer info */}
        <div className="mt-12 text-slate-400 text-sm flex items-center gap-4">
          <div className="flex items-center gap-1">
            <Globe className="w-4 h-4" />
            تونس
          </div>
          <span className="text-slate-200">|</span>
          <a href="#" className="hover:text-slate-600 transition-colors">اتفاقية الخدمة</a>
          <span className="text-slate-200">|</span>
          <a href="#" className="hover:text-slate-600 transition-colors">سياسة الخصوصية</a>
        </div>
      </main>
    </div>
  );
}
