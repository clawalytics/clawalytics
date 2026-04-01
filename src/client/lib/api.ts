import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
});

// Types
export interface Stats {
  todaySpend: number;
  weeklySpend: number;
  monthlySpend: number;
  totalSessions: number;
  todayTokens: {
    input: number;
    output: number;
  };
}

export interface EnhancedStats {
  totalCost: number;
  monthCost: number;
  totalTokens: {
    input: number;
    output: number;
    cacheRead: number;
    cacheCreation: number;
  };
  cacheSavings: number;
  activeSessionsThisMonth: number;
}

export interface TokenBreakdown {
  input: number;
  output: number;
  cacheRead: number;
  cacheCreation: number;
}

export interface Session {
  id: string;
  project_path: string;
  started_at: string;
  last_activity: string;
  total_input_tokens: number;
  total_output_tokens: number;
  total_cost: number;
  models_used: string[];
}

export interface SessionsResponse {
  sessions: Session[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

export interface DailyCost {
  date: string;
  total_cost: number;
  total_input_tokens: number;
  total_output_tokens: number;
  cache_creation_tokens: number;
  cache_read_tokens: number;
  cache_savings: number;
  session_count: number;
  request_count: number;
}

export interface ModelUsage {
  provider: string;
  model: string;
  input_tokens: number;
  output_tokens: number;
  cost: number;
  request_count: number;
}

export interface Config {
  logPath: string;
  rates: Record<string, Record<string, { input: number; output: number }>>;
  alertThresholds: {
    dailyBudget: number;
    weeklyBudget: number;
    monthlyBudget: number;
  };
  configPath?: string;
}

export interface DesktopPreferences {
  locale: 'zh' | 'en';
  closeAction: 'ask' | 'tray' | 'quit';
  launchOnStartup: boolean;
  startupMode: 'window' | 'tray';
}

export type DesktopCloseChoiceAction = 'tray' | 'quit' | 'cancel';
export type DesktopStartupMode = DesktopPreferences['startupMode'];

// API functions
export async function getStats(): Promise<Stats> {
  const { data } = await api.get<Stats>('/stats');
  return data;
}

export async function getEnhancedStats(): Promise<EnhancedStats> {
  const { data } = await api.get<EnhancedStats>('/stats/enhanced');
  return data;
}

export async function getTokenBreakdown(days = 30): Promise<TokenBreakdown> {
  const { data } = await api.get<TokenBreakdown>('/stats/tokens', {
    params: { days },
  });
  return data;
}

// Session analytics types
export interface SessionStats {
  totalSessions: number;
  totalSessionsThisMonth: number;
  totalCost: number;
  avgCostPerSession: number;
  mostActiveProject: { project: string; sessionCount: number } | null;
}

export interface ProjectBreakdown {
  project: string;
  totalCost: number;
  totalInputTokens: number;
  totalOutputTokens: number;
  sessionCount: number;
}

export interface SessionFilters {
  projects: string[];
  models: string[];
}

export interface EnhancedSession extends Session {
  request_count: number;
}

export interface EnhancedSessionsResponse {
  sessions: EnhancedSession[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

export interface SessionRequest {
  id?: number;
  session_id: string;
  timestamp: string;
  provider: string;
  model: string;
  input_tokens: number;
  output_tokens: number;
  cache_creation_tokens: number;
  cache_read_tokens: number;
  cost: number;
  message_type?: string;
}

export interface GetSessionsOptions {
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
  project?: string;
  model?: string;
  search?: string;
}

export async function getSessions(options: GetSessionsOptions = {}): Promise<EnhancedSessionsResponse> {
  const { data } = await api.get<EnhancedSessionsResponse>('/sessions', {
    params: options,
  });
  return data;
}

export async function getSessionStats(): Promise<SessionStats> {
  const { data } = await api.get<SessionStats>('/sessions/stats');
  return data;
}

export async function getProjectBreakdown(limit = 10): Promise<ProjectBreakdown[]> {
  const { data } = await api.get<ProjectBreakdown[]>('/sessions/projects', {
    params: { limit },
  });
  return data;
}

export async function getSessionFilters(): Promise<SessionFilters> {
  const { data } = await api.get<SessionFilters>('/sessions/filters');
  return data;
}

export async function getSessionRequests(sessionId: string): Promise<SessionRequest[]> {
  const { data } = await api.get<SessionRequest[]>(`/sessions/${sessionId}/requests`);
  return data;
}

export async function getSession(id: string): Promise<Session> {
  const { data } = await api.get<Session>(`/sessions/${id}`);
  return data;
}

export async function getDailyCosts(days = 30): Promise<DailyCost[]> {
  const { data } = await api.get<DailyCost[]>('/costs/daily', {
    params: { days },
  });
  return data;
}

export async function getModelUsage(days = 30): Promise<ModelUsage[]> {
  const { data } = await api.get<ModelUsage[]>('/costs/by-model', {
    params: { days },
  });
  return data;
}

export async function getConfig(): Promise<Config> {
  const { data } = await api.get<Config>('/config');
  return data;
}

export async function updateConfig(config: Partial<Config>): Promise<Config> {
  const { data } = await api.post<Config>('/config', config);
  return data;
}

export async function getDesktopPreferences(): Promise<DesktopPreferences> {
  const { data } = await api.get<DesktopPreferences>('/desktop/preferences');
  return data;
}

export async function updateDesktopPreferences(
  updates: Partial<DesktopPreferences>
): Promise<DesktopPreferences> {
  const { data } = await api.post<DesktopPreferences>('/desktop/preferences', updates);
  return data;
}

export async function submitDesktopCloseChoice(payload: {
  action: DesktopCloseChoiceAction;
  remember: boolean;
}): Promise<DesktopPreferences> {
  const { data } = await api.post<DesktopPreferences>(
    '/desktop/window/close-choice',
    payload
  );
  return data;
}

export async function updateProviderRate(
  provider: string,
  model: string,
  rates: { input: number; output: number }
): Promise<{ input: number; output: number }> {
  const { data } = await api.post(`/config/rates/${provider}/${model}`, rates);
  return data;
}

// Phase 2: Agent types
export interface Agent {
  id: string;
  name: string;
  workspace: string | null;
  created_at: string;
  total_cost: number;
  total_input_tokens: number;
  total_output_tokens: number;
  session_count: number;
}

export interface AgentDailyCost {
  agent_id: string;
  date: string;
  total_cost: number;
  input_tokens: number;
  output_tokens: number;
  cache_read_tokens: number;
  cache_creation_tokens: number;
  request_count: number;
}

export interface AgentStats {
  agents: Agent[];
  totalCost: number;
  totalSessions: number;
}

// Phase 2: Channel types
export interface Channel {
  id: number;
  name: string;
  total_cost: number;
  total_input_tokens: number;
  total_output_tokens: number;
  message_count: number;
}

export interface ChannelDailyCost {
  channel_id: number;
  date: string;
  total_cost: number;
  input_tokens: number;
  output_tokens: number;
  message_count: number;
}

export interface ChannelStats {
  channels: Channel[];
  totalCost: number;
  totalMessages: number;
}

// Phase 2: Agent API functions
export async function getAgents(): Promise<Agent[]> {
  const { data } = await api.get<Agent[]>('/agents');
  return data;
}

export async function getAgent(id: string): Promise<Agent> {
  const { data } = await api.get<Agent>(`/agents/${id}`);
  return data;
}

export async function getAgentStats(limit = 10): Promise<AgentStats> {
  const { data } = await api.get<AgentStats>('/agents/stats', {
    params: { limit },
  });
  return data;
}

export async function getAgentDailyCosts(
  agentId: string,
  days = 30
): Promise<AgentDailyCost[]> {
  const { data } = await api.get<AgentDailyCost[]>(
    `/agents/${agentId}/daily`,
    {
      params: { days },
    }
  );
  return data;
}

export async function getAllAgentsDailyCosts(
  days = 30
): Promise<AgentDailyCost[]> {
  const { data } = await api.get<AgentDailyCost[]>('/agents/daily', {
    params: { days },
  });
  return data;
}

// Phase 2: Channel API functions
export async function getChannels(): Promise<Channel[]> {
  const { data } = await api.get<Channel[]>('/channels');
  return data;
}

export async function getChannel(id: number): Promise<Channel> {
  const { data } = await api.get<Channel>(`/channels/${id}`);
  return data;
}

export async function getChannelStats(limit = 10): Promise<ChannelStats> {
  const { data } = await api.get<ChannelStats>('/channels/stats', {
    params: { limit },
  });
  return data;
}

export async function getChannelDailyCosts(
  channelId: number,
  days = 30
): Promise<ChannelDailyCost[]> {
  const { data } = await api.get<ChannelDailyCost[]>(
    `/channels/${channelId}/daily`,
    {
      params: { days },
    }
  );
  return data;
}

export async function getAllChannelsDailyCosts(
  days = 30
): Promise<ChannelDailyCost[]> {
  const { data } = await api.get<ChannelDailyCost[]>('/channels/daily', {
    params: { days },
  });
  return data;
}

// Phase 3: Device types
export interface Device {
  id: string;
  name: string | null;
  type: string | null;
  paired_at: string;
  last_seen: string | null;
  status: string;
  connection_count: number;
}

export interface PairingRequest {
  id: number;
  device_id: string;
  device_name: string | null;
  requested_at: string;
  responded_at: string | null;
  status: string;
  response: string | null;
}

// Phase 3: Security types
export interface SecurityAlert {
  id: number;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: string;
  acknowledged: boolean;
  acknowledged_at: string | null;
  details: string | null;
}

export interface ConnectionEvent {
  id: number;
  device_id: string | null;
  event_type: string;
  timestamp: string;
  ip_address: string | null;
  details: string | null;
}

export interface OutboundCall {
  id: number;
  session_id: string | null;
  agent_id: string | null;
  tool_name: string;
  timestamp: string;
  duration_ms: number | null;
  status: string | null;
  error: string | null;
}

export interface AuditEntry {
  id: number;
  action: string;
  entity_type: string | null;
  entity_id: string | null;
  timestamp: string;
  actor: string | null;
  details: string | null;
  ip_address: string | null;
}

export interface SecurityDashboardStats {
  activeDevices: number;
  unacknowledgedAlerts: number;
  recentConnections: number;
  alertsByLevel: { low: number; medium: number; high: number; critical: number };
}

export interface AuditFilters {
  action?: string;
  entityType?: string;
  actor?: string;
  ipAddress?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}

export interface AuditLogResponse {
  entries: AuditEntry[];
  total: number;
}

export interface ToolStats {
  toolName: string;
  count: number;
  avgDuration: number;
}

export interface OutboundCallFilters {
  limit?: number;
  offset?: number;
  agentId?: string;
  toolName?: string;
  status?: string;
}

export interface OutboundCallsResponse {
  calls: OutboundCall[];
  total: number;
}

// Phase 3: Device API functions
export async function getDevices(): Promise<Device[]> {
  const { data } = await api.get<Device[]>('/devices');
  return data;
}

export async function getActiveDevices(): Promise<Device[]> {
  const { data } = await api.get<Device[]>('/devices/active');
  return data;
}

export async function getPendingRequests(): Promise<PairingRequest[]> {
  const { data } = await api.get<PairingRequest[]>('/devices/pending');
  return data;
}

export async function respondToPairingRequest(
  id: number,
  status: string,
  response?: string
): Promise<void> {
  await api.post(`/devices/requests/${id}/respond`, { status, response });
}

// Phase 3: Security API functions
export async function getSecurityDashboard(): Promise<SecurityDashboardStats> {
  const { data } = await api.get<SecurityDashboardStats>('/security/dashboard');
  return data;
}

export async function getAlerts(
  acknowledged?: boolean,
  limit?: number
): Promise<SecurityAlert[]> {
  const params: Record<string, unknown> = {};
  if (acknowledged !== undefined) params.acknowledged = acknowledged;
  if (limit !== undefined) params.limit = limit;
  const { data } = await api.get<SecurityAlert[]>('/security/alerts', { params });
  return data;
}

export async function getUnacknowledgedAlerts(): Promise<SecurityAlert[]> {
  const { data } = await api.get<SecurityAlert[]>('/security/alerts/unacknowledged');
  return data;
}

export async function acknowledgeAlert(id: number): Promise<void> {
  await api.post(`/security/alerts/${id}/acknowledge`);
}

export async function acknowledgeAllAlerts(): Promise<{ count: number }> {
  const { data } = await api.post<{ count: number }>('/security/alerts/acknowledge-all');
  return data;
}

// Phase 3: Connection API functions
export async function getConnectionEvents(
  limit?: number,
  deviceId?: string
): Promise<ConnectionEvent[]> {
  const params: Record<string, unknown> = {};
  if (limit !== undefined) params.limit = limit;
  if (deviceId !== undefined) params.deviceId = deviceId;
  const { data } = await api.get<ConnectionEvent[]>('/security/connections', { params });
  return data;
}

export async function getRecentConnections(hours?: number): Promise<ConnectionEvent[]> {
  const params: Record<string, unknown> = {};
  if (hours !== undefined) params.hours = hours;
  const { data } = await api.get<ConnectionEvent[]>('/security/connections/recent', {
    params,
  });
  return data;
}

// Phase 3: Tool API functions
export async function getOutboundCalls(
  filters?: OutboundCallFilters
): Promise<OutboundCallsResponse> {
  const { data } = await api.get<OutboundCallsResponse>('/tools', { params: filters });
  return data;
}

interface BackendToolStats {
  totalCalls: number;
  uniqueTools: number;
  avgDurationMs: number | null;
  errorRate: number;
  topTools: Array<{
    tool_name: string;
    call_count: number;
    avg_duration_ms: number | null;
    error_count: number;
  }>;
}

export async function getToolStats(days?: number): Promise<ToolStats[]> {
  const params: Record<string, unknown> = {};
  if (days !== undefined) params.days = days;
  const { data } = await api.get<BackendToolStats>('/tools/stats', { params });
  // Transform backend format to frontend format
  return (data.topTools ?? []).map((tool) => ({
    toolName: tool.tool_name,
    count: tool.call_count,
    avgDuration: tool.avg_duration_ms ?? 0,
  }));
}

// Phase 3: Audit API functions
export async function getAuditLog(filters?: AuditFilters): Promise<AuditLogResponse> {
  const { data } = await api.get<AuditLogResponse>('/audit', { params: filters });
  return data;
}

export async function getRecentAuditLog(hours?: number): Promise<AuditEntry[]> {
  const params: Record<string, unknown> = {};
  if (hours !== undefined) params.hours = hours;
  const { data } = await api.get<AuditEntry[]>('/audit/recent', { params });
  return data;
}

// ============================================
// Models API
// ============================================

export interface ModelUsageItem {
  provider: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  cost: number;
  requestCount: number;
}

export interface ModelStats {
  totalModels: number;
  totalProviders: number;
  topModel: { provider: string; model: string; cost: number } | null;
  topProvider: { provider: string; cost: number; modelCount: number } | null;
}

export interface ModelDailyUsage {
  date: string;
  provider: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  cost: number;
  requestCount: number;
}

export interface ProviderSummary {
  provider: string;
  totalCost: number;
  totalInputTokens: number;
  totalOutputTokens: number;
  modelCount: number;
  requestCount: number;
}

export interface PricingData {
  models: Record<string, { input: number; output: number; cacheRead?: number; cacheWrite?: number }>;
  fetchedAt: string;
  source: string;
}

export async function getModels(days = 30): Promise<ModelUsageItem[]> {
  const { data } = await api.get<ModelUsageItem[]>('/models', { params: { days } });
  return data;
}

export async function getModelStats(days = 30): Promise<ModelStats> {
  const { data } = await api.get<ModelStats>('/models/stats', { params: { days } });
  return data;
}

export async function getModelDailyUsage(days = 30): Promise<ModelDailyUsage[]> {
  const { data } = await api.get<ModelDailyUsage[]>('/models/daily', { params: { days } });
  return data;
}

export async function getProviderSummary(days = 30): Promise<ProviderSummary[]> {
  const { data } = await api.get<ProviderSummary[]>('/models/providers', { params: { days } });
  return data;
}

export async function getModelPricing(): Promise<PricingData> {
  const { data } = await api.get<PricingData>('/models/pricing');
  return data;
}

export async function refreshModelPricing(): Promise<{ success: boolean; pricing?: PricingData }> {
  const { data } = await api.post<{ success: boolean; pricing?: PricingData }>('/models/pricing/refresh');
  return data;
}

// ============================================
// Budget API
// ============================================

export interface BudgetPeriod {
  spent: number;
  budget: number;
  percent: number;
}

export interface BudgetStatus {
  daily: BudgetPeriod | null;
  weekly: BudgetPeriod | null;
  monthly: BudgetPeriod | null;
}

export async function getBudgetStatus(): Promise<BudgetStatus> {
  const { data } = await api.get<BudgetStatus>('/stats/budget');
  return data;
}

export default api;
