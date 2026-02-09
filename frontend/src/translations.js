import { useState, useEffect } from 'react';

// 翻译字典
export const translations = {
  en: {
    // 导航栏
    appTitle: '🎫 IT Ticketing System',
    dashboard: 'Dashboard',
    ticketList: 'Tickets',
    createTicket: 'New Ticket',
    knowledge: 'Knowledge Base',
    
    // 工单表单
    title: 'Title',
    description: 'Description',
    category: 'Category',
    priority: 'Priority',
    status: 'Status',
    submit: 'Submit',
    cancel: 'Cancel',
    save: 'Save',
    
    // 分类
    categories: {
      hardware: 'Hardware',
      software: 'Software',
      network: 'Network',
      permission: 'Permission',
      other: 'Other'
    },
    
    // 优先级
    priorities: {
      low: 'Low',
      medium: 'Medium',
      high: 'High',
      urgent: 'Urgent'
    },
    
    // 状态
    statuses: {
      pending: 'Pending',
      in_progress: 'In Progress',
      resolved: 'Resolved',
      closed: 'Closed'
    },
    
    // 其他常用词
    loading: 'Loading...',
    search: 'Search',
    filter: 'Filter',
    export: 'Export',
    details: 'Details',
    created: 'Created',
    updated: 'Updated',
    assignedTo: 'Assigned To',
    createdBy: 'Created By',

    // Dashboard
    loadDataError: 'Failed to load data',
    dashboardTitle: '📊 Statistics Dashboard',
    totalTickets: 'Total Tickets',
    completed: 'Completed',
    categoryDistribution: '📁 Category Distribution',
    priorityDistribution: '⚠️ Priority Distribution',
    urgentTickets: 'Urgent Tickets',
    highPriority: 'High Priority',
    mediumPriority: 'Medium Priority',
    lowPriority: 'Low Priority',
    alertUrgentWithCount: '⚠️ Warning: {count} urgent ticket(s) need immediate attention!',
    alertPendingWithCount: '📌 Tip: {count} ticket(s) pending, assign them as soon as possible.',

    // TicketList
    loadTicketsError: 'Failed to load tickets',
    retry: 'Retry',
    ticketListTitle: '📋 Ticket List',
    refresh: 'Refresh',
    searchPlaceholder: 'Search by title, description or ticket number...',
    allStatus: 'All statuses',
    allCategories: 'All categories',
    allPriorities: 'All priorities',
    showingTickets: 'Showing {filtered} of {total} tickets',
    noTicketsHint: 'No tickets yet. Click "New Ticket" to create your first one!',
    noMatchingTickets: 'No matching tickets',
    createdAt: 'Created',

    // CreateTicket
    createTicketTitle: '✍️ Create New Ticket',
    ticketTitleLabel: 'Ticket Title',
    titlePlaceholder: 'Brief description, e.g. Cannot connect to WiFi',
    descriptionLabel: 'Description',
    descriptionPlaceholder: 'Describe the issue in detail, including error messages and what you tried...',
    categoryLabel: 'Category',
    priorityLabel: 'Priority',
    lowDesc: 'Low - No impact on work',
    mediumDesc: 'Medium - Minor impact',
    highDesc: 'High - Significant impact',
    urgentDesc: 'Urgent - Cannot work',
    employeeId: 'Employee ID',
    employeeName: 'Employee Name',
    department: 'Department',
    employeeIdHelper: 'Used to identify the submitter',
    submitTicket: 'Submit Ticket',
    submitting: 'Submitting...',
    createSuccess: '✅ Ticket created! AI is analyzing...',
    fillTitleDesc: 'Please fill in title and description',
    createFailed: 'Failed to create ticket',
    createTicketTip: '💡 After submitting, AI will analyze your issue and provide suggestions.',

    // TicketDetail
    ticketNotFound: 'Ticket not found or deleted',
    backToList: 'Back to List',
    ticketDetailTitle: 'Ticket Detail',
    resolutionLabel: 'Resolution:',
    aiSuggestions: '🤖 AI Suggestions',
    suggestedCategory: 'Suggested category:',
    confidence: 'Confidence',
    solutionSuggestion: 'Solution suggestion:',
    aiAnalyzing: 'AI is analyzing, please wait... (about 10-20 seconds)',
    ticketInfo: 'Ticket Info',
    submitter: 'Submitter',
    employeeIdShort: 'ID',
    departmentShort: 'Department',
    assignee: 'Assignee',
    assignTicket: 'Assign Ticket',
    markResolved: 'Mark Resolved',
    closeTicket: 'Close Ticket',
    assignDialogTitle: 'Assign Ticket',
    selectITPerson: 'Select IT staff',
    confirmAssign: 'Confirm Assign',
    resolveDialogTitle: 'Mark as Resolved',
    resolutionNotesLabel: 'Resolution notes',
    resolutionNotesPlaceholder: 'Describe how the issue was resolved...',
    confirmResolve: 'Confirm Resolve',
    closeDialogTitle: 'Close Ticket',
    closeConfirmText: 'Are you sure you want to close this ticket? It cannot be modified after closing.',
    confirmClose: 'Confirm Close',
    pleaseSelectIT: 'Please select IT staff',
    pleaseFillResolution: 'Please fill in resolution notes',
    assignSuccess: '✅ Ticket assigned successfully!',
    assignFailed: 'Assign failed',
    resolveSuccess: '✅ Ticket marked as resolved!',
    operationFailed: 'Operation failed',
    closeSuccess: '✅ Ticket closed!',
    closeFailed: 'Close failed',
    loadTicketFailed: 'Failed to load ticket',

    // KnowledgeBase
    loadKnowledgeError: 'Failed to load knowledge base',
    knowledgeTitle: '📚 Knowledge Base',
    newDoc: 'New Document',
    totalDocs: '{count} document(s) in knowledge base',
    noKnowledgeHint: 'No documents yet. Click "New Document" to add!',
    edit: 'Edit',
    delete: 'Delete',
    usageCount: 'Usage',
    successRate: 'Success rate',
    createDialogTitle: 'New Knowledge Document',
    contentLabel: 'Content',
    contentPlaceholder: 'Describe the solution in detail...',
    tagsLabel: 'Tags',
    tagsPlaceholder: 'Separate with commas, e.g. printer, HP, color',
    vectorTip: '💡 Vectors will be generated automatically for AI recommendations',
    creating: 'Creating...',
    createBtn: 'Create',
    createSuccessKb: 'Document created! Vectors generated.',
    createFailedKb: 'Create failed',
    editDialogTitle: 'Edit Knowledge Document',
    saving: 'Saving...',
    updateSuccessKb: 'Document updated! Vectors regenerated.',
    updateFailedKb: 'Update failed',
    deleteConfirmTitle: 'Confirm Delete',
    deleteConfirmText: 'Are you sure you want to delete "{title}"? This cannot be undone.',
    deleting: 'Deleting...',
    confirmDelete: 'Confirm Delete',
    deleteSuccessKb: 'Document deleted!',
    deleteFailedKb: 'Delete failed'
  },

  fr: {
    // 导航栏
    appTitle: '🎫 Système de Tickets IT',
    dashboard: 'Tableau de Bord',
    ticketList: 'Tickets',
    createTicket: 'Nouveau Ticket',
    knowledge: 'Base de Connaissances',
    
    // 工单表单
    title: 'Titre',
    description: 'Description',
    category: 'Catégorie',
    priority: 'Priorité',
    status: 'Statut',
    submit: 'Soumettre',
    cancel: 'Annuler',
    save: 'Enregistrer',
    
    // 分类
    categories: {
      hardware: 'Matériel',
      software: 'Logiciel',
      network: 'Réseau',
      permission: 'Permission',
      other: 'Autre'
    },
    
    // 优先级
    priorities: {
      low: 'Faible',
      medium: 'Moyen',
      high: 'Élevé',
      urgent: 'Urgent'
    },
    
    // 状态
    statuses: {
      pending: 'En Attente',
      in_progress: 'En Cours',
      resolved: 'Résolu',
      closed: 'Fermé'
    },
    
    // 其他常用词
    loading: 'Chargement...',
    search: 'Rechercher',
    filter: 'Filtrer',
    export: 'Exporter',
    details: 'Détails',
    created: 'Créé',
    updated: 'Mis à jour',
    assignedTo: 'Assigné à',
    createdBy: 'Créé par',

    // Dashboard
    loadDataError: 'Échec du chargement des données',
    dashboardTitle: '📊 Tableau de bord',
    totalTickets: 'Total des tickets',
    completed: 'Terminés',
    categoryDistribution: '📁 Répartition par catégorie',
    priorityDistribution: '⚠️ Répartition par priorité',
    urgentTickets: 'Tickets urgents',
    highPriority: 'Priorité haute',
    mediumPriority: 'Priorité moyenne',
    lowPriority: 'Priorité basse',
    alertUrgentWithCount: '⚠️ Attention : {count} ticket(s) urgent(s) à traiter immédiatement !',
    alertPendingWithCount: '📌 {count} ticket(s) en attente, à assigner au plus tôt.',

    // TicketList
    loadTicketsError: 'Échec du chargement des tickets',
    retry: 'Réessayer',
    ticketListTitle: '📋 Liste des tickets',
    refresh: 'Actualiser',
    searchPlaceholder: 'Rechercher par titre, description ou numéro...',
    allStatus: 'Tous les statuts',
    allCategories: 'Toutes les catégories',
    allPriorities: 'Toutes les priorités',
    showingTickets: 'Affichage de {filtered} sur {total} tickets',
    noTicketsHint: 'Aucun ticket. Cliquez sur "Nouveau Ticket" pour en créer un !',
    noMatchingTickets: 'Aucun ticket correspondant',
    createdAt: 'Créé le',

    // CreateTicket
    createTicketTitle: '✍️ Nouveau ticket',
    ticketTitleLabel: 'Titre du ticket',
    titlePlaceholder: 'Brève description, ex. Impossible de se connecter au WiFi',
    descriptionLabel: 'Description',
    descriptionPlaceholder: 'Décrivez le problème en détail, messages d\'erreur, ce que vous avez essayé...',
    categoryLabel: 'Catégorie',
    priorityLabel: 'Priorité',
    lowDesc: 'Faible - Pas d\'impact',
    mediumDesc: 'Moyen - Impact mineur',
    highDesc: 'Élevé - Impact important',
    urgentDesc: 'Urgent - Travail impossible',
    employeeId: 'Matricule',
    employeeName: 'Nom',
    department: 'Département',
    employeeIdHelper: 'Pour identifier le demandeur',
    submitTicket: 'Soumettre',
    submitting: 'Envoi...',
    createSuccess: '✅ Ticket créé ! L\'IA analyse...',
    fillTitleDesc: 'Veuillez remplir le titre et la description',
    createFailed: 'Échec de la création',
    createTicketTip: '💡 Après envoi, l\'IA analysera et proposera des solutions.',

    // TicketDetail
    ticketNotFound: 'Ticket introuvable ou supprimé',
    backToList: 'Retour à la liste',
    ticketDetailTitle: 'Détail du ticket',
    resolutionLabel: 'Solution :',
    aiSuggestions: '🤖 Suggestions IA',
    suggestedCategory: 'Catégorie suggérée :',
    confidence: 'Confiance',
    solutionSuggestion: 'Solution suggérée :',
    aiAnalyzing: 'L\'IA analyse, veuillez patienter... (10-20 secondes)',
    ticketInfo: 'Infos ticket',
    submitter: 'Demandeur',
    employeeIdShort: 'Matricule',
    departmentShort: 'Département',
    assignee: 'Assigné à',
    assignTicket: 'Assigner',
    markResolved: 'Marquer résolu',
    closeTicket: 'Fermer le ticket',
    assignDialogTitle: 'Assigner le ticket',
    selectITPerson: 'Choisir un technicien',
    confirmAssign: 'Confirmer l\'assignation',
    resolveDialogTitle: 'Marquer comme résolu',
    resolutionNotesLabel: 'Notes de résolution',
    resolutionNotesPlaceholder: 'Décrivez comment le problème a été résolu...',
    confirmResolve: 'Confirmer',
    closeDialogTitle: 'Fermer le ticket',
    closeConfirmText: 'Fermer ce ticket ? Il ne pourra plus être modifié.',
    confirmClose: 'Confirmer la fermeture',
    pleaseSelectIT: 'Veuillez choisir un technicien',
    pleaseFillResolution: 'Veuillez remplir les notes de résolution',
    assignSuccess: '✅ Ticket assigné !',
    assignFailed: 'Échec de l\'assignation',
    resolveSuccess: '✅ Ticket marqué résolu !',
    operationFailed: 'Échec de l\'opération',
    closeSuccess: '✅ Ticket fermé !',
    closeFailed: 'Échec de la fermeture',
    loadTicketFailed: 'Échec du chargement du ticket',

    // KnowledgeBase
    loadKnowledgeError: 'Échec du chargement de la base de connaissances',
    knowledgeTitle: '📚 Base de connaissances',
    newDoc: 'Nouveau document',
    totalDocs: '{count} document(s) dans la base',
    noKnowledgeHint: 'Aucun document. Cliquez sur "Nouveau document" pour ajouter !',
    edit: 'Modifier',
    delete: 'Supprimer',
    usageCount: 'Utilisations',
    successRate: 'Taux de succès',
    createDialogTitle: 'Nouveau document',
    contentLabel: 'Contenu',
    contentPlaceholder: 'Décrivez la solution en détail...',
    tagsLabel: 'Tags',
    tagsPlaceholder: 'Séparés par des virgules, ex. imprimante, HP',
    vectorTip: '💡 Les vecteurs seront générés pour les recommandations IA',
    creating: 'Création...',
    createBtn: 'Créer',
    createSuccessKb: 'Document créé ! Vecteurs générés.',
    createFailedKb: 'Échec de la création',
    editDialogTitle: 'Modifier le document',
    saving: 'Enregistrement...',
    updateSuccessKb: 'Document mis à jour ! Vecteurs régénérés.',
    updateFailedKb: 'Échec de la mise à jour',
    deleteConfirmTitle: 'Confirmer la suppression',
    deleteConfirmText: 'Supprimer "{title}" ? Cette action est irréversible.',
    deleting: 'Suppression...',
    confirmDelete: 'Confirmer la suppression',
    deleteSuccessKb: 'Document supprimé !',
    deleteFailedKb: 'Échec de la suppression'
  },

  nl: {
    // 导航栏
    appTitle: '🎫 IT Ticket Systeem',
    dashboard: 'Dashboard',
    ticketList: 'Tickets',
    createTicket: 'Nieuw Ticket',
    knowledge: 'Kennisbank',
    
    // 工单表单
    title: 'Titel',
    description: 'Beschrijving',
    category: 'Categorie',
    priority: 'Prioriteit',
    status: 'Status',
    submit: 'Indienen',
    cancel: 'Annuleren',
    save: 'Opslaan',
    
    // 分类
    categories: {
      hardware: 'Hardware',
      software: 'Software',
      network: 'Netwerk',
      permission: 'Toestemming',
      other: 'Andere'
    },
    
    // 优先级
    priorities: {
      low: 'Laag',
      medium: 'Gemiddeld',
      high: 'Hoog',
      urgent: 'Dringend'
    },
    
    // 状态
    statuses: {
      pending: 'In Afwachting',
      in_progress: 'In Behandeling',
      resolved: 'Opgelost',
      closed: 'Gesloten'
    },
    
    // 其他常用词
    loading: 'Laden...',
    search: 'Zoeken',
    filter: 'Filteren',
    export: 'Exporteren',
    details: 'Details',
    created: 'Gemaakt',
    updated: 'Bijgewerkt',
    assignedTo: 'Toegewezen aan',
    createdBy: 'Gemaakt door',

    // Dashboard
    loadDataError: 'Gegevens laden mislukt',
    dashboardTitle: '📊 Statistieken dashboard',
    totalTickets: 'Totaal tickets',
    completed: 'Voltooid',
    categoryDistribution: '📁 Verdeling per categorie',
    priorityDistribution: '⚠️ Verdeling prioriteit',
    urgentTickets: 'Urgente tickets',
    highPriority: 'Hoge prioriteit',
    mediumPriority: 'Gemiddelde prioriteit',
    lowPriority: 'Lage prioriteit',
    alertUrgentWithCount: '⚠️ Let op: {count} urgent(e) ticket(s) hebben directe aandacht nodig!',
    alertPendingWithCount: '📌 Tip: {count} ticket(s) in afwachting, wijs ze zo snel mogelijk toe.',

    // TicketList
    loadTicketsError: 'Tickets laden mislukt',
    retry: 'Opnieuw',
    ticketListTitle: '📋 Ticketlijst',
    refresh: 'Vernieuwen',
    searchPlaceholder: 'Zoek op titel, beschrijving of ticketnummer...',
    allStatus: 'Alle statussen',
    allCategories: 'Alle categorieën',
    allPriorities: 'Alle prioriteiten',
    showingTickets: 'Toont {filtered} van {total} tickets',
    noTicketsHint: 'Nog geen tickets. Klik op "Nieuw Ticket" om te beginnen!',
    noMatchingTickets: 'Geen overeenkomende tickets',
    createdAt: 'Gemaakt',

    // CreateTicket
    createTicketTitle: '✍️ Nieuw ticket',
    ticketTitleLabel: 'Ticket titel',
    titlePlaceholder: 'Korte omschrijving, bijv. Geen WiFi-verbinding',
    descriptionLabel: 'Beschrijving',
    descriptionPlaceholder: 'Beschrijf het probleem, foutmeldingen en wat u heeft geprobeerd...',
    categoryLabel: 'Categorie',
    priorityLabel: 'Prioriteit',
    lowDesc: 'Laag - Geen impact',
    mediumDesc: 'Gemiddeld - Beperkte impact',
    highDesc: 'Hoog - Grote impact',
    urgentDesc: 'Dringend - Kan niet werken',
    employeeId: 'Personeelsnummer',
    employeeName: 'Naam',
    department: 'Afdeling',
    employeeIdHelper: 'Om de indiener te identificeren',
    submitTicket: 'Indienen',
    submitting: 'Bezig...',
    createSuccess: '✅ Ticket aangemaakt! AI analyseert...',
    fillTitleDesc: 'Vul titel en beschrijving in',
    createFailed: 'Ticket aanmaken mislukt',
    createTicketTip: '💡 Na indienen analyseert de AI uw probleem en geeft suggesties.',

    // TicketDetail
    ticketNotFound: 'Ticket niet gevonden of verwijderd',
    backToList: 'Terug naar lijst',
    ticketDetailTitle: 'Ticket details',
    resolutionLabel: 'Oplossing:',
    aiSuggestions: '🤖 AI suggesties',
    suggestedCategory: 'Voorgestelde categorie:',
    confidence: 'Betrouwbaarheid',
    solutionSuggestion: 'Oplossingssuggestie:',
    aiAnalyzing: 'AI analyseert, even geduld... (ca. 10-20 seconden)',
    ticketInfo: 'Ticketinfo',
    submitter: 'Indiener',
    employeeIdShort: 'Nr.',
    departmentShort: 'Afdeling',
    assignee: 'Toegewezen aan',
    assignTicket: 'Toewijzen',
    markResolved: 'Markeer opgelost',
    closeTicket: 'Ticket sluiten',
    assignDialogTitle: 'Ticket toewijzen',
    selectITPerson: 'Selecteer IT-medewerker',
    confirmAssign: 'Bevestig toewijzing',
    resolveDialogTitle: 'Markeer als opgelost',
    resolutionNotesLabel: 'Oplossingsnotities',
    resolutionNotesPlaceholder: 'Beschrijf hoe het probleem is opgelost...',
    confirmResolve: 'Bevestig oplossing',
    closeDialogTitle: 'Ticket sluiten',
    closeConfirmText: 'Weet u zeker dat u dit ticket wilt sluiten? Het kan daarna niet meer worden gewijzigd.',
    confirmClose: 'Bevestig sluiten',
    pleaseSelectIT: 'Selecteer een IT-medewerker',
    pleaseFillResolution: 'Vul de oplossingsnotities in',
    assignSuccess: '✅ Ticket toegewezen!',
    assignFailed: 'Toewijzen mislukt',
    resolveSuccess: '✅ Ticket gemarkeerd als opgelost!',
    operationFailed: 'Bewerking mislukt',
    closeSuccess: '✅ Ticket gesloten!',
    closeFailed: 'Sluiten mislukt',
    loadTicketFailed: 'Ticket laden mislukt',

    // KnowledgeBase
    loadKnowledgeError: 'Kennisbank laden mislukt',
    knowledgeTitle: '📚 Kennisbank',
    newDoc: 'Nieuw document',
    totalDocs: '{count} document(en) in kennisbank',
    noKnowledgeHint: 'Nog geen documenten. Klik op "Nieuw document" om toe te voegen!',
    edit: 'Bewerken',
    delete: 'Verwijderen',
    usageCount: 'Gebruik',
    successRate: 'Slagingspercentage',
    createDialogTitle: 'Nieuw kennisdocument',
    contentLabel: 'Inhoud',
    contentPlaceholder: 'Beschrijf de oplossing in detail...',
    tagsLabel: 'Tags',
    tagsPlaceholder: 'Gescheiden door komma\'s, bijv. printer, HP, kleur',
    vectorTip: '💡 Vectoren worden automatisch gegenereerd voor AI-aanbevelingen',
    creating: 'Bezig...',
    createBtn: 'Aanmaken',
    createSuccessKb: 'Document aangemaakt! Vectoren gegenereerd.',
    createFailedKb: 'Aanmaken mislukt',
    editDialogTitle: 'Document bewerken',
    saving: 'Opslaan...',
    updateSuccessKb: 'Document bijgewerkt! Vectoren opnieuw gegenereerd.',
    updateFailedKb: 'Bijwerken mislukt',
    deleteConfirmTitle: 'Verwijderen bevestigen',
    deleteConfirmText: 'Weet u zeker dat u "{title}" wilt verwijderen? Dit kan niet ongedaan worden gemaakt.',
    deleting: 'Verwijderen...',
    confirmDelete: 'Bevestig verwijderen',
    deleteSuccessKb: 'Document verwijderd!',
    deleteFailedKb: 'Verwijderen mislukt'
  },

  zh: {
    // 导航栏
    appTitle: '🎫 IT工单系统',
    dashboard: '统计看板',
    ticketList: '工单列表',
    createTicket: '创建工单',
    knowledge: '知识库',
    
    // 工单表单
    title: '标题',
    description: '描述',
    category: '类别',
    priority: '优先级',
    status: '状态',
    submit: '提交',
    cancel: '取消',
    save: '保存',
    
    // 分类
    categories: {
      hardware: '硬件问题',
      software: '软件问题',
      network: '网络问题',
      permission: '权限问题',
      other: '其他'
    },
    
    // 优先级
    priorities: {
      low: '低',
      medium: '中',
      high: '高',
      urgent: '紧急'
    },
    
    // 状态
    statuses: {
      pending: '待处理',
      in_progress: '处理中',
      resolved: '已解决',
      closed: '已关闭'
    },
    
    // 其他常用词
    loading: '加载中...',
    search: '搜索',
    filter: '筛选',
    export: '导出',
    details: '详情',
    created: '创建时间',
    updated: '更新时间',
    assignedTo: '分配给',
    createdBy: '创建人',

    // Dashboard
    loadDataError: '加载数据失败',
    dashboardTitle: '📊 数据统计看板',
    totalTickets: '总工单数',
    completed: '已完成',
    categoryDistribution: '📁 问题类别分布',
    priorityDistribution: '⚠️ 优先级分布',
    urgentTickets: '紧急工单',
    highPriority: '高优先级',
    mediumPriority: '中优先级',
    lowPriority: '低优先级',
    alertUrgentWithCount: '⚠️ 注意：当前有 {count} 个紧急工单需要立即处理！',
    alertPendingWithCount: '📌 提示：有 {count} 个待处理工单，建议尽快分配。',

    // TicketList
    loadTicketsError: '加载工单失败',
    retry: '重试',
    ticketListTitle: '📋 工单列表',
    refresh: '刷新',
    searchPlaceholder: '搜索工单标题、描述或编号...',
    allStatus: '全部状态',
    allCategories: '全部类别',
    allPriorities: '全部优先级',
    showingTickets: '显示 {filtered} 个工单（共 {total} 个）',
    noTicketsHint: '暂无工单，点击顶部"创建工单"按钮创建第一个工单吧！',
    noMatchingTickets: '没有符合条件的工单',
    createdAt: '创建于',

    // CreateTicket
    createTicketTitle: '✍️ 创建新工单',
    ticketTitleLabel: '工单标题',
    titlePlaceholder: '简短描述问题，例如：无法连接WiFi',
    descriptionLabel: '详细描述',
    descriptionPlaceholder: '详细描述遇到的问题，包括错误信息、尝试过的解决方法等',
    categoryLabel: '问题类别',
    priorityLabel: '优先级',
    lowDesc: '低 - 不影响工作',
    mediumDesc: '中 - 轻微影响',
    highDesc: '高 - 严重影响',
    urgentDesc: '紧急 - 完全无法工作',
    employeeId: '员工工号',
    employeeName: '员工姓名',
    department: '所属部门',
    employeeIdHelper: '用于识别提交人身份',
    submitTicket: '提交工单',
    submitting: '提交中...',
    createSuccess: '✅ 工单创建成功！AI正在分析中...',
    fillTitleDesc: '请填写标题和描述',
    createFailed: '创建工单失败',
    createTicketTip: '💡 提交后，AI将自动分析您的问题并提供解决建议，请稍候...',

    // TicketDetail
    ticketNotFound: '工单不存在或已被删除',
    backToList: '返回列表',
    ticketDetailTitle: '工单详情',
    resolutionLabel: '解决方案：',
    aiSuggestions: '🤖 AI智能建议',
    suggestedCategory: '建议分类：',
    confidence: '置信度',
    solutionSuggestion: '解决方案建议：',
    aiAnalyzing: 'AI正在分析中，请稍候...（预计需要10-20秒）',
    ticketInfo: '工单信息',
    submitter: '提交人',
    employeeIdShort: '工号',
    departmentShort: '部门',
    assignee: '负责人',
    assignTicket: '分配工单',
    markResolved: '标记已解决',
    closeTicket: '关闭工单',
    assignDialogTitle: '分配工单',
    selectITPerson: '选择IT人员',
    confirmAssign: '确认分配',
    resolveDialogTitle: '标记为已解决',
    resolutionNotesLabel: '解决方案备注',
    resolutionNotesPlaceholder: '请描述如何解决了这个问题...',
    confirmResolve: '确认解决',
    closeDialogTitle: '关闭工单',
    closeConfirmText: '确认关闭此工单吗？关闭后将无法再修改。',
    confirmClose: '确认关闭',
    pleaseSelectIT: '请选择IT人员',
    pleaseFillResolution: '请填写解决方案备注',
    assignSuccess: '✅ 工单分配成功！',
    assignFailed: '分配失败',
    resolveSuccess: '✅ 工单已标记为已解决！',
    operationFailed: '操作失败',
    closeSuccess: '✅ 工单已关闭！',
    closeFailed: '关闭失败',
    loadTicketFailed: '加载工单失败',

    // KnowledgeBase
    loadKnowledgeError: '加载知识库失败',
    knowledgeTitle: '📚 知识库管理',
    newDoc: '新建文档',
    totalDocs: '共 {count} 篇知识库文档',
    noKnowledgeHint: '暂无知识库文档，点击"新建文档"开始添加！',
    edit: '编辑',
    delete: '删除',
    usageCount: '使用次数',
    successRate: '成功率',
    createDialogTitle: '新建知识库文档',
    contentLabel: '内容',
    contentPlaceholder: '详细描述问题的解决方案...',
    tagsLabel: '标签',
    tagsPlaceholder: '多个标签用逗号分隔，例如：打印机, HP, 彩色',
    vectorTip: '💡 保存后将自动生成向量，用于AI智能推荐相似案例',
    creating: '创建中...',
    createBtn: '创建',
    createSuccessKb: '知识库文档创建成功！向量已自动生成。',
    createFailedKb: '创建失败',
    editDialogTitle: '编辑知识库文档',
    saving: '保存中...',
    updateSuccessKb: '知识库文档更新成功！向量已重新生成。',
    updateFailedKb: '更新失败',
    deleteConfirmTitle: '确认删除',
    deleteConfirmText: '确定要删除知识库文档 "{title}" 吗？此操作不可恢复。',
    deleting: '删除中...',
    confirmDelete: '确认删除',
    deleteSuccessKb: '知识库文档已删除！',
    deleteFailedKb: '删除失败'
  }
};

// Hook for translations
export const useTranslation = () => {
  const [language, setLanguage] = useState(() => {
    // 从 localStorage 读取，默认英语
    return localStorage.getItem('language') || 'en';
  });

  useEffect(() => {
    // 保存到 localStorage
    localStorage.setItem('language', language);
  }, [language]);

  const changeLanguage = (lang) => {
    setLanguage(lang);
  };

  const t = (key) => {
    const keys = key.split('.');
    let value = translations[language];
    
    for (const k of keys) {
      value = value?.[k];
    }
    
    return value || key;
  };

  return { t, language, changeLanguage };
};