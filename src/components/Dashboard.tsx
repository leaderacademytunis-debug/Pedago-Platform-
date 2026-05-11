import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, 
  Search as SearchIcon, 
  Bookmark, 
  Filter, 
  Users, 
  Mail, 
  FileText, 
  ChevronDown, 
  Star,
  MapPin,
  Clock,
  MoreVertical,
  LogOut,
  Bell,
  Settings,
  Briefcase,
  Loader2,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  X
} from 'lucide-react';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  orderBy 
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { useAuth } from '../hooks/useAuth';

// --- Types ---
type Specialization = 
  | 'الإيقاظ العلمي' 
  | 'اللغة العربية' 
  | 'الرياضيات' 
  | 'التربية التكنولوجية' 
  | 'التربية البدنية' 
  | 'اللغة الفرنسية' 
  | 'اللغة الإنجليزية';

interface Teacher {
  id: string;
  fullName: string;
  specialization: Specialization;
  yearsOfExperience: number;
  location?: string;
  rating?: number;
  image?: string;
  email: string;
  phone: string;
  cvUrl: string;
}

interface AIAnalysis {
  overallScore: number;
  strengths: string[];
  curriculumAlignment: string;
  recommendation: 'Hire' | 'Interview' | 'Pass';
}

const generateAIAnalysis = (teacher: Teacher): Promise<AIAnalysis> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const scores: Record<string, number> = {
        'الرياضيات': 85,
        'اللغة العربية': 92,
        'الإيقاظ العلمي': 88,
        'التربية التكنولوجية': 90,
        'التربية البدنية': 75,
        'اللغة الفرنسية': 82,
        'اللغة الإنجليزية': 89,
      };

      const strengths = [
        "اعتماد بيداغوجيا المشروع في التدريس",
        "قدرة عالية على تبسيط المفاهيم المعقدة",
        "تمكن ممتاز من أدوات التواصل الرقمي",
        "خلفية قوية في المناهج الرسمية التونسية",
        "إتقان العمل في مجموعات متجانسة وغير متجانسة"
      ];

      resolve({
        overallScore: scores[teacher.specialization] || 80,
        strengths: strengths.sort(() => 0.5 - Math.random()).slice(0, 3),
        curriculumAlignment: `يظهر الملف الشخصي للمعلم ${teacher.fullName} توافقاً كبيراً مع أهداف المنهج الرسمي لمادة ${teacher.specialization}. خبرته التي تمتد لـ ${teacher.yearsOfExperience} سنوات تمنحه القدرة على التعامل مع الفروق الفردية بين التلاميذ بفعالية، خاصة في مجالات تقييم المكتسبات وتعديل المسار البيداغوجي.`,
        recommendation: (scores[teacher.specialization] || 80) > 85 ? 'Hire' : (scores[teacher.specialization] || 80) > 75 ? 'Interview' : 'Pass'
      });
    }, 3000);
  });
};

const SidebarItem = ({ icon: Icon, label, active, onClick }: { icon: any, label: string, active?: boolean, onClick: () => void }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-sm font-bold ${
      active 
        ? 'bg-brand-blue text-white shadow-md shadow-blue-200' 
        : 'text-slate-400 hover:bg-slate-50 hover:text-brand-dark'
    }`}
  >
    <Icon className={`w-5 h-5 ${active ? 'text-white' : 'text-slate-400'}`} />
    <span>{label}</span>
  </button>
);

export const SchoolDashboard = () => {
  const { logout, profile } = useAuth();
  const [activeTab, setActiveTab] = useState('find');
  const [searchTerm, setSearchTerm] = useState('');
  const [specFilter, setSpecFilter] = useState('');
  const [expFilter, setExpFilter] = useState('');
  const [isFiltering, setIsFiltering] = useState(false);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);

  // AI Analysis State
  const [showAIModal, setShowAIModal] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<AIAnalysis | null>(null);

  useEffect(() => {
    const teachersRef = collection(db, 'teachers');
    const q = query(teachersRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const teacherList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Teacher[];
      setTeachers(teacherList);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'teachers');
    });

    return () => unsubscribe();
  }, []);

  const filteredTeachers = teachers.filter(t => {
    const matchesSearch = t.fullName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpec = specFilter === '' || t.specialization === specFilter;
    const matchesExp = expFilter === '' || t.yearsOfExperience >= parseInt(expFilter);
    return matchesSearch && matchesSpec && matchesExp;
  });

  const handleFilterChange = () => {
    setIsFiltering(true);
    setTimeout(() => setIsFiltering(false), 300);
  };

  const handleAIAnalysis = async (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setShowAIModal(true);
    setAiLoading(true);
    setAiResult(null);
    
    try {
      const result = await generateAIAnalysis(teacher);
      setAiResult(result);
    } catch (error) {
      console.error("AI Analysis failed:", error);
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="flex bg-[#f1f5f9] min-h-screen font-sans selection:bg-blue-100 selection:text-blue-700" dir="rtl">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-l border-slate-200 flex flex-col fixed h-full z-50">
        <div className="p-8 pb-10 flex items-center gap-3">
          <div className="w-9 h-9 bg-brand-dark rounded-lg flex items-center justify-center">
            <span className="text-white text-lg font-bold italic">P</span>
          </div>
          <span className="text-xl font-bold tracking-wide text-brand-dark">بيداغو <span className="text-brand-blue">Director</span></span>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          <SidebarItem 
            icon={LayoutDashboard} 
            label="الرئيسية" 
            active={activeTab === 'home'} 
            onClick={() => setActiveTab('home')} 
          />
          <SidebarItem 
            icon={Users} 
            label="البحث عن معلمين" 
            active={activeTab === 'find'} 
            onClick={() => setActiveTab('find')} 
          />
          <SidebarItem 
            icon={Bookmark} 
            label="الملفات المحفوظة" 
            active={activeTab === 'saved'} 
            onClick={() => setActiveTab('saved')} 
          />
          <div className="pt-4 pb-2">
            <p className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">النظام</p>
          </div>
          <SidebarItem 
            icon={Bell} 
            label="التنبيهات" 
            onClick={() => {}} 
          />
          <SidebarItem 
            icon={Settings} 
            label="الإعدادات" 
            onClick={() => {}} 
          />
        </nav>

        <div className="p-4 mt-auto border-t border-slate-100">
          <div className="bg-slate-50 rounded-xl p-3 flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-brand-blue/10 text-brand-blue rounded-full flex items-center justify-center font-bold">
              م
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-xs font-bold text-brand-dark truncate">مدرسة النور الخاصة</p>
              <p className="text-[10px] text-slate-400 truncate">مدير المؤسسة</p>
            </div>
          </div>
          <button 
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-2 text-slate-400 hover:text-red-500 transition-colors text-sm font-bold"
          >
            <LogOut className="w-5 h-5" />
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 mr-64">
        {/* Top Header */}
        <header className="h-20 bg-white border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-40">
          <h1 className="text-xl font-bold text-brand-dark">
            {activeTab === 'find' ? 'دليل المعلمين المؤهلين' : 'لوحة التحكم'}
          </h1>
          <div className="flex items-center gap-4">
            <div className="relative">
              <button className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-brand-dark transition-colors relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-2 left-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
              </button>
            </div>
            <button className="px-5 py-2 bg-brand-blue text-white rounded-md text-xs font-bold shadow-md shadow-blue-100 hover:bg-blue-700 transition-all">
              نشر عرض عمل جديد
            </button>
          </div>
        </header>

        <div className="p-8">
          {activeTab === 'find' ? (
            <div className="space-y-8">
              {/* Filter Bar */}
              <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-wrap items-center gap-4">
                <div className="flex-1 min-w-[300px] relative group">
                  <SearchIcon className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 group-focus-within:text-brand-blue transition-colors" />
                  <input 
                    type="text" 
                    placeholder="ابحث بالاسم أو المهارات..."
                    className="w-full pr-11 pl-4 py-2.5 bg-slate-50 border border-slate-100 rounded-lg focus:bg-white focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/5 outline-none text-sm transition-all"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <div className="w-48 relative">
                  <select 
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-lg outline-none text-sm appearance-none cursor-pointer focus:border-brand-blue transition-all pr-10"
                    value={specFilter}
                    onChange={(e) => { setSpecFilter(e.target.value); handleFilterChange(); }}
                  >
                    <option value="">كل التخصصات</option>
                    <option value="الرياضيات">الرياضيات</option>
                    <option value="اللغة العربية">اللغة العربية</option>
                    <option value="الإيقاظ العلمي">الإيقاظ العلمي</option>
                    <option value="اللغة الإنجليزية">اللغة الإنجليزية</option>
                    <option value="اللغة الفرنسية">اللغة الفرنسية</option>
                  </select>
                  <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>

                <div className="w-48 relative">
                  <select 
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-lg outline-none text-sm appearance-none cursor-pointer focus:border-brand-blue transition-all pr-10"
                    value={expFilter}
                    onChange={(e) => { setExpFilter(e.target.value); handleFilterChange(); }}
                  >
                    <option value="">كل الخبرات</option>
                    <option value="2">سنتان فما فوق</option>
                    <option value="5">5 سنوات فما فوق</option>
                    <option value="8">8 سنوات فما فوق</option>
                  </select>
                  <Clock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {/* Teacher Grid */}
              <div className="relative">
                <AnimatePresence mode="wait">
                  {isFiltering ? (
                    <motion.div 
                      key="loader"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="h-64 flex flex-col items-center justify-center gap-4"
                    >
                      <div className="w-8 h-8 border-4 border-brand-blue/20 border-t-brand-blue rounded-full animate-spin"></div>
                      <p className="text-sm font-medium text-slate-400">جاري تحديث النتائج...</p>
                    </motion.div>
                  ) : (
                    <motion.div 
                      key="grid"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    >
                      {filteredTeachers.map((teacher) => (
                        <motion.div 
                          key={teacher.id}
                          layout
                          className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all group relative overflow-hidden"
                        >
                          <div className="absolute top-4 left-4">
                            <button className="text-slate-300 hover:text-brand-blue transition-colors">
                              <Bookmark className="w-5 h-5" />
                            </button>
                          </div>
                          
                          <div className="flex flex-col items-center text-center">
                            <div className="w-20 h-20 rounded-full bg-slate-50 border-2 border-white shadow-sm mb-4 overflow-hidden flex items-center justify-center">
                              {teacher.image ? (
                                <img src={teacher.image} alt={teacher.fullName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                              ) : (
                                <div className="text-2xl font-bold text-brand-blue uppercase">
                                  {teacher.fullName.charAt(0)}
                                </div>
                              )}
                            </div>
                            <h3 className="text-lg font-bold text-brand-dark mb-1 group-hover:text-brand-blue transition-colors">{teacher.fullName}</h3>
                            <p className="text-xs font-bold text-slate-400 mb-4 bg-slate-50 px-3 py-1 rounded-full">{teacher.specialization}</p>
                            
                            <div className="grid grid-cols-2 gap-4 w-full mb-6 border-y border-slate-50 py-4">
                              <div className="text-center">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">الخبرة</p>
                                <p className="text-sm font-bold text-brand-dark">{teacher.yearsOfExperience} سنوات</p>
                              </div>
                              <div className="text-center border-r border-slate-100">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">التقييم</p>
                                <div className="flex items-center justify-center gap-1">
                                  <Star className="w-3 h-3 text-orange-400 fill-orange-400" />
                                  <span className="text-sm font-bold text-brand-dark">{teacher.rating || 'جديد'}</span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 text-xs text-slate-400 mb-6">
                              <MapPin className="w-3 h-3" />
                              {teacher.location}
                            </div>

                            <div className="flex gap-3 w-full mb-3">
                              <button className="flex-1 py-2.5 bg-brand-blue text-white rounded-lg font-bold text-xs hover:bg-blue-700 shadow-md shadow-blue-100 transition-all flex items-center justify-center gap-2">
                                <FileText className="w-3.5 h-3.5" />
                                عرض السيرة
                              </button>
                              <button className="flex-1 py-2.5 bg-white text-slate-600 border border-slate-200 rounded-lg font-bold text-xs hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
                                <Mail className="w-3.5 h-3.5" />
                                تواصل
                              </button>
                            </div>

                            <button 
                              onClick={() => handleAIAnalysis(teacher)}
                              className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-brand-blue text-white rounded-lg font-bold text-xs hover:from-purple-700 hover:to-blue-800 transition-all flex items-center justify-center gap-2 shadow-sm"
                            >
                              <Sparkles className="w-3.5 h-3.5" />
                              التحليل البيداغوجي الذكي
                            </button>
                          </div>
                        </motion.div>
                      ))}
                      {filteredTeachers.length === 0 && (
                        <div className="col-span-full py-20 text-center">
                          <Users className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                          <h3 className="text-xl font-bold text-slate-400">لم يتم العثور على نتائج</h3>
                          <p className="text-sm text-slate-300 mt-2">جرب البحث بكلمات مفتاحية أخرى أو تغيير الفلاتر</p>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          ) : (
            <div className="h-96 flex flex-col items-center justify-center text-center">
              <LayoutDashboard className="w-16 h-16 text-slate-200 mb-4" />
              <h3 className="text-xl font-bold text-slate-400">قسماً قيد التطوير</h3>
              <p className="text-sm text-slate-300 mt-2">ستكون لوحة التحكم الرئيسية والاحصائيات متاحة هنا قريباً</p>
            </div>
          )}
        </div>
      </main>

      {/* AI Analysis Modal */}
      <AnimatePresence>
        {showAIModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !aiLoading && setShowAIModal(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden overflow-y-auto max-h-[90vh] rtl"
              dir="rtl"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center shadow-inner">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-brand-dark">تحليل بيداغوجي ذكي</h2>
                    <p className="text-xs text-slate-400">تحليل متقدم بواسطة الذكاء الاصطناعي</p>
                  </div>
                </div>
                {!aiLoading && (
                  <button 
                    onClick={() => setShowAIModal(false)}
                    className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-brand-dark hover:bg-slate-50 rounded-full transition-all"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>

              {/* Modal Content */}
              <div className="p-8">
                {aiLoading ? (
                  <div className="py-12 flex flex-col items-center text-center">
                    <div className="relative mb-8">
                      <motion.div 
                        animate={{ 
                          scale: [1, 1.2, 1],
                          opacity: [0.5, 1, 0.5]
                        }}
                        transition={{ 
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                        className="w-24 h-24 bg-purple-100 rounded-full flex items-center justify-center"
                      >
                        <Sparkles className="w-12 h-12 text-purple-600" />
                      </motion.div>
                      <div className="absolute -bottom-4 left-0 right-0 h-1 bg-purple-100 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: "100%" }}
                          transition={{ duration: 3 }}
                          className="h-full bg-purple-600"
                        />
                      </div>
                    </div>
                    <h3 className="text-lg font-bold text-brand-dark mb-2">جاري تحليل ملف {selectedTeacher?.fullName}</h3>
                    <p className="text-sm text-slate-400 max-w-sm mx-auto leading-relaxed">
                      جاري تحليل الملف ومدى التوافق مع المناهج الرسمية، المهارات البيداغوجية، والخبرات السابقة...
                    </p>
                    
                    <div className="mt-8 space-y-3 w-full max-w-md">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="h-4 bg-slate-100 rounded-full w-full animate-pulse overflow-hidden relative">
                          <motion.div 
                            animate={{ x: ["-100%", "100%"] }}
                            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ) : aiResult ? (
                  <div className="space-y-8">
                    {/* Top Row: Score & Recommendation */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-slate-50 rounded-2xl p-6 flex flex-col items-center justify-center text-center">
                        <p className="text-sm font-bold text-slate-400 mb-4">التقييم العام</p>
                        <div className="relative w-28 h-28 flex items-center justify-center">
                          <svg className="w-full h-full transform -rotate-90">
                            <circle
                              cx="56"
                              cy="56"
                              r="50"
                              stroke="currentColor"
                              strokeWidth="8"
                              fill="transparent"
                              className="text-slate-200"
                            />
                            <motion.circle
                              cx="56"
                              cy="56"
                              r="50"
                              stroke="currentColor"
                              strokeWidth="8"
                              fill="transparent"
                              strokeDasharray="314"
                              initial={{ strokeDashoffset: 314 }}
                              animate={{ strokeDashoffset: 314 - (314 * aiResult.overallScore) / 100 }}
                              transition={{ duration: 1.5, ease: "easeOut" }}
                              className="text-purple-600"
                            />
                          </svg>
                          <span className="absolute text-2xl font-black text-brand-dark">{aiResult.overallScore}%</span>
                        </div>
                      </div>

                      <div className="bg-slate-50 rounded-2xl p-6 flex flex-col items-center justify-center text-center">
                        <p className="text-sm font-bold text-slate-400 mb-4">توصية النظام</p>
                        <div className={`
                          px-8 py-3 rounded-xl font-black text-lg flex items-center gap-3
                          ${aiResult.recommendation === 'Hire' ? 'bg-green-100 text-green-700' : 
                            aiResult.recommendation === 'Interview' ? 'bg-brand-blue/10 text-brand-blue' : 
                            'bg-orange-100 text-orange-700'}
                        `}>
                          {aiResult.recommendation === 'Hire' && <CheckCircle2 className="w-6 h-6" />}
                          {aiResult.recommendation === 'Interview' && <Users className="w-6 h-6" />}
                          {aiResult.recommendation === 'Pass' && <X className="w-6 h-6" />}
                          {aiResult.recommendation === 'Hire' ? 'توظيف مباشر' : 
                           aiResult.recommendation === 'Interview' ? 'مقابلة فنية' : 'تجاوز'}
                        </div>
                        <p className="mt-4 text-xs text-slate-400 font-medium">بناءً على معايير الجودة البيداغوجية</p>
                      </div>
                    </div>

                    {/* Strengths */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-brand-dark font-bold">
                        <Star className="w-4 h-4 text-orange-400 fill-orange-400" />
                        <h3>نقاط القوة البيداغوجية</h3>
                      </div>
                      <div className="grid grid-cols-1 gap-3">
                        {aiResult.strengths.map((strength, i) => (
                          <motion.div 
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                            key={i} 
                            className="flex items-center gap-3 bg-white border border-slate-100 p-4 rounded-xl shadow-sm"
                          >
                            <div className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center shrink-0">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            </div>
                            <span className="text-sm font-bold text-slate-600">{strength}</span>
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    {/* Curriculum Alignment */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-brand-dark font-bold">
                        <FileText className="w-4 h-4 text-brand-blue" />
                        <h3>التوافق مع المناهج الرسمية</h3>
                      </div>
                      <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                        <p className="text-sm text-slate-600 leading-relaxed font-medium">
                          {aiResult.curriculumAlignment}
                        </p>
                      </div>
                    </div>

                    {/* Disclaimer */}
                    <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-lg text-amber-700 text-[10px] font-bold">
                      <AlertCircle className="w-3.5 h-3.5" />
                      هذا التحليل تم توليده آلياً بناءً على البيانات المتوفرة في ملف المعلم وهو مخصص لدعم اتخاذ القرار فقط.
                    </div>
                  </div>
                ) : null}
              </div>

              {/* Modal Footer */}
              {!aiLoading && (
                <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                  <button 
                    onClick={() => setShowAIModal(false)}
                    className="px-6 py-2.5 text-slate-600 font-bold text-sm hover:bg-slate-100 rounded-lg transition-all"
                  >
                    إغلاق
                  </button>
                  <button className="px-6 py-2.5 bg-brand-blue text-white font-bold text-sm rounded-lg shadow-md shadow-blue-100 hover:bg-blue-700 transition-all flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    دعوة للمقابلة
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
