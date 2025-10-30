const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v1';

export function DashboardService() {
  const getSystemStats = async () => {
    const res = await fetch(`${API_BASE_URL}/dashboard/stats`);
    return res.json();
  };

  const getRecentChats = async (limit: number = 10) => {
    const res = await fetch(`${API_BASE_URL}/dashboard/recent_chats?limit=${limit}`);
    return res.json();
  };

  const getDocumentsByCategory = async () => {
    const res = await fetch(`${API_BASE_URL}/dashboard/documents_by_category`);
    return res.json();
  };

  const getActivityByDay = async (days: number = 7) => {
    const res = await fetch(`${API_BASE_URL}/dashboard/activity_by_day?days=${days}`);
    return res.json();
  };

  const getMostActiveSessions = async (limit: number = 5) => {
    const res = await fetch(`${API_BASE_URL}/dashboard/most_active_sessions?limit=${limit}`);
    return res.json();
  };

  const getNfeStatistics = async () => {
    const res = await fetch(`${API_BASE_URL}/dashboard/nfe/statistics`);
    return res.json();
  };

  const getNfeCfopDistribution = async () => {
    const res = await fetch(`${API_BASE_URL}/dashboard/nfe/cfop_distribution`);
    return res.json();
  };

  const getNfeNcmTop = async (limit: number = 10) => {
    const res = await fetch(`${API_BASE_URL}/dashboard/nfe/ncm_top?limit=${limit}`);
    return res.json();
  };

  const getNfeValuesSummary = async () => {
    const res = await fetch(`${API_BASE_URL}/dashboard/nfe/values_summary`);
    return res.json();
  };

  const getNfeProcessingTimeline = async (days: number = 30) => {
    const res = await fetch(`${API_BASE_URL}/dashboard/nfe/processing_timeline?days=${days}`);
    return res.json();
  };

  const getNfeErrorAnalysis = async () => {
    const res = await fetch(`${API_BASE_URL}/dashboard/nfe/error_analysis`);
    return res.json();
  };

  return {
    getSystemStats,
    getRecentChats,
    getDocumentsByCategory,
    getActivityByDay,
    getMostActiveSessions,
    getNfeStatistics,
    getNfeCfopDistribution,
    getNfeNcmTop,
    getNfeValuesSummary,
    getNfeProcessingTimeline,
    getNfeErrorAnalysis,
  };
}