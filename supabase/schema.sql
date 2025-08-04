-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.chat_messages (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  session_id uuid NOT NULL,
  user_id uuid NOT NULL,
  role text NOT NULL CHECK (role = ANY (ARRAY['user'::text, 'assistant'::text])),
  content text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT chat_messages_pkey PRIMARY KEY (id),
  CONSTRAINT chat_messages_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.chat_sessions(id),
  CONSTRAINT chat_messages_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.chat_sessions (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  title character varying DEFAULT NULL::character varying,
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT chat_sessions_pkey PRIMARY KEY (id),
  CONSTRAINT chat_sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.correspondence_links (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  correspondence_id uuid NOT NULL,
  linked_type character varying NOT NULL,
  linked_id uuid NOT NULL,
  user_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT correspondence_links_pkey PRIMARY KEY (id),
  CONSTRAINT correspondence_links_correspondence_id_fkey FOREIGN KEY (correspondence_id) REFERENCES public.correspondences(id),
  CONSTRAINT correspondence_links_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.correspondences (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  name character varying NOT NULL,
  category character varying NOT NULL,
  magical_properties ARRAY DEFAULT '{}'::text[],
  traditional_uses ARRAY DEFAULT '{}'::text[],
  personal_notes text,
  element character varying,
  planet character varying,
  zodiac_sign character varying,
  chakra character varying,
  is_personal boolean DEFAULT true,
  is_favorited boolean DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  description text,
  botanical_name character varying,
  common_names ARRAY DEFAULT '{}'::text[],
  medical_uses ARRAY DEFAULT '{}'::text[],
  personal_applications ARRAY DEFAULT '{}'::text[],
  energy_type character varying CHECK (energy_type::text = ANY (ARRAY['masculine'::character varying, 'feminine'::character varying]::text[])),
  deities ARRAY DEFAULT '{}'::text[],
  cultural_traditions jsonb,
  folklore text,
  historical_uses ARRAY DEFAULT '{}'::text[],
  source character varying,
  verified boolean DEFAULT false,
  CONSTRAINT correspondences_pkey PRIMARY KEY (id),
  CONSTRAINT correspondences_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.daily_checkins (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  prompt text NOT NULL,
  response text,
  completed boolean DEFAULT false,
  session_id uuid,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT daily_checkins_pkey PRIMARY KEY (id),
  CONSTRAINT daily_checkins_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT daily_checkins_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.chat_sessions(id)
);
CREATE TABLE public.grimoire_entries (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  type text NOT NULL CHECK (type = ANY (ARRAY['ritual'::text, 'spell'::text, 'chant'::text, 'blessing'::text, 'invocation'::text, 'meditation'::text, 'divination'::text, 'other'::text])),
  purpose text,
  ingredients ARRAY,
  instructions text NOT NULL,
  notes text,
  source text,
  moon_phase_compatibility ARRAY,
  is_public boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  category text,
  content text,
  subcategory text,
  description text,
  intent text,
  best_timing text,
  difficulty_level integer,
  moon_phase text,
  season text,
  element text,
  planet text,
  chakra text,
  tags ARRAY,
  is_favorite boolean DEFAULT false,
  is_tested boolean DEFAULT false,
  effectiveness_rating integer,
  CONSTRAINT grimoire_entries_pkey PRIMARY KEY (id),
  CONSTRAINT grimoire_entries_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.grimoire_entry_tags (
  grimoire_entry_id uuid NOT NULL,
  tag_id uuid NOT NULL,
  CONSTRAINT grimoire_entry_tags_pkey PRIMARY KEY (grimoire_entry_id, tag_id),
  CONSTRAINT grimoire_entry_tags_tag_id_fkey FOREIGN KEY (tag_id) REFERENCES public.grimoire_tags(id),
  CONSTRAINT grimoire_entry_tags_grimoire_entry_id_fkey FOREIGN KEY (grimoire_entry_id) REFERENCES public.grimoire_entries(id)
);
CREATE TABLE public.grimoire_tags (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name text NOT NULL UNIQUE,
  category text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT grimoire_tags_pkey PRIMARY KEY (id)
);
CREATE TABLE public.journal_entries (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  title text,
  content text NOT NULL,
  mood text,
  moon_phase text,
  beatrice_reflection text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT journal_entries_pkey PRIMARY KEY (id),
  CONSTRAINT journal_entries_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.journal_entry_tags (
  journal_entry_id uuid NOT NULL,
  tag_id uuid NOT NULL,
  CONSTRAINT journal_entry_tags_pkey PRIMARY KEY (journal_entry_id, tag_id),
  CONSTRAINT journal_entry_tags_journal_entry_id_fkey FOREIGN KEY (journal_entry_id) REFERENCES public.journal_entries(id),
  CONSTRAINT journal_entry_tags_tag_id_fkey FOREIGN KEY (tag_id) REFERENCES public.tags(id)
);
CREATE TABLE public.profiles (
  id uuid NOT NULL,
  username text UNIQUE,
  display_name text,
  spiritual_path text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);
CREATE TABLE public.ritual_grimoire_links (
  ritual_id uuid NOT NULL,
  grimoire_entry_id uuid NOT NULL,
  CONSTRAINT ritual_grimoire_links_pkey PRIMARY KEY (ritual_id, grimoire_entry_id),
  CONSTRAINT ritual_grimoire_links_grimoire_entry_id_fkey FOREIGN KEY (grimoire_entry_id) REFERENCES public.grimoire_entries(id),
  CONSTRAINT ritual_grimoire_links_ritual_id_fkey FOREIGN KEY (ritual_id) REFERENCES public.rituals(id)
);
CREATE TABLE public.rituals (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  intent text,
  description text,
  moon_phase text,
  tools_used ARRAY,
  outcome text,
  performed_at timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT rituals_pkey PRIMARY KEY (id),
  CONSTRAINT rituals_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.tags (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name text NOT NULL UNIQUE,
  category text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT tags_pkey PRIMARY KEY (id)
);