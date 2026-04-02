export interface Correlation {
  metric_a: string;
  metric_b: string;
  r_value: number;
  significance: 'low' | 'medium' | 'high';
  description_key: string;
}

export interface Pattern {
  type: 'day_of_week' | 'trend' | 'infradian_cycle';
  metric: string;
  description_key: string;
  params: Record<string, unknown>;
}

export interface Recommendation {
  title_key: string;
  body_key: string;
  category: 'sleep' | 'training' | 'stress' | 'general' | 'nofap';
  priority: number; // 1 = highest
}

export interface InsightData {
  correlations: Correlation[];
  patterns: Pattern[];
  recommendations: Recommendation[];
}
