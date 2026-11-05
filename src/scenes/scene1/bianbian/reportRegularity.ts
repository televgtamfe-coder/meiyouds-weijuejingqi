import type {SavedReport} from './records';
import {createMockTrends} from './trendData';
// Presentation-only fallback. Never save this sample as an actual record or send it to analysis.
export function reportRegularity(record:SavedReport){return record.regularitySnapshot||createMockTrends(new Date(record.createdAt));}
