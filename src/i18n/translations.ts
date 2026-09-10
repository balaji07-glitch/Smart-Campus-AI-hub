import { LanguageCode } from '../types';

export interface TranslationDictionary {
  appName: string;
  campusTagline: string;
  modules: {
    navigate: {
      title: string;
      subtitle: string;
      searchPlaceholder: string;
      accessibleRoute: string;
      audioGuidance: string;
      playAudio: string;
      pauseAudio: string;
      repeatStep: string;
      selectBuilding: string;
      selectFloor: string;
      turnByTurn: string;
      distance: string;
      estimatedTime: string;
      findNearest: string;
      washroom: string;
      exit: string;
      elevator: string;
      canteen: string;
      parking: string;
      startNavigation: string;
      destination: string;
      startPoint: string;
      accessibleNote: string;
    };
    ask: {
      title: string;
      subtitle: string;
      inputPlaceholder: string;
      askButton: string;
      voiceInput: string;
      listening: string;
      groundedNote: string;
      citedSource: string;
      verifiedBy: string;
      confidence: string;
      lowConfidenceWarning: string;
      createTicketButton: string;
      ticketModalTitle: string;
      ticketCreatedSuccess: string;
      suggestedQuestions: string;
    };
    collaborate: {
      title: string;
      subtitle: string;
      myProfile: string;
      aiMatches: string;
      directory: string;
      postProject: string;
      interests: string;
      skills: string;
      publications: string;
      importScholar: string;
      matchScore: string;
      whyMatched: string;
      sendInvite: string;
      filterDepartment: string;
      openForCollab: string;
    };
    attain: {
      title: string;
      subtitle: string;
      selectCourse: string;
      uploadData: string;
      attainmentThreshold: string;
      overallAttainment: string;
      interventionNeeded: string;
      coBreakdown: string;
      semesterTrend: string;
      studentDistribution: string;
      exportNbaReport: string;
      exportCsv: string;
      remedialActions: string;
    };
    admin: {
      title: string;
      subtitle: string;
      mapManager: string;
      kbManager: string;
      profileManager: string;
      ticketsManager: string;
      addRoom: string;
      uploadDoc: string;
      verifyStatus: string;
    };
  };
  common: {
    dashboard: string;
    login: string;
    logout: string;
    role: string;
    student: string;
    faculty: string;
    visitor: string;
    admin: string;
    language: string;
    highContrast: string;
    fontSize: string;
    fontSizeSm: string;
    fontSizeMd: string;
    fontSizeLg: string;
    fontSizeXl: string;
    quickLinks: string;
    recentActivity: string;
    close: string;
    cancel: string;
    save: string;
    submit: string;
    viewDetails: string;
    status: string;
    department: string;
  };
}

export const translations: Record<LanguageCode, TranslationDictionary> = {
  en: {
    appName: 'Smart Campus AI Hub',
    campusTagline: 'Intelligent Academic, Navigation & Collaboration Ecosystem',
    modules: {
      navigate: {
        title: 'Campus Navigator',
        subtitle: 'Indoor floor plans, outdoor corridors, and step-free accessible navigation',
        searchPlaceholder: 'Search rooms, faculty offices, labs, lecture halls...',
        accessibleRoute: 'Step-Free Accessible Route (Ramps & Elevators Only)',
        audioGuidance: 'Audio-Guided Narration for Visually Impaired',
        playAudio: 'Play Step Audio',
        pauseAudio: 'Pause Audio',
        repeatStep: 'Repeat Step',
        selectBuilding: 'Select Building',
        selectFloor: 'Floor',
        turnByTurn: 'Turn-by-Turn Directions',
        distance: 'Distance',
        estimatedTime: 'Estimated Walking Time',
        findNearest: 'Find Nearest Facility',
        washroom: 'Washroom (Accessible)',
        exit: 'Emergency Exit',
        elevator: 'Elevator / Lift',
        canteen: 'Canteen & Cafeteria',
        parking: 'Campus Parking',
        startNavigation: 'Navigate to Destination',
        destination: 'Destination',
        startPoint: 'Current Location',
        accessibleNote: 'Route optimized: 0 steps, tactile path compliant',
      },
      ask: {
        title: 'Ask Campus AI',
        subtitle: 'Strictly grounded institutional answers with verified document citations',
        inputPlaceholder: 'Ask about exam schedules, timetables, regulations, or facilities...',
        askButton: 'Send Query',
        voiceInput: 'Voice Dictation',
        listening: 'Listening... speak now',
        groundedNote: 'Answers derived solely from verified institutional documents with zero hallucination.',
        citedSource: 'Verified Source Document',
        verifiedBy: 'Verified By Registrar/Dean',
        confidence: 'Knowledge Confidence',
        lowConfidenceWarning: 'Confidence is below verified threshold. No fabricated guess will be made.',
        createTicketButton: 'Open Staff Helpdesk Ticket',
        ticketModalTitle: 'Submit Query to Institutional Helpdesk',
        ticketCreatedSuccess: 'Helpdesk ticket successfully dispatched to department staff.',
        suggestedQuestions: 'Frequently Asked Institutional Queries',
      },
      collaborate: {
        title: 'Research Collaborate',
        subtitle: 'AI-driven interdisciplinary matchmaking for faculty & student researchers',
        myProfile: 'Researcher Profile',
        aiMatches: 'AI Recommended Collaborators',
        directory: 'Researcher Directory',
        postProject: 'Post Research Requirement',
        interests: 'Research Interests',
        skills: 'Technical Skills & Lab Equipment',
        publications: 'Peer-Reviewed Publications',
        importScholar: 'Import from Google Scholar / ORCID',
        matchScore: 'Match Score',
        whyMatched: 'Why AI Matched This Researcher',
        sendInvite: 'Initiate Collaboration',
        filterDepartment: 'Filter by Department',
        openForCollab: 'Open for Collaboration',
      },
      attain: {
        title: 'Attain - Outcome Analytics',
        subtitle: 'Course Outcome (CO) Attainment calculations & NBA/NAAC accreditation reports',
        selectCourse: 'Select Course',
        uploadData: 'Upload Assessment Data (CSV / Manual)',
        attainmentThreshold: 'Attainment Benchmark Target',
        overallAttainment: 'Overall Course Attainment',
        interventionNeeded: 'Needs Instructional Intervention',
        coBreakdown: 'Course Outcome (CO) Performance Breakdown',
        semesterTrend: 'Semester Attainment Trend',
        studentDistribution: 'Student Performance Distribution',
        exportNbaReport: 'Export NBA / NAAC Accreditation Report (PDF)',
        exportCsv: 'Export Assessment Dataset (CSV)',
        remedialActions: 'Recommended Pedagogical Interventions',
      },
      admin: {
        title: 'Institution Admin Console',
        subtitle: 'Master control for map floor plans, verified documents, and accreditation records',
        mapManager: 'Map & Floor Plan Data',
        kbManager: 'Verified Knowledge Base',
        profileManager: 'Faculty & Research Profiles',
        ticketsManager: 'Staff Helpdesk Tickets',
        addRoom: 'Tag New Room / Facility',
        uploadDoc: 'Upload Verified Document',
        verifyStatus: 'Official Verification Status',
      },
    },
    common: {
      dashboard: 'Dashboard',
      login: 'Sign In',
      logout: 'Sign Out',
      role: 'Role',
      student: 'Student',
      faculty: 'Faculty',
      visitor: 'Visitor',
      admin: 'Administrator',
      language: 'Language',
      highContrast: 'High Contrast',
      fontSize: 'Font Size',
      fontSizeSm: 'Small',
      fontSizeMd: 'Normal',
      fontSizeLg: 'Large',
      fontSizeXl: 'Extra Large',
      quickLinks: 'Quick Links',
      recentActivity: 'System Activity',
      close: 'Close',
      cancel: 'Cancel',
      save: 'Save',
      submit: 'Submit',
      viewDetails: 'View Details',
      status: 'Status',
      department: 'Department',
    },
  },
  hi: {
    appName: 'स्मार्ट कैंपस AI हब',
    campusTagline: 'एकीकृत शैक्षणिक, नेविगेशन और अनुसंधान सहयोग मंच',
    modules: {
      navigate: {
        title: 'कैंपस नेविगेटर',
        subtitle: 'इनडोर फ़्लोर प्लान, आउटडोर गलियारे और सुलभ रैंप नेविगेशन',
        searchPlaceholder: 'कमरे, फैकल्टी कार्यालय, प्रयोगशालाएं खोजें...',
        accessibleRoute: 'सुलभ मार्ग (केवल रैंप और लिफ्ट, सीढ़ियां वर्जित)',
        audioGuidance: 'नेत्रहीनों के लिए ऑडियो-मार्गदर्शन',
        playAudio: 'ऑडियो चलाएं',
        pauseAudio: 'ऑडियो रोकें',
        repeatStep: 'पुनः सुनें',
        selectBuilding: 'भवन चुनें',
        selectFloor: 'मंजिल',
        turnByTurn: 'क्रमवार दिशा-निर्देश',
        distance: 'दूरी',
        estimatedTime: 'अनुमानित चलने का समय',
        findNearest: 'निकटतम सुविधा खोजें',
        washroom: 'शौचालय (सुलभ)',
        exit: 'आपातकालीन निकास',
        elevator: 'लिफ्ट',
        canteen: 'कैंटीन',
        parking: 'पार्किंग',
        startNavigation: 'दिशा-निर्देश शुरू करें',
        destination: 'गंतव्य',
        startPoint: 'वर्तमान स्थान',
        accessibleNote: 'मार्ग अनुकूलित: शून्य सीढ़ी, स्पर्शनीय मार्ग',
      },
      ask: {
        title: 'कैंपस चैटबॉट',
        subtitle: 'सत्यापित संस्थागत दस्तावेजों पर आधारित आधिकारिक उत्तर',
        inputPlaceholder: 'परीक्षा समय सारिणी, नियम या सुविधाओं के बारे में पूछें...',
        askButton: 'प्रश्न पूछें',
        voiceInput: 'आवाज से पूछें',
        listening: 'सुन रहा है... बोलिए',
        groundedNote: 'उत्तर केवल आधिकारिक सत्यापित दस्तावेजों से उद्धृत हैं।',
        citedSource: 'सत्यापित स्रोत दस्तावेज',
        verifiedBy: 'रजिस्ट्रार द्वारा सत्यापित',
        confidence: 'ज्ञान प्रामाणिकता',
        lowConfidenceWarning: 'आत्मविश्वास सीमा से कम है। कृपया हेल्पडेस्क से संपर्क करें।',
        createTicketButton: 'हेल्पडेस्क टिकट बनाएं',
        ticketModalTitle: 'संस्थागत हेल्पडेस्क पर प्रश्न भेजें',
        ticketCreatedSuccess: 'हेल्पडेस्क टिकट सफलतापूर्वक भेजा गया।',
        suggestedQuestions: 'अक्सर पूछे जाने वाले संस्थागत प्रश्न',
      },
      collaborate: {
        title: 'अनुसंधान सहयोग',
        subtitle: 'फैकल्टी और छात्रों के लिए AI-संचालित अनुसंधान मैचमेकिंग',
        myProfile: 'अनुसंधानकर्ता प्रोफाइल',
        aiMatches: 'AI अनुशंसित सहयोगी',
        directory: 'अनुसंधान निर्देशिका',
        postProject: 'अनुसंधान परियोजना पोस्ट करें',
        interests: 'अनुसंधान रुचियां',
        skills: 'कौशल और उपकरण',
        publications: 'शोध पत्र',
        importScholar: 'गूगल स्कॉलर / ORCID से आयात करें',
        matchScore: 'मैच स्कोर',
        whyMatched: 'AI मैचिंग का कारण',
        sendInvite: 'सहयोग आमंत्रण भेजें',
        filterDepartment: 'विभाग अनुसार फ़िल्टर',
        openForCollab: 'सहयोग हेतु उपलब्ध',
      },
      attain: {
        title: 'अटेन - परिणाम विश्लेषण',
        subtitle: 'कोर्स आउटकम (CO) प्राप्ति दर और NBA/NAAC मूल्यांकन रिपोर्ट',
        selectCourse: 'कोर्स चुनें',
        uploadData: 'मूल्यांकन डेटा अपलोड करें (CSV / मैनुअल)',
        attainmentThreshold: 'प्राप्ति लक्ष्य प्रतिशत',
        overallAttainment: 'कुल कोर्स प्राप्ति दर',
        interventionNeeded: 'शैक्षणिक हस्तक्षेप आवश्यक',
        coBreakdown: 'कोर्स आउटकम प्रदर्शन विवरण',
        semesterTrend: 'सेमेस्टर रुझान',
        studentDistribution: 'छात्र प्रदर्शन वितरण',
        exportNbaReport: 'NBA / NAAC मान्यता रिपोर्ट डाउनलोड करें',
        exportCsv: 'डेटासेट निर्यात करें (CSV)',
        remedialActions: 'सुझाए गए सुधारात्मक उपाय',
      },
      admin: {
        title: 'प्रशासक कंसोल',
        subtitle: 'मानचित्र डेटा, सत्यापित दस्तावेज और मान्यता रिकॉर्ड प्रबंधन',
        mapManager: 'मानचित्र और मंजिल डेटा',
        kbManager: 'सत्यापित ज्ञानकोष',
        profileManager: 'फैकल्टी प्रोफाइल प्रबंधन',
        ticketsManager: 'हेल्पडेस्क टिकट',
        addRoom: 'नया कमरा जोड़ें',
        uploadDoc: 'सत्यापित दस्तावेज अपलोड करें',
        verifyStatus: 'सत्यापन स्थिति',
      },
    },
    common: {
      dashboard: 'डैशबोर्ड',
      login: 'लॉग इन करें',
      logout: 'लॉग आउट',
      role: 'भूमिका',
      student: 'विद्यार्थी',
      faculty: 'फैकल्टी',
      visitor: 'अतिथि',
      admin: 'प्रशासक',
      language: 'भाषा',
      highContrast: 'उच्च कंट्रास्ट',
      fontSize: 'फ़ॉन्ट आकार',
      fontSizeSm: 'छोटा',
      fontSizeMd: 'सामान्य',
      fontSizeLg: 'बड़ा',
      fontSizeXl: 'अति बड़ा',
      quickLinks: 'त्वरित लिंक',
      recentActivity: 'हाल की गतिविधि',
      close: 'बंद करें',
      cancel: 'रद्द करें',
      save: 'सहेजें',
      submit: 'जमा करें',
      viewDetails: 'विवरण देखें',
      status: 'स्थिति',
      department: 'विभाग',
    },
  },
  es: {
    appName: 'Smart Campus AI Hub',
    campusTagline: 'Ecosistema Inteligente de Navegación, Respuestas y Colaboración',
    modules: {
      navigate: {
        title: 'Navegador del Campus',
        subtitle: 'Planos de planta interactivos, pasillos y rutas accesibles sin escaleras',
        searchPlaceholder: 'Buscar aulas, laboratorios, oficinas de profesores...',
        accessibleRoute: 'Ruta Accesible (Solo rampas y elevadores, sin escaleras)',
        audioGuidance: 'Narración de audio para personas con discapacidad visual',
        playAudio: 'Reproducir audio',
        pauseAudio: 'Pausar audio',
        repeatStep: 'Repetir paso',
        selectBuilding: 'Seleccionar Edificio',
        selectFloor: 'Piso',
        turnByTurn: 'Direcciones paso a paso',
        distance: 'Distancia',
        estimatedTime: 'Tiempo estimado',
        findNearest: 'Encontrar más cercano',
        washroom: 'Baño (Accesible)',
        exit: 'Salida de emergencia',
        elevator: 'Elevador / Ascensor',
        canteen: 'Cafetería',
        parking: 'Estacionamiento',
        startNavigation: 'Comenzar ruta',
        destination: 'Destino',
        startPoint: 'Punto de partida',
        accessibleNote: 'Ruta 100% libre de barreras arquitectónicas',
      },
      ask: {
        title: 'Asistente IA del Campus',
        subtitle: 'Respuestas institucionales verificadas con fuentes citadas',
        inputPlaceholder: 'Pregunte sobre horarios, exámenes, reglamentos o instalaciones...',
        askButton: 'Enviar consulta',
        voiceInput: 'Dictado por voz',
        listening: 'Escuchando... hable ahora',
        groundedNote: 'Respuestas generadas estrictamente de documentos oficiales sin inventar datos.',
        citedSource: 'Documento fuente verificado',
        verifiedBy: 'Verificado por Secretaría Académica',
        confidence: 'Nivel de confianza',
        lowConfidenceWarning: 'Bajo nivel de coincidencia en base oficial. Puede abrir un ticket con personal humano.',
        createTicketButton: 'Crear ticket de ayuda',
        ticketModalTitle: 'Enviar consulta al soporte institucional',
        ticketCreatedSuccess: 'Ticket de ayuda enviado con éxito al departamento.',
        suggestedQuestions: 'Preguntas frecuentes de la universidad',
      },
      collaborate: {
        title: 'Colaboración en Investigación',
        subtitle: 'Motor IA de afinidad interdisciplinaria para docentes y alumnos',
        myProfile: 'Perfil de Investigador',
        aiMatches: 'Colaboradores recomendados por IA',
        directory: 'Directorio de Investigadores',
        postProject: 'Publicar Proyecto / Requisito',
        interests: 'Áreas de investigación',
        skills: 'Habilidades y herramientas',
        publications: 'Publicaciones científicas',
        importScholar: 'Importar desde Google Scholar / ORCID',
        matchScore: 'Afinidad IA',
        whyMatched: 'Por qué la IA sugiere esta colaboración',
        sendInvite: 'Enviar propuesta de colaboración',
        filterDepartment: 'Filtrar por Departamento',
        openForCollab: 'Disponible para colaborar',
      },
      attain: {
        title: 'Attain - Logro de Competencias',
        subtitle: 'Cálculo de Course Outcomes (CO) y reportes de acreditación NBA/NAAC',
        selectCourse: 'Seleccionar Asignatura',
        uploadData: 'Cargar Datos de Evaluación (CSV / Manual)',
        attainmentThreshold: 'Umbral meta de logro',
        overallAttainment: 'Logro global del curso',
        interventionNeeded: 'Requiere intervención pedagógica',
        coBreakdown: 'Desglose por Resultado de Aprendizaje (CO)',
        semesterTrend: 'Tendencia semestral',
        studentDistribution: 'Distribución de rendimiento',
        exportNbaReport: 'Exportar Reporte de Acreditación (PDF)',
        exportCsv: 'Exportar Conjunto de Datos (CSV)',
        remedialActions: 'Intervenciones pedagógicas sugeridas',
      },
      admin: {
        title: 'Consola de Administración',
        subtitle: 'Gestión central de planos, base de conocimiento y registros',
        mapManager: 'Planos y Datos de Mapa',
        kbManager: 'Base de Conocimiento Verificada',
        profileManager: 'Perfiles de Investigación',
        ticketsManager: 'Tickets de Ayuda',
        addRoom: 'Registrar nueva sala',
        uploadDoc: 'Subir documento oficial',
        verifyStatus: 'Estado de verificación',
      },
    },
    common: {
      dashboard: 'Panel Principal',
      login: 'Iniciar Sesión',
      logout: 'Cerrar Sesión',
      role: 'Rol',
      student: 'Estudiante',
      faculty: 'Profesor/a',
      visitor: 'Visitante',
      admin: 'Administrador',
      language: 'Idioma',
      highContrast: 'Alto Contraste',
      fontSize: 'Tamaño de Fuente',
      fontSizeSm: 'Pequeño',
      fontSizeMd: 'Normal',
      fontSizeLg: 'Grande',
      fontSizeXl: 'Muy Grande',
      quickLinks: 'Enlaces rápidos',
      recentActivity: 'Actividad reciente',
      close: 'Cerrar',
      cancel: 'Cancelar',
      save: 'Guardar',
      submit: 'Enviar',
      viewDetails: 'Ver detalles',
      status: 'Estado',
      department: 'Departamento',
    },
  },
  ta: {
    appName: 'ஸ்மார்ட் கேம்பஸ் AI மையம்',
    campusTagline: 'ஒருங்கிணைந்த கல்வி, வழிசெலுத்தல் மற்றும் ஆராய்ச்சி ஒத்துழைப்பு அமைப்பு',
    modules: {
      navigate: {
        title: 'வளாக வழிசெலுத்தி',
        subtitle: 'உட்புற வரைபடங்கள், நடைபாதைகள் மற்றும் மாற்றுத்திறனாளி அணுகல் வசதி',
        searchPlaceholder: 'அறைகள், ஆய்வகங்கள், ஆசிரியர்கள் அலுவலகங்களை தேடுங்கள்...',
        accessibleRoute: 'படி-இல்லா பாதை (ராம்ப் மற்றும் லிஃப்ட் மட்டும்)',
        audioGuidance: 'பார்வை குறைபாடுடையோருக்கான ஆடியோ வழிகாட்டி',
        playAudio: 'ஆடியோவை இயக்கு',
        pauseAudio: 'ஆடியோவை நிறுத்து',
        repeatStep: 'மீண்டும் சொல்',
        selectBuilding: 'கட்டிடத்தை தேர்வுசெய்க',
        selectFloor: 'தளம்',
        turnByTurn: 'படிநிலை வழிகாட்டுதல்',
        distance: 'தூரம்',
        estimatedTime: 'நடை நேரம்',
        findNearest: 'அருகிலுள்ள வசதியை கண்டுபிடி',
        washroom: 'கழிவறை (அணுகக்கூடியது)',
        exit: 'அவசர வெளியேற்றம்',
        elevator: 'மின் தூக்கி / லிஃப்ட்',
        canteen: 'உணவகம்',
        parking: 'வாகனம் நிறுத்துமிடம்',
        startNavigation: 'வழிகாட்டுதலை தொடங்கு',
        destination: 'இலக்கு',
        startPoint: 'தற்போதைய இடம்',
        accessibleNote: 'படிக்கட்டுகள் இல்லை, மென்மையான அணுகல் பாதை',
      },
      ask: {
        title: 'கேம்பஸ் AI சாட்பாட்',
        subtitle: 'அங்கீகரிக்கப்பட்ட ஆவணங்களுடன் கூடிய துல்லியமான பதில்கள்',
        inputPlaceholder: 'தேர்வு அட்டவணை, விதிமுறைகள் அல்லது வசதிகள் பற்றி கேளுங்கள்...',
        askButton: 'கேள்வி அனுப்பு',
        voiceInput: 'குரல் உள்ளீடு',
        listening: 'கேட்கிறது... பேசுங்கள்',
        groundedNote: 'பதில்கள் அதிகாரப்பூர்வ ஆவணங்களிலிருந்து மட்டுமே மேற்கோள் காட்டப்படுகின்றன.',
        citedSource: 'சான்றளிக்கப்பட்ட ஆவணம்',
        verifiedBy: 'பதிவாளர் சரிபார்த்தார்',
        confidence: 'அறிவுத்திறன் நம்பிக்கை',
        lowConfidenceWarning: 'தகவல் அதிகாரப்பூர்வ தளத்தில் இல்லை. உதவி மையத்தை தொடர்பு கொள்ளலாம்.',
        createTicketButton: 'உதவி மைய டிக்கெட் பதிவு செய்க',
        ticketModalTitle: 'உதவி மையத்திற்கு கேள்வி அனுப்புக',
        ticketCreatedSuccess: 'உதவி மையம் உங்கள் கேள்வியை வெற்றிகரமாக பெற்றுக்கொண்டது.',
        suggestedQuestions: 'அடிக்கடி கேட்கப்படும் கேள்விகள்',
      },
      collaborate: {
        title: 'ஆராய்ச்சி கூட்டமைப்பு',
        subtitle: 'ஆசிரியர்கள் மற்றும் மாணவர்களுக்கான AI ஆராய்ச்சி இணைப்பாளர்',
        myProfile: 'ஆராய்ச்சியாளர் விவரக்குறிப்பு',
        aiMatches: 'AI பரிந்துரைக்கும் ஆராய்ச்சியாளர்கள்',
        directory: 'ஆராய்ச்சி வழிகாட்டி',
        postProject: 'ஆராய்ச்சி திட்டத்தை பதிவிடு',
        interests: 'ஆராய்ச்சி ஆர்வங்கள்',
        skills: 'திறன்கள் மற்றும் கருவிகள்',
        publications: 'வெளியிடப்பட்ட ஆய்வுக் கட்டுரைகள்',
        importScholar: 'Google Scholar / ORCID இலிருந்து இறக்குமதி செய்க',
        matchScore: 'பொருத்தம் மதிப்பெண்',
        whyMatched: 'AI பொருந்தியதற்கான காரணம்',
        sendInvite: 'கூட்டு அழைப்பு அனுப்புக',
        filterDepartment: 'துறை வாரியாக வடிகட்டு',
        openForCollab: 'ஒத்துழைப்புக்கு தயார்',
      },
      attain: {
        title: 'அட்டெயின் - கல்வி அடைவு',
        subtitle: 'பாட அடைவு (CO) சதவீதம் மற்றும் NBA/NAAC அங்கீகார அறிக்கை',
        selectCourse: 'பாடத்தைத் தேர்ந்தெடு',
        uploadData: 'மதிப்பீட்டு தரவு பதிவேற்றம் (CSV / கையேடு)',
        attainmentThreshold: 'அடைவு இலக்கு சதவீதம்',
        overallAttainment: 'ஒட்டுமொத்த பாட அடைவு',
        interventionNeeded: 'சிறப்பு கல்வி தலையீடு தேவை',
        coBreakdown: 'பாட அடைவு (CO) விவரங்கள்',
        semesterTrend: 'செமஸ்டர் அடைவு போக்கு',
        studentDistribution: 'மாணவர் செயல்திறன் விநியோகம்',
        exportNbaReport: 'NBA / NAAC அங்கீகார அறிக்கை பதிவிறக்குக',
        exportCsv: 'தரவுத்தொகுப்பை ஏற்றுமதி செய்க (CSV)',
        remedialActions: 'பரிந்துரைக்கப்படும் கற்பித்தல் நடவடிக்கைகள்',
      },
      admin: {
        title: 'நிர்வாக கன்சோல்',
        subtitle: 'வரைபடம், ஆவணங்கள் மற்றும் அங்கீகார பதிவுகள் மேலாண்மை',
        mapManager: 'வரைபடம் மற்றும் தள தரவு',
        kbManager: 'அங்கீகரிக்கப்பட்ட அறிவுத்தளம்',
        profileManager: 'ஆராய்ச்சி சுயவிவர மேலாண்மை',
        ticketsManager: 'உதவி மைய டிக்கெட்டுகள்',
        addRoom: 'புதிய அறையை இணைக்க',
        uploadDoc: 'அதிகாரப்பூர்வ ஆவணம் பதிவேற்றுக',
        verifyStatus: 'சரிபார்ப்பு நிலை',
      },
    },
    common: {
      dashboard: 'முகப்பு பலகை',
      login: 'உள்நுழைக',
      logout: 'வெளியேறு',
      role: 'பங்கு',
      student: 'மாணவர்',
      faculty: 'ஆசிரியர்',
      visitor: 'பார்வையாளர்',
      admin: 'நிர்வாகி',
      language: 'மொழி',
      highContrast: 'அதிக மாறுபாடு',
      fontSize: 'எழுத்துரு அளவு',
      fontSizeSm: 'சிறிய',
      fontSizeMd: 'சாதாரண',
      fontSizeLg: 'பெரிய',
      fontSizeXl: 'மிகப் பெரிய',
      quickLinks: 'விரைவு இணைப்புகள்',
      recentActivity: 'சமீபத்திய செயல்பாடு',
      close: 'மூடு',
      cancel: 'ரத்து செய்',
      save: 'சேமி',
      submit: 'சமர்ப்பி',
      viewDetails: 'விவரங்களை காண்க',
      status: 'நிலை',
      department: 'துறை',
    },
  },
};
