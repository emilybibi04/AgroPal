import React, { useState, useEffect, useRef } from 'react';
import { 
  Leaf, 
  MessageSquare, 
  Phone, 
  TrendingUp, 
  Calendar, 
  Sun, 
  CloudRain, 
  CloudLightning,
  Wifi, 
  WifiOff,
  ChevronRight,
  AlertTriangle,
  Sprout,
  Activity,
  Users,
  UserPlus,
  Trash2,
  FileText,
  MapPin,
  LogOut,
  User,
  CheckCircle,
  Bell,
  ClipboardList,
  FlaskConical,
  Calculator,
  Droplets,
  HelpCircle,
  Info,
  Clock,
  Briefcase,
  Tractor,
  UserCog,
  ArrowRight,
  KeyRound,
  ShieldCheck,
  Copy,
  Upload,
  FileSpreadsheet,
  Radio,
  Wind,
  Thermometer,
  ShoppingBag,
  PlusCircle,
  Flame,
  Mic,
  Image as ImageIcon,
  Download,
  FileUp,
  Map as MapIcon,
  DollarSign,
  Trophy,
  BarChart3,
  LineChart,
  Coins,
  Spade
} from 'lucide-react';

// --- Componentes UI Reutilizables ---

const Card = ({ children, className = "", onClick, title }) => (
  <div 
    onClick={onClick} 
    title={title}
    className={`bg-white rounded-xl shadow-md p-4 ${className} ${onClick ? 'cursor-pointer active:scale-95 transition-transform' : ''}`}>
    {children}
  </div>
);

const Button = ({ children, onClick, variant = "primary", className = "", disabled=false, title }) => {
  const baseStyle = "px-4 py-2 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 shadow-sm active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const styles = {
    primary: "bg-green-700 text-white hover:bg-green-800",
    secondary: "bg-amber-100 text-amber-900 hover:bg-amber-200",
    danger: "bg-red-600 text-white hover:bg-red-700",
    outline: "border-2 border-green-700 text-green-700 hover:bg-green-50",
    blue: "bg-blue-600 text-white hover:bg-blue-700",
    dark: "bg-gray-800 text-white hover:bg-gray-900"
  };

  return (
    <button 
      onClick={onClick} 
      disabled={disabled} 
      title={title} 
      className={`${baseStyle} ${styles[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-2xl w-full max-w-sm max-h-[85vh] overflow-y-auto shadow-2xl relative flex flex-col">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10 rounded-t-2xl">
          <h3 className="font-bold text-gray-800 text-lg">{title}</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full text-gray-500">
            <ChevronRight className="rotate-90" />
          </button>
        </div>
        <div className="p-4 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

// --- Datos Mock Iniciales ---

const INITIAL_WORKERS = [
  { 
    id: 1, 
    name: 'Juan Pérez', 
    role: 'worker', 
    lot: 'Lote A-12', 
    status: 'Activo', 
    lastReport: 'Hace 2h', 
    hasIssues: true,
    accessCode: '123456', 
    tasks: [
      { id: 't1', title: 'Poda de Formación', type: 'urgente', time: '08:00', deadline: '2023-11-25', completed: false, observation: '' },
      { id: 't2', title: 'Registro Fotográfico', type: 'normal', time: '14:00', deadline: '2023-11-26', completed: true, observation: 'Se encontraron manchas negras en hojas inferiores.' }
    ]
  },
  { 
    id: 2, 
    name: 'María Gómez', 
    role: 'worker', 
    lot: 'Lote B-04', 
    status: 'Activo', 
    lastReport: 'Hace 15m', 
    hasIssues: false,
    accessCode: '654321',
    tasks: [
      { id: 't3', title: 'Fertilización', type: 'normal', time: '07:00', deadline: '2023-11-30', completed: false, observation: '' }
    ]
  },
  {
    id: 3,
    name: 'Ing. Carlos Ruiz',
    role: 'tech',
    lot: 'Zona Norte',
    status: 'Activo',
    lastReport: 'Ayer',
    hasIssues: false,
    accessCode: '999888',
    tasks: [
        { id: 't_tech_1', title: 'Supervisión de Poda', type: 'normal', time: '09:00', deadline: '2023-11-28', completed: false, observation: '' }
    ]
  }
];

const INITIAL_ADMIN_TASKS = [
    { id: 'adm_1', title: 'Comprar fertilizante NPK', type: 'urgente', time: '10:00', deadline: '2023-11-24', completed: false },
    { id: 'adm_2', title: 'Enviar email a exportadora', type: 'normal', time: '15:00', deadline: '2023-11-26', completed: false }
];

// --- Componente Principal ---

export default function AgroPalApp() {
  const [userRole, setUserRole] = useState(null); 
  const [activeTab, setActiveTab] = useState('planner');
  const [isOnline, setIsOnline] = useState(true);
  
  // --- Estados de Onboarding y Auth ---
  const [onboardingStep, setOnboardingStep] = useState('welcome'); 
  const [plantationSize, setPlantationSize] = useState('');
  const [teamSize, setTeamSize] = useState('');
  const [recommendedRole, setRecommendedRole] = useState(null);
  const [loginInput, setLoginInput] = useState(''); 
  
  // Estado Global de Trabajadores y Datos
  const [workers, setWorkers] = useState(INITIAL_WORKERS);
  const [adminTasks, setAdminTasks] = useState(INITIAL_ADMIN_TASKS);
  const [currentWorkerId, setCurrentWorkerId] = useState(1); 
  
  // Estados Admin / Tech
  const [selectedWorker, setSelectedWorker] = useState(null); 
  const [showAddWorker, setShowAddWorker] = useState(false);
  const [newUserCreated, setNewUserCreated] = useState(null); 
  const [showAlertDetails, setShowAlertDetails] = useState(false);
  const [showMap, setShowMap] = useState(false); 
  
  // --- ESTADOS CALCULADORA FERTILIZACIÓN ---
  const [showFertilizerCalc, setShowFertilizerCalc] = useState(false);
  const [showSoilGuide, setShowSoilGuide] = useState(false);
  const [calcMode, setCalcMode] = useState(null); 
  const [soilAnalysis, setSoilAnalysis] = useState({ n: '', p: '', k: '' });
  const [quizAnswers, setQuizAnswers] = useState({ leaves: '', soil: '', growth: '' });
  const [fertResult, setFertResult] = useState(null);
  const [fertTab, setFertTab] = useState('components'); 

  // Estados Planner
  const [taskToComplete, setTaskToComplete] = useState(null); 
  const [observationText, setObservationText] = useState('');
  const [showCreateTask, setShowCreateTask] = useState(false); 
  const fileInputRef = useRef(null); 
  
  // Estados Chat y Otros
  const [messages, setMessages] = useState([{ sender: 'bot', text: 'Hola, soy AgroIA. ¿En qué puedo ayudarte hoy?' }]);
  const [inputMsg, setInputMsg] = useState('');
  
  // --- ESTADOS PROYECCIÓN ---
  const [forecastInputs, setForecastInputs] = useState({ hectares: 2, plantAge: 5, plantingMethod: 'traditional' });
  const [forecast, setForecast] = useState({ 
    yield: 0, 
    risk: 0, 
    riskLabel: 'Bajo', 
    grossIncome: 0, 
    expenses: 0,
    netUtility: 0,
    recommendation: '' 
  });
  const [weatherStationData, setWeatherStationData] = useState(null); 

  // Resetear tab al cambiar rol
  useEffect(() => {
    if (userRole === 'worker') setActiveTab('planner');
    if (userRole === 'admin') setActiveTab('dashboard');
    if (userRole === 'tech') setActiveTab('dashboard');
    if (userRole === 'producer') setActiveTab('dashboard');
  }, [userRole]);

  // Onboarding & Login Logic
  const handleSizeSubmit = () => { if (!plantationSize) return; setOnboardingStep('team'); };
  const handleTeamSubmit = () => {
    if (!teamSize) return;
    const size = parseFloat(plantationSize);
    const team = parseInt(teamSize);
    if (size > 5 || team > 3) setRecommendedRole('admin');
    else setRecommendedRole('producer');
    setOnboardingStep('recommendation');
    setForecastInputs(prev => ({...prev, hectares: size}));
  };
  const handleLogin = (e) => {
    e.preventDefault();
    if (!loginInput) return;
    const foundWorker = workers.find(w => w.accessCode === loginInput);
    if (foundWorker) {
      setCurrentWorkerId(foundWorker.id);
      setUserRole(foundWorker.role);
      return;
    }
    if (loginInput.toLowerCase().includes('admin')) setUserRole('admin');
    else if (loginInput.toLowerCase().includes('prod')) setUserRole('producer');
    else setUserRole('admin'); 
  };
  const handleRegister = (e) => { e.preventDefault(); setUserRole(recommendedRole); };

  // CSV Import Logic
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => { processCSV(e.target.result); };
    reader.readAsText(file);
  };

  const processCSV = (csvText) => {
    const lines = csvText.split('\n');
    const newTasks = [];
    const startIndex = lines[0].toLowerCase().includes('tarea') ? 1 : 0;

    for (let i = startIndex; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      const [title, date, type, deadline] = line.split(',');
      if (title) {
        newTasks.push({
          id: `csv-${Date.now()}-${i}`,
          title: title.trim(),
          time: date ? date.trim() : '08:00',
          type: (type && type.trim().toLowerCase() === 'urgente') ? 'urgente' : 'normal',
          deadline: deadline ? deadline.trim() : new Date().toISOString().split('T')[0],
          completed: false,
          observation: ''
        });
      }
    }

    if (newTasks.length > 0) {
      if (userRole === 'admin') {
          setAdminTasks([...adminTasks, ...newTasks]);
      } else {
          const updatedWorkers = workers.map(w => {
            if (w.id === currentWorkerId || (userRole === 'producer' && w.id === 1)) {
              return { ...w, tasks: [...w.tasks, ...newTasks] };
            }
            return w;
          });
          setWorkers(updatedWorkers);
      }
      alert(`¡Éxito! Se han importado ${newTasks.length} tareas.`);
    } else {
      alert("Error en formato. Usa CSV: Tarea,Hora,Tipo,FechaLimite");
    }
  };

  // Admin Functions
  const handleAddWorker = (e) => {
    e.preventDefault();
    const name = e.target.name.value;
    const lot = e.target.lot.value;
    const role = e.target.role.value;
    if(name && lot && role) {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const newWorker = { id: Date.now(), name, role, lot, status: 'Nuevo', lastReport: '-', hasIssues: false, accessCode: code, tasks: [] };
      setWorkers([...workers, newWorker]);
      setNewUserCreated(newWorker);
      setShowAddWorker(false);
    }
  };
  const removeWorker = (id) => { setWorkers(workers.filter(w => w.id !== id)); };

  const handleCreateTask = (e) => {
    e.preventDefault();
    const title = e.target.title.value;
    const deadline = e.target.deadline.value;
    const time = e.target.time.value;
    const type = e.target.type.value;
    const assigneeValue = e.target.assignee ? e.target.assignee.value : 'self';

    if (title && deadline) {
      const newTask = { id: `manual-${Date.now()}`, title, deadline, time: time || '08:00', type, completed: false, observation: '' };
      if (userRole === 'admin' && assigneeValue === 'admin_self') {
          setAdminTasks([...adminTasks, newTask]);
      } else if (userRole === 'producer') {
          const updatedWorkers = workers.map(w => w.id === 1 ? { ...w, tasks: [...w.tasks, newTask] } : w);
          setWorkers(updatedWorkers);
      } else {
          const targetId = parseInt(assigneeValue);
          const updatedWorkers = workers.map(w => w.id === targetId ? { ...w, tasks: [...w.tasks, newTask] } : w);
          setWorkers(updatedWorkers);
      }
      setShowCreateTask(false);
    }
  };

  const handleExportPDF = () => { alert("Generando PDF con todos los reportes y proyecciones... Descarga iniciada."); };

  // --- Lógica Forecasting ---
  useEffect(() => {
    const isRainy = Math.random() > 0.5;
    const age = forecastInputs.plantAge;
    const hectares = forecastInputs.hectares || 1;
    
    // 1. Determinar Plantas por Hectárea (Densidad)
    const plantsPerHectare = forecastInputs.plantingMethod === 'traditional' ? 1111 : 1550;
    
    // 2. Determinar Rendimiento por Planta según Edad
    let yieldPerHectare = 0;

    if (age >= 5 && age <= 8) {
      yieldPerHectare = 1.85; 
    } else if (age > 8 && age <= 12) {
      yieldPerHectare = 0.45;
    } else if (age > 6 && age <= 10 && age > 8) {
       yieldPerHectare = 0.5; 
    } else if (age < 5) {
       yieldPerHectare = 0.3; 
    } else {
       yieldPerHectare = 0.2; 
    }

    if (forecastInputs.plantingMethod === 'tresbolillo') {
        yieldPerHectare = yieldPerHectare * 1.25; 
    }

    // Clima
    let weatherFactor = isRainy ? 1.05 : 0.95; 
    let diseaseRisk = isRainy ? 65 : 15;

    // Cálculo Final Rendimiento
    const finalYieldTon = (yieldPerHectare * weatherFactor * hectares).toFixed(2);
    const finalYieldKg = finalYieldTon * 1000;

    // --- CÁLCULO FINANCIERO (UTILIDAD) ---
    const cocoaPricePerTon = 3450; 
    const grossIncome = parseFloat(finalYieldTon) * cocoaPricePerTon;

    // Gastos:
    const jornalerosCount = workers.filter(w => w.role === 'worker').length;
    const personnelCost = jornalerosCount * 2700;
    const fertilizerCost = 300 * hectares;

    const totalExpenses = personnelCost + fertilizerCost;
    const netUtility = grossIncome - totalExpenses;

    let recommendation = "";
    if (diseaseRisk > 60) recommendation = "ALERTA: Alto riesgo de hongos. Aplicar fungicidas cúpricos inmediatamente y realizar podas sanitarias para mejorar ventilación.";
    else if (diseaseRisk > 30) recommendation = "PRECAUCIÓN: Monitorear humedad. Revisar drenajes y eliminar mazorcas enfermas semanalmente.";
    else recommendation = "ESTABLE: Condiciones óptimas. Mantener labores culturales rutinarias.";

    setForecast({
      yield: finalYieldTon,
      risk: diseaseRisk,
      riskLabel: diseaseRisk > 60 ? 'Crítico' : (diseaseRisk > 30 ? 'Medio' : 'Bajo'),
      grossIncome: grossIncome.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}),
      expenses: totalExpenses.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}),
      netUtility: netUtility.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}),
      recommendation
    });

    setWeatherStationData(null); 
    const timer = setTimeout(() => {
      setWeatherStationData({ temp: isRainy ? 24 : 32, humidity: isRainy ? 88 : 60, rain: isRainy ? 15 : 0, name: "Estación INAMHI - Zona Sur" });
    }, 1500); 
    return () => clearTimeout(timer);
  }, [forecastInputs, workers]); 

  // Fertilizer Logic
  const roundToQuarter = (num) => Math.ceil(num * 4) / 4;
  const calculateFertilization = () => {
    let needs = { n: 0, p: 0, k: 0 };
    let method = '';
    if (calcMode === 'analysis') {
      const nVal = parseFloat(soilAnalysis.n) || 0; const pVal = parseFloat(soilAnalysis.p) || 0; const kVal = parseFloat(soilAnalysis.k) || 0;
      needs.n = Math.max(0, 120 - (nVal * 0.5)); needs.p = Math.max(0, 60 - (pVal * 0.4)); needs.k = Math.max(0, 140 - (kVal * 0.6));
      method = 'Basado en Análisis de Suelo';
    } else {
      needs = { n: 80, p: 40, k: 80 }; 
      if (quizAnswers.leaves === 'yellow') needs.n += 40; if (quizAnswers.growth === 'poor') needs.p += 20; if (quizAnswers.soil === 'sandy') { needs.n *= 1.2; needs.k *= 1.2; }
      method = 'Estimación por Diagnóstico Visual';
    }
    const hectares = forecastInputs.hectares || 1; const sackWeight = 50;
    const dapKgPerHa = needs.p / 0.46; const nFromDapPerHa = dapKgPerHa * 0.18;
    const remainingNPerHa = Math.max(0, needs.n - nFromDapPerHa); const ureaKgPerHa = remainingNPerHa / 0.46; const kclKgPerHa = needs.k / 0.60;
    const totalNutrientsKg = (needs.n + needs.p + needs.k) * hectares; const commercialMixKg = totalNutrientsKg * 2.5; 
    setFertResult({
      urea: Math.round(ureaKgPerHa), dap: Math.round(dapKgPerHa), kcl: Math.round(kclKgPerHa),
      ureaSacks: roundToQuarter((ureaKgPerHa * hectares) / sackWeight),
      dapSacks: roundToQuarter((dapKgPerHa * hectares) / sackWeight),
      kclSacks: roundToQuarter((kclKgPerHa * hectares) / sackWeight),
      commercialSacks: roundToQuarter(commercialMixKg / sackWeight),
      hectaresUsed: hectares, method
    });
  };
  const resetCalculator = () => { setCalcMode(null); setFertResult(null); setFertTab('components'); setSoilAnalysis({ n: '', p: '', k: '' }); setQuizAnswers({ leaves: '', soil: '', growth: '' }); };

  // Planner Functions
  const initiateTaskCompletion = (task) => { if (task.completed) return; setTaskToComplete(task); setObservationText(''); };
  const submitTaskObservation = () => {
    if (!observationText.trim()) return;
    if (userRole === 'admin') {
        const updatedTasks = adminTasks.map(t => t.id === taskToComplete.id ? { ...t, completed: true, observation: observationText } : t);
        setAdminTasks(updatedTasks);
    } else {
        const updatedWorkers = workers.map(w => {
          const targetId = (userRole === 'admin') ? 1 : currentWorkerId;
          if (w.id === targetId) return { ...w, tasks: w.tasks.map(t => t.id === taskToComplete.id ? { ...t, completed: true, observation: observationText } : t) };
          return w;
        });
        setWorkers(updatedWorkers); 
    }
    setTaskToComplete(null); setObservationText('');
  };
  const sendPanicAlert = () => { alert("¡Alerta enviada al Administrador! Compartiendo ubicación GPS..."); };
  const getLLMReport = (worker) => {
    const observations = worker.tasks.filter(t => t.completed && t.observation).map(t => `"${t.observation}" (en ${t.title})`).join(' y ');
    const obsText = observations ? observations : "Sin observaciones relevantes registradas.";
    return {
      summary: `Análisis basado en reporte de ${worker.name}. Observaciones de campo: ${obsText}. La IA ha correlacionado esto con las imágenes subidas y detecta un patrón consistente con inicio de Monilia debido a la humedad reciente.`,
      actions: ["Programar poda sanitaria urgente", "Revisar drenajes del lote"],
      photos: ["https://placehold.co/150x150/3e2723/fff?text=Evidencia+1", "https://placehold.co/150x150/5d4037/fff?text=Evidencia+2"]
    };
  };

  // --- RENDERIZADO COMPONENTES INTERNOS ---

  const renderAdminDashboard = () => {
    const activeAlerts = workers.filter(w => w.hasIssues);
    const alertsCount = activeAlerts.length;

    return (
      <div className="space-y-6 animate-fade-in pb-20">
        <div className="flex justify-between items-end">
          <div><h2 className="text-2xl font-bold text-gray-800">Panel de Control</h2><p className="text-gray-500 text-sm">{userRole === 'tech' ? 'Vista Técnica' : 'Resumen de la plantación'}</p></div>
          <div className="flex gap-2">
              {(userRole === 'admin' || userRole === 'tech') && <Button onClick={handleExportPDF} variant="dark" className="text-xs px-2" title="Descargar todos los reportes"><FileUp size={16}/></Button>}
              {(userRole === 'admin' || userRole === 'producer') && <Button onClick={() => setShowAddWorker(true)} className="text-xs px-3"><UserPlus size={16} /> Nuevo</Button>}
          </div>
        </div>

        {/* TARJETA UNIFICADA: ESTADO Y MAPA */}
        <Card 
          onClick={() => setShowMap(true)} 
          className={`border cursor-pointer hover:shadow-md transition-all group ${alertsCount > 0 ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
          <div className="flex items-center justify-between">
             <div className="flex items-center gap-3">
                <div className={`p-3 rounded-full ${alertsCount > 0 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                   {alertsCount > 0 ? <AlertTriangle size={24} className="animate-pulse" /> : <MapIcon size={24} />}
                </div>
                <div>
                   <h3 className={`font-bold text-lg ${alertsCount > 0 ? 'text-red-900' : 'text-green-900'}`}>
                      {alertsCount > 0 ? 'Atención Requerida' : 'Plantación Saludable'}
                   </h3>
                   <p className={`text-xs ${alertsCount > 0 ? 'text-red-700' : 'text-green-700'}`}>
                      {alertsCount > 0 ? `${alertsCount} lotes con alertas fitosanitarias` : 'Todos los lotes operativos'}
                   </p>
                </div>
             </div>
             <ChevronRight className={`${alertsCount > 0 ? 'text-red-400' : 'text-green-400'} group-hover:translate-x-1 transition-transform`} />
          </div>
        </Card>

        <Card onClick={() => setShowFertilizerCalc(true)} className="bg-blue-50 border border-blue-200 flex justify-between items-center cursor-pointer hover:bg-blue-100 transition-colors mt-3">
          <div className="flex items-center gap-3"><div className="bg-blue-100 p-3 rounded-full text-blue-600"><FlaskConical size={24} /></div><div><h3 className="font-bold text-blue-900">Calculadora Fert.</h3><p className="text-sm text-blue-700">Dosis por hectárea</p></div></div><ChevronRight className="text-blue-400" />
        </Card>

        {/* VISTA TÉCNICO: SUS TAREAS PENDIENTES */}
        {userRole === 'tech' && (
            <div className="mt-6 mb-6">
               <h3 className="font-bold text-gray-700 mb-3 flex items-center gap-2"><ClipboardList size={18} /> Mis Tareas Pendientes</h3>
               {workers.find(w => w.id === currentWorkerId)?.tasks.filter(t => !t.completed).length > 0 ? (
                   <div className="space-y-2">
                       {workers.find(w => w.id === currentWorkerId)?.tasks.filter(t => !t.completed).map(task => (
                           <Card key={task.id} className="border-l-4 border-blue-500 flex justify-between items-center bg-white">
                               <div><h4 className="font-bold text-gray-800 text-sm">{task.title}</h4><p className="text-xs text-gray-500">Vence: {task.deadline} - {task.time}</p></div>
                               <input type="checkbox" onChange={() => initiateTaskCompletion(task)} className="w-5 h-5 accent-blue-600 cursor-pointer"/>
                           </Card>
                       ))}
                   </div>
               ) : <Card className="bg-green-50 border border-green-200 text-center py-2"><p className="text-xs text-green-700">No tienes tareas pendientes.</p></Card>}
            </div>
        )}

        {/* GESTIÓN PERSONAL (Admin/Producer) */}
        {userRole !== 'tech' && (
          <div className="mt-3">
            <h3 className="font-bold text-gray-700 mb-3 flex items-center gap-2"><Users size={18} /> Equipo ({workers.length})</h3>
            <div className="space-y-3">
              {workers.map(worker => {
                const pendingTasks = worker.tasks.filter(t => !t.completed);
                return (
                  <Card key={worker.id} className="relative overflow-hidden border border-gray-100">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${worker.hasIssues ? 'bg-red-500' : (worker.role === 'tech' ? 'bg-blue-600' : 'bg-green-600')}`}>{worker.role === 'tech' ? <UserCog size={18}/> : <User size={18}/>}</div>
                        <div><h4 className="font-bold text-gray-800 flex items-center gap-2">{worker.name}{worker.role === 'tech' && <span className="bg-blue-100 text-blue-800 text-[10px] px-2 py-0.5 rounded-full">Técnico</span>}</h4><div className="flex items-center gap-1 text-xs text-gray-500"><MapPin size={12} /> {worker.lot}</div></div>
                      </div>
                      {(userRole === 'admin' || userRole === 'producer') && <button onClick={() => removeWorker(worker.id)} className="text-gray-300 hover:text-red-500 p-1"><Trash2 size={16} /></button>}
                    </div>
                    {worker.role !== 'tech' && (pendingTasks.length > 0 ? (
                      <div className="bg-amber-50 rounded-lg p-3 my-2 border border-amber-100">
                        <div className="flex items-center gap-2 mb-2"><Clock size={14} className="text-amber-700"/><span className="text-xs font-bold text-amber-800">Pendientes ({pendingTasks.length}):</span></div>
                        <ul className="space-y-1">{pendingTasks.map(t => {const isOverdue = new Date(t.deadline) < new Date(); return (<li key={t.id} className="flex justify-between text-xs items-center"><span className="flex items-center gap-1 text-amber-900"><span className="w-1 h-1 rounded-full bg-amber-500 shrink-0"></span>{t.title}</span><span className={`text-[10px] font-bold ${isOverdue ? 'text-red-600' : 'text-gray-500'}`}>{isOverdue ? 'Vencida' : t.deadline}</span></li>);})}</ul>
                      </div>
                    ) : <div className="bg-green-50 rounded-lg p-2 my-2 text-center border border-green-100"><p className="text-xs text-green-700 font-medium flex items-center justify-center gap-1"><CheckCircle size={12}/> Todo al día</p></div>)}
                    <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-50"><span className="text-xs text-gray-500">Último rep: {worker.lastReport}</span><Button variant="outline" onClick={() => setSelectedWorker(worker)} className="py-1 px-3 text-xs h-auto"><FileText size={14} /> Informe Detallado</Button></div>
                  </Card>
                );
              })}
            </div>
          </div>
        )}
        {userRole === 'tech' && (
           <div className="mt-3"><h3 className="font-bold text-gray-700 mb-3 flex items-center gap-2"><ClipboardList size={18} /> Reportes Recientes</h3><div className="space-y-3">{workers.filter(w => w.hasIssues).map(worker => (<Card key={worker.id} className="border-l-4 border-red-500"><h4 className="font-bold text-gray-800">{worker.name} - {worker.lot}</h4><p className="text-xs text-gray-500 mb-2">Posible Monilia detectada</p><Button variant="outline" onClick={() => setSelectedWorker(worker)} className="py-1 px-3 text-xs h-auto w-full">Revisar Caso</Button></Card>))}</div></div>
        )}

        {/* MODAL UNIFICADO: MAPA Y ALERTAS */}
        <Modal isOpen={showMap} onClose={() => setShowMap(false)} title="Mapa de la Plantación">
            <div className="grid grid-cols-2 gap-4 p-2">
                {workers.map(w => (
                    <div key={w.id} className={`p-4 rounded-xl border-2 text-center relative ${w.hasIssues ? 'bg-red-50 border-red-500' : 'bg-green-50 border-green-500'}`}>
                        <div className="font-bold text-gray-700">{w.lot}</div>
                        <div className="text-xs text-gray-500">{w.name}</div>
                        {w.hasIssues && <AlertTriangle size={16} className="text-red-500 absolute top-2 right-2 animate-bounce"/>}
                    </div>
                ))}
                <div className="p-4 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 bg-gray-50 text-xs">Lote Vacío</div>
            </div>
            
            {/* DETALLE ALERTAS EN EL MISMO MODAL */}
            {alertsCount > 0 && (
              <div className="mt-6 border-t pt-4 animate-fade-in">
                 <h4 className="font-bold text-gray-700 mb-2 flex items-center gap-2 text-sm"><AlertTriangle size={16} className="text-red-500"/> Detalle de Problemas</h4>
                 <div className="space-y-2">
                    {workers.filter(w => w.hasIssues).map(w => (
                       <div key={w.id} className="bg-red-50 border border-red-200 p-3 rounded-lg flex justify-between items-center">
                          <div>
                             <span className="font-bold text-red-800 text-sm block">{w.lot} - {w.name}</span>
                             <span className="text-xs text-red-600">Reporte inusual detectado.</span>
                          </div>
                          <Button onClick={() => {setShowMap(false); setSelectedWorker(w);}} className="text-[10px] px-2 py-1 h-auto" variant="danger">Ver Reporte</Button>
                       </div>
                    ))}
                 </div>
              </div>
            )}
            
            <div className="flex gap-4 mt-4 text-xs justify-center text-gray-500 border-t pt-2">
                <span className="flex items-center gap-1"><span className="w-3 h-3 bg-green-500 rounded-full"></span> Normal</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 bg-red-500 rounded-full"></span> Alerta</span>
            </div>
        </Modal>
      </div>
    );
  };

  const renderPlanner = () => {
    let myTasks = [];
    if (userRole === 'admin') {
        myTasks = adminTasks;
    } else {
        const workerData = workers.find(w => w.id === currentWorkerId);
        myTasks = workerData ? workerData.tasks : [];
    }
    
    return (
      <div className="space-y-6 animate-fade-in pb-20">
        <div className="flex justify-between items-center">
          <div><h2 className="text-2xl font-bold text-gray-800">{userRole === 'admin' ? 'Mis Tareas (Gestión)' : (userRole === 'producer' ? 'Mi Plantación' : 'Mi Hectárea')}</h2><p className="text-gray-500 text-sm">{userRole === 'admin' ? 'Actividades Administrativas' : 'Tareas asignadas'}</p></div>
          <div className="flex gap-2">
            {userRole === 'worker' && <div className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1"><Trophy size={14}/> Racha: 12</div>}
            {(userRole === 'admin' || userRole === 'producer') && (
              <>
                <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".csv" className="hidden" />
                <button title="Cargar planificación (Excel/CSV)" onClick={() => fileInputRef.current.click()} className="flex items-center gap-1 bg-green-100 text-green-700 text-xs px-2 py-2 rounded-lg font-bold hover:bg-green-200 transition-colors"><FileSpreadsheet size={16} /></button>
                <button onClick={() => setShowCreateTask(true)} className="flex items-center gap-1 bg-green-700 text-white text-xs px-3 py-2 rounded-lg font-bold shadow-md transition-colors"><PlusCircle size={16} /> Crear Tarea</button>
              </>
            )}
          </div>
        </div>

        {userRole !== 'admin' && <Card className="bg-gradient-to-r from-green-800 to-green-600 text-white border-none shadow-lg"><div className="flex justify-between items-start mb-4"><div><p className="text-green-100 text-xs uppercase tracking-wider">Estado del Cultivo</p><h3 className="text-2xl font-bold mt-1">Floración</h3></div><Sun className="text-yellow-300 w-8 h-8 animate-pulse" /></div><div className="w-full bg-black/20 h-2 rounded-full mb-2"><div className="bg-yellow-400 h-2 rounded-full" style={{ width: '30%' }}></div></div><p className="text-xs text-green-100">Día 45 / 150</p></Card>}
        
        <div>
          <h3 className="font-bold text-gray-700 mb-3">Lista de Tareas</h3>
          {myTasks.map((task) => {
            const isOverdue = new Date(task.deadline) < new Date() && !task.completed;
            return (
              <Card key={task.id} className={`flex justify-between items-center mb-3 border-l-4 transition-colors ${task.completed ? 'border-gray-400 bg-gray-50' : (isOverdue ? 'border-red-500 bg-red-50' : 'border-green-600')}`}>
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${task.completed ? 'bg-gray-200 text-gray-500' : (task.type === 'urgente' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600')}`}>{task.completed ? <CheckCircle size={18}/> : (task.type === 'urgente' ? <AlertTriangle size={18} /> : <Calendar size={18} />)}</div>
                  <div>
                    <h4 className={`font-semibold text-sm ${task.completed ? 'text-gray-500 line-through' : 'text-gray-800'}`}>{task.title}</h4>
                    <p className={`text-xs flex items-center gap-1 ${isOverdue ? 'text-red-600 font-bold' : 'text-gray-500'}`}><Clock size={10} /> {isOverdue ? `Venció: ${task.deadline}` : `Vence: ${task.deadline} ${task.time ? '- ' + task.time : ''}`}</p>
                  </div>
                </div>
                <input type="checkbox" checked={task.completed} onChange={() => initiateTaskCompletion(task)} disabled={task.completed} className="w-5 h-5 accent-green-600 cursor-pointer" />
              </Card>
            );
          })}
          {myTasks.length === 0 && <p className="text-gray-500 text-sm text-center py-4">No tienes tareas asignadas.</p>}
        </div>

        <Modal isOpen={!!taskToComplete} onClose={() => setTaskToComplete(null)} title="Completar Tarea"><div className="space-y-4"><div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-600">Estás completando: <strong>{taskToComplete?.title}</strong></div><div><label className="block text-sm font-bold text-gray-700 mb-2">Observación de Campo <span className="text-red-500">*</span></label><textarea className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:border-green-500 outline-none h-24" placeholder="Describe anomalías..." value={observationText} onChange={(e) => setObservationText(e.target.value)} /><p className="text-xs text-gray-500 mt-1">Este reporte será analizado por la IA.</p></div><Button className="w-full" onClick={submitTaskObservation} disabled={!observationText.trim()}>Guardar y Finalizar</Button></div></Modal>
        
        <Modal isOpen={showCreateTask} onClose={() => setShowCreateTask(false)} title="Nueva Tarea">
          <form onSubmit={handleCreateTask} className="space-y-4">
            <div><label className="text-xs font-bold text-gray-500 mb-1 block">Título</label><input name="title" type="text" className="w-full p-2 border border-gray-300 rounded-lg" placeholder="Ej. Poda de mantenimiento" required /></div>
            <div className="flex gap-2">
              <div className="flex-1"><label className="text-xs font-bold text-gray-500 mb-1 block">Fecha Límite</label><input name="deadline" type="date" className="w-full p-2 border border-gray-300 rounded-lg" required /></div>
              <div className="flex-1"><label className="text-xs font-bold text-gray-500 mb-1 block">Hora Límite</label><input name="time" type="time" className="w-full p-2 border border-gray-300 rounded-lg" required /></div>
            </div>
            <div><label className="text-xs font-bold text-gray-500 mb-1 block">Prioridad</label><select name="type" className="w-full p-2 border border-gray-300 rounded-lg"><option value="normal">Normal</option><option value="urgente">Urgente</option></select></div>
            {userRole === 'admin' && (
              <div><label className="text-xs font-bold text-gray-500 mb-1 block">Asignar a:</label>
                <select name="assignee" className="w-full p-2 border border-gray-300 rounded-lg">
                  <option value="admin_self">Mí mismo (Admin)</option>
                  {workers.map(w => (<option key={w.id} value={w.id}>{w.name} ({w.role === 'tech' ? 'Técnico' : 'Jornalero'})</option>))}
                </select>
              </div>
            )}
            <Button className="w-full mt-2">Asignar Tarea</Button>
          </form>
        </Modal>
      </div>
    );
  };

  const renderSupport = () => {
    const tech = workers.find(w => w.role === 'tech');
    return (
      <div className="space-y-6 animate-fade-in pb-20">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2"><Phone className="text-red-600" /> SOS</h2>
        {(userRole === 'worker' || userRole === 'producer') && (<Card className="bg-red-600 text-white shadow-xl transform transition hover:scale-105"><div className="text-center py-4"><Bell size={48} className="mx-auto mb-2 animate-bounce" /><h3 className="text-2xl font-bold uppercase tracking-widest mb-2">Pánico</h3><p className="text-red-100 text-sm mb-4 px-4">Usar solo en caso de accidente grave o peligro inminente.</p><button onClick={sendPanicAlert} className="bg-white text-red-600 font-bold py-3 px-8 rounded-full shadow-lg hover:bg-gray-100 w-full max-w-xs">ALERTAR AL ADMINISTRADOR</button></div></Card>)}
        
        <div className="space-y-3">
          <h3 className="font-bold text-gray-700">Contactos de Emergencia</h3>
          <Card className="flex justify-between items-center border border-red-100 bg-red-50"><div className="flex items-center gap-3"><div className="bg-red-100 p-2 rounded-full text-red-600"><Activity size={20} /></div><div><h4 className="font-bold text-gray-800">Emergencia Médica</h4><p className="text-xs text-gray-600">Ambulancia Rural</p></div></div><Button variant="danger" className="py-1 px-3 text-sm h-auto">Llamar 911</Button></Card>
          <Card className="flex justify-between items-center border border-orange-100 bg-orange-50"><div className="flex items-center gap-3"><div className="bg-orange-100 p-2 rounded-full text-orange-600"><Flame size={20} /></div><div><h4 className="font-bold text-gray-800">Bomberos</h4><p className="text-xs text-gray-600">Incendios / Rescate</p></div></div><Button className="bg-orange-600 hover:bg-orange-700 text-white py-1 px-3 text-sm h-auto border-none">Llamar 102</Button></Card>
          <Card className="flex justify-between items-center border border-gray-100 hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-3"><div className="bg-blue-100 p-2 rounded-full text-blue-700"><UserCog size={20} /></div><div><h4 className="font-semibold text-gray-800">{tech ? tech.name : 'Sin Técnico Asignado'}</h4><p className="text-xs text-gray-500">Soporte Técnico Plantación</p></div></div>
            {tech && <button className="bg-gray-100 p-2 rounded-full text-green-700 hover:bg-green-200"><Phone size={18} /></button>}
          </Card>
          {[{ name: "AgroCalidad", role: "Control Fitosanitario", phone: "1800-247-600" },{ name: "Policía Nacional", role: "Seguridad Rural", phone: "101" }].map((contact, i) => (<Card key={i} className="flex justify-between items-center border border-gray-100 hover:bg-gray-50 transition-colors"><div className="flex items-center gap-3"><div className="bg-green-100 p-2 rounded-full text-green-700"><Phone size={20} /></div><div><h4 className="font-semibold text-gray-800">{contact.name}</h4><p className="text-xs text-gray-500">{contact.role}</p></div></div><button className="bg-gray-100 p-2 rounded-full text-green-700 hover:bg-green-200"><Phone size={18} /></button></Card>))}
        </div>
      </div>
    );
  };
  
  const renderForecasting = () => (
    <div className="space-y-6 animate-fade-in pb-20">
      <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2"><TrendingUp className="text-green-700" /> Proyecciones</h2>
      {/* SECCIÓN CLIMA (AUTOMÁTICO) */}
      <Card className="border border-blue-100 bg-gradient-to-br from-blue-50 to-white">
        <div className="flex justify-between items-start mb-4"><h3 className="text-sm font-bold text-blue-800 flex items-center gap-2"><Radio size={16} className={weatherStationData ? "text-green-500 animate-pulse" : "text-gray-400"} /> {weatherStationData ? "Estación Conectada" : "Buscando Señal..."}</h3><span className="text-[10px] bg-white px-2 py-1 rounded border border-blue-100 text-gray-500">Actualizado: Hace 1m</span></div>
        {weatherStationData ? (
          <div className="animate-fade-in">
            <p className="text-xs text-gray-500 mb-3 font-semibold">{weatherStationData.name}</p>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-white p-2 rounded-xl shadow-sm"><Thermometer size={20} className="mx-auto text-red-500 mb-1"/><span className="block text-lg font-bold text-gray-800">{weatherStationData.temp}°C</span><span className="text-[10px] text-gray-400">Temp</span></div>
              <div className="bg-white p-2 rounded-xl shadow-sm"><Droplets size={20} className="mx-auto text-blue-500 mb-1"/><span className="block text-lg font-bold text-gray-800">{weatherStationData.humidity}%</span><span className="text-[10px] text-gray-400">Humedad</span></div>
              <div className="bg-white p-2 rounded-xl shadow-sm"><CloudRain size={20} className="mx-auto text-gray-600 mb-1"/><span className="block text-lg font-bold text-gray-800">{weatherStationData.rain}mm</span><span className="text-[10px] text-gray-400">Lluvia</span></div>
            </div>
          </div>
        ) : (<div className="h-24 flex flex-col items-center justify-center text-gray-400"><Wifi size={32} className="animate-ping mb-2 opacity-50"/><p className="text-xs">Sincronizando con estación cercana...</p></div>)}
      </Card>

      {/* PRECIO MERCADO (NUEVO) */}
      <Card className="bg-amber-50 border border-amber-100">
          <div className="flex justify-between items-center">
              <div>
                  <p className="text-xs font-bold text-amber-700 uppercase tracking-wider">Precio Internacional Cacao</p>
                  <h3 className="text-2xl font-bold text-gray-800">$3,450 <span className="text-sm font-normal text-gray-500">/ Ton</span></h3>
              </div>
              <div className="bg-white p-2 rounded-full shadow-sm text-green-600"><TrendingUp size={24}/></div>
          </div>
          <p className="text-[10px] text-amber-600 mt-2 flex items-center gap-1"><Info size={10}/> Bolsa de Nueva York (Actualizado hoy)</p>
      </Card>

      {/* Inputs Finca */}
      <Card className="border border-green-100 bg-green-50/50">
        <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2"><Activity size={16} /> Datos de Finca</h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center text-sm"><span className="text-gray-600">Hectáreas Totales</span><input type="number" className="w-16 p-1 text-center border rounded bg-white" value={forecastInputs.hectares} onChange={(e) => setForecastInputs({...forecastInputs, hectares: e.target.value})} /></div>
          <div className="flex justify-between items-center text-sm"><span className="text-gray-600">Edad Promedio (Años)</span><input type="number" className="w-16 p-1 text-center border rounded bg-white" value={forecastInputs.plantAge} onChange={(e) => setForecastInputs({...forecastInputs, plantAge: e.target.value})} /></div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">Método de Siembra</span>
            <select 
              className="w-32 p-1 text-center border rounded bg-white text-xs" 
              value={forecastInputs.plantingMethod}
              onChange={(e) => setForecastInputs({...forecastInputs, plantingMethod: e.target.value})}>
                <option value="traditional">Tradicional (3x3)</option>
                <option value="tresbolillo">Tres Bolillo</option>
            </select>
          </div>
        </div>
      </Card>
      
      {/* RESULTADOS FINANCIEROS DETALLADOS */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="text-center"><p className="text-xs text-gray-500 mb-1">Rendimiento Total</p><p className="text-xl font-bold text-gray-800">{forecast.yield} Ton</p></Card>
        <Card className="text-center"><p className="text-xs text-gray-500 mb-1">Ganancia Bruta</p><p className="text-xl font-bold text-green-700">${forecast.grossIncome}</p></Card>
      </div>

      <Card className="border border-gray-200 bg-gray-50">
         <div className="flex justify-between text-xs mb-1"><span className="text-gray-500">Gastos Personal (Jornaleros)</span><span className="font-bold text-red-500">-${(workers.filter(w => w.role === 'worker').length * 2700).toLocaleString()}</span></div>
         <div className="flex justify-between text-xs mb-3 pb-2 border-b border-gray-200"><span className="text-gray-500">Gastos Fertilizante</span><span className="font-bold text-red-500">-${(300 * (forecastInputs.hectares || 1)).toLocaleString()}</span></div>
         <div className="flex justify-between items-center">
            <span className="font-bold text-gray-700">Utilidad Neta Estimada</span>
            <span className="font-bold text-lg text-green-800">${forecast.netUtility}</span>
         </div>
      </Card>
      
      {/* RECOMENDACIÓN INTELIGENTE */}
      <div className={`p-4 rounded-xl border ${forecast.risk > 60 ? 'bg-red-50 border-red-200' : (forecast.risk > 30 ? 'bg-amber-50 border-amber-200' : 'bg-green-50 border-green-200')}`}>
          <div className="flex items-center gap-2 mb-2">
              <AlertTriangle size={18} className={forecast.risk > 60 ? 'text-red-600' : (forecast.risk > 30 ? 'text-amber-600' : 'text-green-600')} />
              <h3 className={`font-bold ${forecast.risk > 60 ? 'text-red-800' : (forecast.risk > 30 ? 'text-amber-800' : 'text-green-800')}`}>Recomendación IA ({forecast.riskLabel})</h3>
          </div>
          <p className="text-sm text-gray-700 leading-relaxed">{forecast.recommendation}</p>
      </div>
    </div>
  );

  const renderChatbot = () => (
    <div className="flex flex-col h-[calc(100vh-140px)]">
      <div className="bg-white p-3 rounded-xl shadow-sm mb-3 flex justify-between items-center">
          <div><h2 className="text-lg font-bold text-gray-800">AgroIA</h2><p className="text-xs text-gray-500">{isOnline ? 'Conectado a la nube' : 'Modo Offline (Local)'}</p></div>
          <div className="flex gap-2">
              <button className="p-2 bg-gray-100 rounded-full text-gray-600 hover:bg-gray-200" title="Subir Imagen"><ImageIcon size={18}/></button>
              <button className="p-2 bg-gray-100 rounded-full text-gray-600 hover:bg-gray-200" title="Enviar Audio"><Mic size={18}/></button>
          </div>
      </div>
      <div className="flex-1 overflow-y-auto space-y-3 p-2 bg-gray-50 rounded-xl mb-3">{messages.map((m, i) => (<div key={i} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}><div className={`max-w-[85%] p-3 rounded-xl text-sm ${m.sender === 'user' ? 'bg-green-700 text-white rounded-tr-none' : 'bg-white border text-gray-800 rounded-tl-none'}`}>{m.text}</div></div>))}</div>
      <div className="flex gap-2"><input value={inputMsg} onChange={(e) => setInputMsg(e.target.value)} placeholder="Escribe tu consulta..." className="flex-1 p-3 rounded-full border border-gray-300 text-sm outline-none focus:border-green-500" /><button onClick={() => {if(!inputMsg) return; setMessages([...messages, {sender:'user', text: inputMsg}, {sender:'bot', text: 'Analizando solicitud...'}]); setInputMsg('');}} className="bg-green-700 text-white p-3 rounded-full hover:bg-green-800"><ChevronRight size={20}/></button></div>
    </div>
  );

  // --- LOGIN SCREEN (Main) ---
  if (!userRole) {
    return (
      <div className="max-w-md mx-auto h-screen bg-green-900 flex flex-col items-center justify-center p-6 text-white relative overflow-hidden transition-all duration-500">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
           <Leaf size={400} className="absolute -top-20 -right-20 rotate-45" />
           <Sprout size={300} className="absolute bottom-0 -left-20" />
        </div>
        
        {/* PANTALLA 1: Bienvenida */}
        {onboardingStep === 'welcome' && (
          <div className="z-10 text-center w-full space-y-8 animate-fade-in p-4">
            <div className="flex flex-col items-center gap-2 mb-8">
              <div className="bg-white p-4 rounded-full shadow-xl">
                  <Leaf className="text-green-800 w-12 h-12" />
              </div>
              <h1 className="text-4xl font-bold tracking-tight">AgroPal</h1>
              <p className="text-green-200">Asistente Inteligente para Cacao</p>
            </div>
            <div className="space-y-4">
              <button onClick={() => setOnboardingStep('size')} className="w-full bg-white text-green-900 p-4 rounded-xl font-bold shadow-lg hover:bg-green-50 transition-all flex justify-between items-center group">
                <span className="flex flex-col items-start"><span className="text-lg">Soy nuevo aquí</span><span className="text-xs font-normal text-gray-500">Crear mi plantación</span></span>
                <ArrowRight className="text-green-500 group-hover:translate-x-1 transition-transform" />
              </button>
              <button onClick={() => setOnboardingStep('login')} className="w-full bg-green-800/50 border border-green-700/50 backdrop-blur-sm text-white p-4 rounded-xl font-bold shadow-lg hover:bg-green-800 transition-all flex justify-between items-center group">
                <span className="flex flex-col items-start"><span className="text-lg">Ya tengo cuenta</span><span className="text-xs font-normal text-green-300">Iniciar sesión o usar código</span></span>
                <KeyRound className="text-green-300 group-hover:text-white" />
              </button>
            </div>
          </div>
        )}

        {/* PANTALLA 2: Tamaño Plantación */}
        {onboardingStep === 'size' && (
          <div className="z-10 text-center w-full space-y-6 animate-fade-in p-2">
            <h2 className="text-2xl font-bold">Evaluación Inicial (1/2)</h2>
            <div className="bg-white/10 p-6 rounded-2xl backdrop-blur-md border border-white/20">
              <label className="block text-green-100 text-sm font-bold mb-3">¿Tamaño de la plantación?</label>
              <div className="flex gap-2 items-center bg-white rounded-xl p-1 pl-4 mb-4">
                <input type="number" value={plantationSize} onChange={(e) => setPlantationSize(e.target.value)} placeholder="0" className="w-full text-green-900 font-bold text-xl outline-none" />
                <span className="text-gray-400 font-bold pr-4">Ha</span>
              </div>
              <button onClick={handleSizeSubmit} disabled={!plantationSize} className="w-full bg-green-500 hover:bg-green-400 text-white font-bold py-3 rounded-xl shadow-lg disabled:opacity-50">Siguiente</button>
            </div>
            <button onClick={() => setOnboardingStep('welcome')} className="text-xs text-green-300">Volver</button>
          </div>
        )}

        {/* PANTALLA 3: Tamaño Equipo */}
        {onboardingStep === 'team' && (
          <div className="z-10 text-center w-full space-y-6 animate-fade-in p-2">
            <h2 className="text-2xl font-bold">Evaluación Inicial (2/2)</h2>
            <div className="bg-white/10 p-6 rounded-2xl backdrop-blur-md border border-white/20">
              <label className="block text-green-100 text-sm font-bold mb-3">¿Personas trabajando?</label>
              <div className="flex gap-2 items-center bg-white rounded-xl p-1 pl-4 mb-4">
                <input type="number" value={teamSize} onChange={(e) => setTeamSize(e.target.value)} placeholder="0" className="w-full text-green-900 font-bold text-xl outline-none" />
                <span className="text-gray-400 font-bold pr-4"><Users size={20}/></span>
              </div>
              <button onClick={handleTeamSubmit} disabled={!teamSize} className="w-full bg-green-500 hover:bg-green-400 text-white font-bold py-3 rounded-xl shadow-lg disabled:opacity-50">Analizar Perfil</button>
            </div>
            <button onClick={() => setOnboardingStep('size')} className="text-xs text-green-300">Volver</button>
          </div>
        )}

        {/* PANTALLA 4: Recomendación */}
        {onboardingStep === 'recommendation' && (
          <div className="z-10 text-center w-full space-y-6 animate-fade-in p-2">
             <div className="bg-white p-6 rounded-2xl shadow-2xl text-gray-800">
                <h2 className="text-2xl font-bold mb-4">Perfil Sugerido</h2>
                <div className="bg-green-50 border-2 border-green-500 rounded-xl p-4 mb-6">
                  <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-2 text-green-700">
                    {recommendedRole === 'producer' ? <Tractor size={32} /> : <Briefcase size={32} />}
                  </div>
                  <h3 className="font-bold text-xl text-green-800 uppercase tracking-wide">
                    {recommendedRole === 'producer' ? 'Productor Independiente' : 'Administrador'}
                  </h3>
                  <p className="text-sm text-green-700 mt-2">
                    {recommendedRole === 'producer' 
                      ? 'Basado en tu tamaño (Pequeño/Mediano), te sugerimos este perfil "Todoterreno" para gestionar todo tú mismo.'
                      : 'Basado en el tamaño de tu equipo/terreno, te sugerimos el perfil de gestión avanzada.'}
                  </p>
                </div>
                <button onClick={() => setOnboardingStep('register')} className="w-full bg-green-700 hover:bg-green-800 text-white font-bold py-3 rounded-xl shadow-lg mb-3">Continuar</button>
                <button onClick={() => setOnboardingStep('selection')} className="text-sm text-green-600 font-semibold hover:text-green-800 mb-2 block w-full">Ver todos los roles</button>
                <button onClick={() => setOnboardingStep('welcome')} className="text-xs text-gray-400">Cancelar</button>
             </div>
          </div>
        )}

        {/* PANTALLA: Selección Manual (Restored) */}
        {onboardingStep === 'selection' && (
          <div className="z-10 text-center w-full space-y-4 animate-fade-in p-2">
            <h2 className="text-2xl font-bold">Elige tu perfil</h2>
            <div className="grid grid-cols-2 gap-3 w-full">
              <button onClick={() => setUserRole('admin')} className="bg-white text-green-900 p-4 rounded-xl font-bold text-sm hover:bg-green-50 transition-all flex flex-col items-center gap-2 shadow-lg">
                <div className="bg-green-100 p-2 rounded-lg"><Briefcase size={24}/></div>
                <span>Administrador</span>
              </button>
              <button onClick={() => setUserRole('producer')} className="bg-white text-green-900 p-4 rounded-xl font-bold text-sm hover:bg-green-50 transition-all flex flex-col items-center gap-2 shadow-lg">
                <div className="bg-green-100 p-2 rounded-lg"><Tractor size={24}/></div>
                <span className="text-center leading-tight">Productor Independiente</span>
              </button>
              <button onClick={() => setUserRole('tech')} className="bg-white text-green-900 p-4 rounded-xl font-bold text-sm hover:bg-green-50 transition-all flex flex-col items-center gap-2 shadow-lg">
                <div className="bg-green-100 p-2 rounded-lg"><UserCog size={24}/></div>
                <span>Técnico</span>
              </button>
              <button onClick={() => setUserRole('worker')} className="bg-green-800/50 border border-green-700/50 backdrop-blur-sm text-white p-4 rounded-xl font-bold text-sm hover:bg-green-800 transition-all flex flex-col items-center gap-2 shadow-lg">
                <div className="bg-green-900/50 p-2 rounded-lg"><User size={24}/></div>
                <span>Personal</span>
              </button>
            </div>
            <button onClick={() => setOnboardingStep('recommendation')} className="text-xs text-green-300 mt-4 underline">Volver a sugerencia</button>
          </div>
        )}

        {/* PANTALLA 5: Registro (Admin/Producer) */}
        {onboardingStep === 'register' && (
          <div className="z-10 text-center w-full space-y-6 animate-fade-in p-2">
            <h2 className="text-2xl font-bold">Crear Cuenta</h2>
            <div className="bg-white p-6 rounded-2xl shadow-2xl text-gray-800 space-y-4">
               <div><label className="block text-left text-xs font-bold text-gray-500 mb-1">Nombre de Usuario</label><input className="w-full bg-gray-100 p-3 rounded-lg border-none outline-none" placeholder="Ej. AdminCacao" /></div>
               <div><label className="block text-left text-xs font-bold text-gray-500 mb-1">Contraseña</label><input type="password" className="w-full bg-gray-100 p-3 rounded-lg border-none outline-none" placeholder="******" /></div>
               <button onClick={handleRegister} className="w-full bg-green-600 text-white font-bold py-3 rounded-xl mt-2">Finalizar Registro</button>
            </div>
            <button onClick={() => setOnboardingStep('recommendation')} className="text-xs text-green-300">Volver</button>
          </div>
        )}

        {/* PANTALLA 6: Login (General) */}
        {onboardingStep === 'login' && (
          <div className="z-10 text-center w-full space-y-6 animate-fade-in p-2">
            <h2 className="text-2xl font-bold">Iniciar Sesión</h2>
            <div className="bg-white p-6 rounded-2xl shadow-2xl text-gray-800 space-y-4">
               <div className="bg-blue-50 p-3 rounded-lg text-xs text-blue-800 mb-2 flex gap-2 text-left">
                 <Info size={32} className="shrink-0"/>
                 <p>Si eres <strong>Jornalero o Técnico</strong>, ingresa el <strong>Código de 6 dígitos</strong> que te dio tu administrador.</p>
               </div>
               <div>
                 <label className="block text-left text-xs font-bold text-gray-500 mb-1">Usuario o Código de Acceso</label>
                 <div className="flex items-center bg-gray-100 rounded-lg overflow-hidden">
                   <div className="p-3 text-gray-400"><KeyRound size={20}/></div>
                   <input 
                     value={loginInput}
                     onChange={(e) => setLoginInput(e.target.value)}
                     className="w-full bg-transparent p-3 pl-0 border-none outline-none font-bold text-gray-700" 
                     placeholder="Ej. 123456 o admin" 
                   />
                 </div>
               </div>
               {/* Simulación Password solo visual */}
               {!/^\d+$/.test(loginInput) && loginInput.length > 0 && (
                 <div className="animate-fade-in">
                   <label className="block text-left text-xs font-bold text-gray-500 mb-1">Contraseña</label>
                   <input type="password" className="w-full bg-gray-100 p-3 rounded-lg border-none outline-none" placeholder="******" />
                 </div>
               )}
               <button onClick={handleLogin} className="w-full bg-green-700 text-white font-bold py-3 rounded-xl mt-2">Entrar</button>
            </div>
            <button onClick={() => setOnboardingStep('welcome')} className="text-xs text-green-300">Volver al inicio</button>
          </div>
        )}
        
        {/* NEW FOOTER */}
        <div className="absolute bottom-4 text-[10px] text-green-400/60 font-mono tracking-widest">
          powered by Chilintomo
        </div>
      </div>
    );
  }

  // --- Renderizado Main ---
  return (
    <div className="max-w-md mx-auto h-screen bg-gray-50 flex flex-col font-sans relative overflow-hidden shadow-2xl">
      <div className="bg-green-900 text-white p-4 pt-10 pb-4 shadow-md z-10 flex justify-between items-center">
        <div><h1 className="text-lg font-bold flex items-center gap-2"><Leaf className="text-green-300" size={20} /> AgroPal</h1><p className="text-xs text-green-300 uppercase tracking-wider font-semibold">{userRole === 'admin' && 'Modo Administrador'}{userRole === 'producer' && 'Modo Productor'}{userRole === 'tech' && 'Modo Técnico'}{userRole === 'worker' && 'Modo Personal'}</p></div>
        <div className="flex gap-2"><button onClick={() => setIsOnline(!isOnline)} className="p-2 bg-white/10 rounded-full">{isOnline ? <Wifi size={16}/> : <WifiOff size={16}/>}</button><button onClick={() => {setUserRole(null); setOnboardingStep('welcome'); setLoginInput(''); setPlantationSize(''); setTeamSize('');}} className="p-2 bg-red-500/80 rounded-full text-white"><LogOut size={16}/></button></div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 bg-gray-50/50">
        {activeTab === 'dashboard' && renderAdminDashboard()}
        {activeTab === 'planner' && renderPlanner()}
        {activeTab === 'chat' && renderChatbot()}
        {activeTab === 'forecast' && renderForecasting()}
        {activeTab === 'support' && renderSupport()}
      </div>

      <div className="bg-white border-t border-gray-200 px-4 py-2 flex justify-between items-center pb-6 md:pb-2">
        {(userRole === 'admin' || userRole === 'producer' || userRole === 'tech') && <button onClick={() => setActiveTab('dashboard')} className={`flex flex-col items-center gap-1 ${activeTab === 'dashboard' ? 'text-green-700' : 'text-gray-400'}`}><Activity size={24} /> <span className="text-[10px]">Panel</span></button>}
        {userRole !== 'tech' && <button onClick={() => setActiveTab('planner')} className={`flex flex-col items-center gap-1 ${activeTab === 'planner' ? 'text-green-700' : 'text-gray-400'}`}><Calendar size={24} /> <span className="text-[10px]">{userRole === 'admin' ? 'Plan' : 'Tareas'}</span></button>}
        <button onClick={() => setActiveTab('chat')} className={`flex flex-col items-center gap-1 ${activeTab === 'chat' ? 'text-green-700' : 'text-gray-400'}`}><MessageSquare size={24} /> <span className="text-[10px]">Chat</span></button>
        {(userRole === 'admin' || userRole === 'producer') && <button onClick={() => setActiveTab('forecast')} className={`flex flex-col items-center gap-1 ${activeTab === 'forecast' ? 'text-green-700' : 'text-gray-400'}`}><LineChart size={24} /> <span className="text-[10px]">$$$</span></button>}
        <button onClick={() => setActiveTab('support')} className={`flex flex-col items-center gap-1 ${activeTab === 'support' ? 'text-green-700' : 'text-gray-400'}`}><Phone size={24} /> <span className="text-[10px]">SOS</span></button>
      </div>

      {/* --- MODALES --- */}
      <Modal isOpen={showFertilizerCalc} onClose={() => {setShowFertilizerCalc(false); resetCalculator();}} title="Calculadora de Dosis">
        {!calcMode ? (
          <div className="space-y-4">
            <p className="text-sm text-gray-600 mb-4">Selecciona método:</p>
            <button onClick={() => setCalcMode('analysis')} className="w-full p-4 rounded-xl border-2 border-green-100 bg-green-50 hover:bg-green-100 text-left flex gap-3 items-center transition-all"><FlaskConical className="text-green-600" /><div><h4 className="font-bold text-green-800">Con Análisis de Suelo</h4><p className="text-xs text-gray-600">Ingresar valores (N, P, K)</p></div></button>
            <button onClick={() => setCalcMode('quiz')} className="w-full p-4 rounded-xl border-2 border-blue-100 bg-blue-50 hover:bg-blue-100 text-left flex gap-3 items-center transition-all"><ClipboardList className="text-blue-600" /><div><h4 className="font-bold text-blue-800">Sin Análisis</h4><p className="text-xs text-gray-600">Diagnóstico visual</p></div></button>
          </div>
        ) : !fertResult ? (
          <div className="space-y-4 animate-fade-in">
             <button onClick={() => setCalcMode(null)} className="text-xs text-gray-400 mb-2 flex items-center gap-1 hover:text-gray-600">&larr; Volver</button>
             {calcMode === 'analysis' ? (
               <div className="space-y-3">
                 <h4 className="font-bold text-gray-700">Ingresa valores (ppm o kg/ha)</h4>
                 <div><label className="text-xs text-gray-500">Nitrógeno (N)</label><input type="number" className="w-full p-2 border rounded-lg" value={soilAnalysis.n} onChange={e=>setSoilAnalysis({...soilAnalysis, n: e.target.value})} /></div>
                 <div><label className="text-xs text-gray-500">Fósforo (P)</label><input type="number" className="w-full p-2 border rounded-lg" value={soilAnalysis.p} onChange={e=>setSoilAnalysis({...soilAnalysis, p: e.target.value})} /></div>
                 <div><label className="text-xs text-gray-500">Potasio (K)</label><input type="number" className="w-full p-2 border rounded-lg" value={soilAnalysis.k} onChange={e=>setSoilAnalysis({...soilAnalysis, k: e.target.value})} /></div>
               </div>
             ) : (
               <div className="space-y-3">
                 <h4 className="font-bold text-gray-700">Diagnóstico Rápido</h4>
                 <div><label className="text-xs font-bold text-gray-600 block mb-1">Color de hojas</label><select className="w-full p-2 border rounded-lg text-sm" onChange={e=>setQuizAnswers({...quizAnswers, leaves: e.target.value})}><option value="">Seleccionar...</option><option value="green">Verde Oscuro (Sanas)</option><option value="yellow">Amarillentas (Clorosis)</option><option value="pale">Verde pálido</option></select></div>
                 <div><div className="flex justify-between items-center mb-1"><label className="text-xs font-bold text-gray-600">Tipo de Suelo</label><button onClick={() => setShowSoilGuide(true)} className="text-[10px] text-green-600 flex items-center gap-1 font-semibold hover:bg-green-50 px-2 py-0.5 rounded transition-colors"><HelpCircle size={12} /> Guía Visual</button></div><select className="w-full p-2 border rounded-lg text-sm" onChange={e=>setQuizAnswers({...quizAnswers, soil: e.target.value})}><option value="">Seleccionar...</option><option value="clay">Arcilloso</option><option value="loam">Franco</option><option value="sandy">Arenoso</option></select></div>
                 <div><label className="text-xs font-bold text-gray-600 block mb-1">Crecimiento</label><select className="w-full p-2 border rounded-lg text-sm" onChange={e=>setQuizAnswers({...quizAnswers, growth: e.target.value})}><option value="">Seleccionar...</option><option value="normal">Normal</option><option value="poor">Lento / Pobre</option></select></div>
               </div>
             )}
             <Button className="w-full mt-4" onClick={calculateFertilization}><Calculator size={18} /> Calcular</Button>
          </div>
        ) : (
          <div className="space-y-4 animate-fade-in">
             <div className="bg-green-50 p-3 rounded-lg border border-green-200"><h4 className="font-bold text-green-800 text-sm mb-1">Recomendación para {fertResult.hectaresUsed} Ha</h4><p className="text-xs text-green-600">{fertResult.method}</p></div>
             
             {/* Pestañas de Selección */}
             <div className="flex gap-2 mb-2">
                <button 
                  onClick={() => setFertTab('components')} 
                  className={`flex-1 py-1 text-xs rounded-lg transition-colors ${fertTab === 'components' ? 'bg-green-600 text-white font-bold' : 'bg-gray-100 text-gray-500'}`}>
                  Por Componentes
                </button>
                <button 
                  onClick={() => setFertTab('commercial')} 
                  className={`flex-1 py-1 text-xs rounded-lg transition-colors ${fertTab === 'commercial' ? 'bg-blue-600 text-white font-bold' : 'bg-gray-100 text-gray-500'}`}>
                  Alternativa Comercial
                </button>
             </div>

             {fertTab === 'components' ? (
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-gray-50 p-2 rounded-lg border border-gray-200"><p className="text-xs text-gray-500 font-bold">UREA</p><p className="text-xl font-bold text-gray-800">{fertResult.urea}</p><p className="text-[10px] text-gray-400">kg/ha</p><div className="mt-1 pt-1 border-t border-gray-200 text-xs text-green-700 font-bold">{fertResult.ureaSacks} Sacos</div></div>
                  <div className="bg-gray-50 p-2 rounded-lg border border-gray-200"><p className="text-xs text-gray-500 font-bold">DAP</p><p className="text-xl font-bold text-gray-800">{fertResult.dap}</p><p className="text-[10px] text-gray-400">kg/ha</p><div className="mt-1 pt-1 border-t border-gray-200 text-xs text-green-700 font-bold">{fertResult.dapSacks} Sacos</div></div>
                  <div className="bg-gray-50 p-2 rounded-lg border border-gray-200"><p className="text-xs text-gray-500 font-bold">KCl</p><p className="text-xl font-bold text-gray-800">{fertResult.kcl}</p><p className="text-[10px] text-gray-400">kg/ha</p><div className="mt-1 pt-1 border-t border-gray-200 text-xs text-green-700 font-bold">{fertResult.kclSacks} Sacos</div></div>
                </div>
             ) : (
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-200 text-center animate-fade-in">
                   <ShoppingBag size={32} className="mx-auto text-blue-600 mb-2"/>
                   <h3 className="font-bold text-blue-900 text-lg">Mix Cacao (10-30-10)</h3>
                   <p className="text-sm text-blue-700 mb-4">Fertilizante compuesto estándar</p>
                   <div className="bg-white rounded-lg p-3 inline-block shadow-sm px-8">
                      <span className="block text-3xl font-bold text-gray-800">{fertResult.commercialSacks}</span>
                      <span className="text-xs text-gray-500 font-bold uppercase">Sacos Totales (50kg)</span>
                   </div>
                   <p className="text-[10px] text-blue-400 mt-4">*Cálculo aproximado para cubrir requerimientos NPK globales.</p>
                </div>
             )}

             <div className="bg-amber-50 p-3 rounded-lg border border-amber-100 text-xs text-amber-800"><strong className="block mb-1 flex items-center gap-1"><Droplets size={12}/> Nota:</strong> Dividir en 2-3 aplicaciones (Inicio/Fin lluvias).</div>
             <Button variant="outline" className="w-full" onClick={resetCalculator}>Nueva Consulta</Button>
          </div>
        )}
      </Modal>
      
      <Modal isOpen={!!selectedWorker} onClose={() => setSelectedWorker(null)} title={`Detalle: ${selectedWorker?.name}`}><div className="space-y-5"><div className="bg-gray-50 p-3 rounded-lg border border-gray-200"><h4 className="font-bold text-gray-700 mb-2 text-sm flex items-center gap-2"><ClipboardList size={16}/> Tareas</h4><div className="space-y-2">{selectedWorker?.tasks.length > 0 ? selectedWorker.tasks.map(t => (<div key={t.id} className="flex justify-between items-start text-xs bg-white p-2 rounded border border-gray-100"><div><span className="font-semibold block">{t.title}</span>{t.completed ? <p className="text-gray-500 italic mt-1">Obs: "{t.observation}"</p> : <span className="text-amber-600">Pendiente</span>}</div>{t.completed ? <CheckCircle size={14} className="text-green-600"/> : <div className="w-3 h-3 rounded-full bg-amber-400"></div>}</div>)) : <p className="text-xs text-gray-400">Sin tareas asignadas.</p>}</div></div><div><h4 className="font-bold text-gray-700 mb-2 flex items-center gap-2 text-sm"><Sprout size={16} className="text-green-600"/> Análisis IA</h4><div className="bg-green-50 p-3 rounded-lg text-sm text-gray-700 leading-relaxed border border-green-100">{selectedWorker && getLLMReport(selectedWorker).summary}</div></div><div><h4 className="font-bold text-gray-700 mb-2 text-sm">Evidencia</h4><div className="grid grid-cols-2 gap-2">{selectedWorker && getLLMReport(selectedWorker).photos.map((url, i) => (<img key={i} src={url} alt="Evidencia" className="rounded-lg w-full h-24 object-cover" />))}</div></div><Button className="w-full mt-2" onClick={() => setSelectedWorker(null)}>Cerrar</Button></div></Modal>
      
      <Modal isOpen={showAddWorker || !!newUserCreated} onClose={() => {setShowAddWorker(false); setNewUserCreated(null);}} title={newUserCreated ? "Usuario Creado" : "Nuevo Usuario"}>
        {newUserCreated ? (
          <div className="space-y-6 text-center animate-fade-in">
            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto text-green-700"><ShieldCheck size={32}/></div>
            <div><h3 className="text-xl font-bold text-gray-800">{newUserCreated.name}</h3><p className="text-sm text-gray-500">Rol: {newUserCreated.role === 'worker' ? 'Jornalero' : 'Técnico'}</p></div>
            <div className="bg-gray-100 p-4 rounded-xl border border-gray-200"><p className="text-xs font-bold text-gray-500 uppercase mb-2">Código de Acceso (Compartir)</p><div className="text-3xl font-mono font-bold text-gray-800 tracking-widest">{newUserCreated.accessCode}</div></div>
            <p className="text-xs text-amber-600 bg-amber-50 p-2 rounded"><Info size={12} className="inline mr-1"/> Este código es único para iniciar sesión.</p>
            <Button className="w-full" onClick={() => setNewUserCreated(null)}>Entendido</Button>
          </div>
        ) : (
          <form onSubmit={handleAddWorker} className="space-y-4">
            <div><label className="text-xs font-bold text-gray-500 mb-1 block">Tipo de Usuario</label><div className="flex gap-2"><label className="flex-1 cursor-pointer"><input type="radio" name="role" value="worker" defaultChecked className="peer sr-only" /><div className="border-2 border-gray-200 peer-checked:border-green-500 peer-checked:bg-green-50 rounded-lg p-2 text-center transition-all"><User className="mx-auto mb-1 text-green-700" size={20} /><span className="text-xs font-bold text-gray-700">Jornalero</span></div></label><label className="flex-1 cursor-pointer"><input type="radio" name="role" value="tech" className="peer sr-only" /><div className="border-2 border-gray-200 peer-checked:border-blue-500 peer-checked:bg-blue-50 rounded-lg p-2 text-center transition-all"><UserCog className="mx-auto mb-1 text-blue-700" size={20} /><span className="text-xs font-bold text-gray-700">Técnico</span></div></label></div></div>
            <input name="name" type="text" className="w-full p-2 border border-gray-300 rounded-lg" placeholder="Nombre Completo" required />
            <input name="lot" type="text" className="w-full p-2 border border-gray-300 rounded-lg" placeholder="Lote / Zona Asignada" required />
            <Button className="w-full">Registrar y Generar Código</Button>
          </form>
        )}
      </Modal>

      <Modal isOpen={showMap} onClose={() => setShowMap(false)} title="Mapa de la Plantación">
          <div className="grid grid-cols-2 gap-4 p-2">
              {workers.map(w => (
                  <div key={w.id} className={`p-4 rounded-xl border-2 text-center relative ${w.hasIssues ? 'bg-red-50 border-red-500' : 'bg-green-50 border-green-500'}`}>
                      <div className="font-bold text-gray-700">{w.lot}</div>
                      <div className="text-xs text-gray-500">{w.name}</div>
                      {w.hasIssues && <AlertTriangle size={16} className="text-red-500 absolute top-2 right-2 animate-bounce"/>}
                  </div>
              ))}
              <div className="p-4 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 bg-gray-50 text-xs">Lote Vacío</div>
          </div>
          {/* DETALLE ALERTAS EN EL MISMO MODAL */}
          {workers.filter(w => w.hasIssues).length > 0 && (
            <div className="mt-6 border-t pt-4 animate-fade-in">
               <h4 className="font-bold text-gray-700 mb-2 flex items-center gap-2 text-sm"><AlertTriangle size={16} className="text-red-500"/> Detalle de Problemas</h4>
               <div className="space-y-2">
                  {workers.filter(w => w.hasIssues).map(w => (
                     <div key={w.id} className="bg-red-50 border border-red-200 p-3 rounded-lg flex justify-between items-center">
                        <div>
                           <span className="font-bold text-red-800 text-sm block">{w.lot} - {w.name}</span>
                           <span className="text-xs text-red-600">Reporte inusual detectado.</span>
                        </div>
                        <Button onClick={() => {setShowMap(false); setSelectedWorker(w);}} className="text-[10px] px-2 py-1 h-auto" variant="danger">Ver Reporte</Button>
                     </div>
                  ))}
               </div>
            </div>
          )}
          <div className="flex gap-4 mt-4 text-xs justify-center text-gray-500 border-t pt-2">
              <span className="flex items-center gap-1"><span className="w-3 h-3 bg-green-500 rounded-full"></span> Normal</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 bg-red-500 rounded-full"></span> Alerta</span>
          </div>
      </Modal>

      <Modal isOpen={showSoilGuide} onClose={() => setShowSoilGuide(false)} title="Guía de Suelos"><div className="space-y-4"><div className="bg-blue-50 p-3 rounded-lg flex gap-3 items-start border border-blue-100"><Info className="text-blue-600 shrink-0 mt-1" size={20} /><p className="text-xs text-blue-800 leading-relaxed"><strong>Prueba del Tacto:</strong> Toma tierra húmeda y trata de formar una cinta entre el pulgar e índice.</p></div><div className="space-y-3"><div className="flex gap-3 items-start border p-3 rounded-lg"><div className="bg-yellow-100 p-2 rounded text-yellow-800 font-bold text-[10px] w-20 text-center shrink-0">ARENOSO</div><div className="text-xs text-gray-600"><p className="font-bold text-gray-800">Áspero</p>No forma cinta, se desmorona.</div></div><div className="flex gap-3 items-start border p-3 rounded-lg"><div className="bg-green-100 p-2 rounded text-green-800 font-bold text-[10px] w-20 text-center shrink-0">FRANCO</div><div className="text-xs text-gray-600"><p className="font-bold text-gray-800">Suave</p>Forma bola pero la cinta se rompe.</div></div><div className="flex gap-3 items-start border p-3 rounded-lg"><div className="bg-red-100 p-2 rounded text-red-800 font-bold text-[10px] w-20 text-center shrink-0">ARCILLOSO</div><div className="text-xs text-gray-600"><p className="font-bold text-gray-800">Pegajoso</p>Forma cintas largas y flexibles.</div></div></div><Button onClick={() => setShowSoilGuide(false)} className="w-full mt-2">Entendido</Button></div></Modal>
    </div>
  );
}