// types/beatrice.ts

// User and Profile Types
export interface User {
  id: string;
  email: string;
  username?: string;
  created_at: string;
  spiritual_profile?: SpiritualProfile;
}

export interface SpiritualProfile {
  id: string;
  user_id: string;
  current_phase?: string;
  primary_deities?: string[];
  practice_type?: string;
  journey_start_date?: string;
}

// Journal Types
export interface JournalEntry {
  id: string;
  user_id: string;
  title?: string;
  content: string;
  beatrice_reflection?: string;
  mood?: string;
  moon_phase?: string;
  created_at: string;
  updated_at: string;
  journal_entry_tags?: JournalEntryTag[];
}

export interface JournalEntryTag {
  id: string;
  journal_entry_id: string;
  tag_id: string;
  tags: Tag;
}

// Tag System Types
export interface Tag {
  id: string;
  name: string;
  category: TagCategory;
  color?: string;
  description?: string;
}

export type TagCategory = 
  | 'deity' 
  | 'emotion' 
  | 'intent' 
  | 'tool' 
  | 'moon_phase' 
  | 'element' 
  | 'season';

// Ritual and Divination Types
export interface Ritual {
  id: string;
  user_id: string;
  type: RitualType;
  intent: string;
  moon_phase?: string;
  tools_used?: string[];
  deities_invoked?: string[];
  outcome?: string;
  date_performed: string;
  ritual_tags?: RitualTag[];
}

export type RitualType = 
  | 'spell' 
  | 'meditation' 
  | 'divination' 
  | 'ceremony' 
  | 'offering';

export interface RitualTag {
  id: string;
  ritual_id: string;
  tag_id: string;
  tags: Tag;
}

export interface DivinationReading {
  id: string;
  user_id: string;
  type: DivinationType;
  question?: string;
  cards?: TarotCard[];
  interpretation: string;
  beatrice_insights?: string;
  date_performed: string;
  images?: string[];
}

export type DivinationType = 
  | 'tarot' 
  | 'oracle' 
  | 'runes' 
  | 'pendulum' 
  | 'scrying';

export interface TarotCard {
  name: string;
  position: string;
  reversed: boolean;
  interpretation?: string;
  image_url?: string;
}

// Book of Shadows / Grimoire Types
export interface BookEntry {
  id: string;
  user_id: string;
  type: 'shadow' | 'grimoire';
  title: string;
  content: string;
  category?: string;
  moon_phase?: string;
  created_at: string;
  updated_at: string;
  auto_generated: boolean;
  source_type?: 'ritual' | 'journal' | 'chat' | 'manual';
  source_id?: string;
}

// Correspondence Types
export interface Correspondence {
  id: string;
  name: string;
  type: CorrespondenceType;
  properties: Record<string, any>;
  associations: string[];
  user_added: boolean;
  user_id?: string;
  description?: string;
}

export type CorrespondenceType = 
  | 'herb' 
  | 'crystal' 
  | 'color' 
  | 'number' 
  | 'planet' 
  | 'element' 
  | 'deity';

// Chat with Beatrice Types
export interface ChatMessage {
  id: string;
  user_id: string;
  role: 'user' | 'beatrice';
  content: string;
  timestamp: string;
  context_tags?: string[];
  linked_entries?: string[];
}

export interface ChatSession {
  id: string;
  user_id: string;
  started_at: string;
  ended_at?: string;
  messages: ChatMessage[];
  summary?: string;
  key_insights?: string[];
}

// Milestone and Journey Types
export interface SpiritualMilestone {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  date: string;
  type: MilestoneType;
  linked_items?: {
    rituals?: string[];
    journal_entries?: string[];
    divinations?: string[];
  };
  auto_detected: boolean;
}

export type MilestoneType = 
  | 'initiation' 
  | 'dedication' 
  | 'breakthrough' 
  | 'shadow_work' 
  | 'deity_contact' 
  | 'tool_consecration' 
  | 'sabbat_celebration';

// Daily Check-in Types
export interface DailyCheckIn {
  id: string;
  user_id: string;
  date: string;
  mood?: string;
  energy_level?: number;
  gratitudes?: string[];
  intentions?: string[];
  beatrice_prompt?: string;
  user_response?: string;
}