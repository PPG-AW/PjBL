CREATE TABLE public.group_members (
    id integer NOT NULL,
    group_id integer NOT NULL,
    student_id integer NOT NULL
);
CREATE SEQUENCE public.group_members_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE public.group_members_id_seq OWNED BY public.group_members.id;
CREATE TABLE public.groups (
    id integer NOT NULL,
    name text NOT NULL,
    pin text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);
CREATE SEQUENCE public.groups_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE public.groups_id_seq OWNED BY public.groups.id;
CREATE TABLE public.inequality_attempts (
    id integer NOT NULL,
    group_id integer NOT NULL,
    student_id integer NOT NULL,
    answers jsonb NOT NULL,
    results jsonb NOT NULL,
    all_correct boolean NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);
CREATE SEQUENCE public.inequality_attempts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE public.inequality_attempts_id_seq OWNED BY public.inequality_attempts.id;
CREATE TABLE public.interviews (
    id integer NOT NULL,
    group_id integer NOT NULL,
    product_a text NOT NULL,
    product_b text NOT NULL,
    ingredients jsonb NOT NULL,
    time_per_a double precision NOT NULL,
    time_per_a_unit text NOT NULL,
    time_per_b double precision NOT NULL,
    time_per_b_unit text NOT NULL,
    total_time double precision NOT NULL,
    total_time_unit text NOT NULL,
    price_a integer NOT NULL,
    cost_a integer NOT NULL,
    price_b integer NOT NULL,
    cost_b integer NOT NULL,
    updated_by text,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);
CREATE SEQUENCE public.interviews_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE public.interviews_id_seq OWNED BY public.interviews.id;
CREATE TABLE public.journals (
    id integer NOT NULL,
    student_id integer NOT NULL,
    group_id integer NOT NULL,
    day integer NOT NULL,
    activity text NOT NULL,
    obstacle text,
    file_name text,
    file_type text,
    file_data text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);
CREATE SEQUENCE public.journals_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE public.journals_id_seq OWNED BY public.journals.id;
CREATE TABLE public.portfolios (
    id integer NOT NULL,
    group_id integer NOT NULL,
    student_id integer NOT NULL,
    category text NOT NULL,
    title text NOT NULL,
    description text,
    file_name text,
    file_type text,
    file_data text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);
CREATE SEQUENCE public.portfolios_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE public.portfolios_id_seq OWNED BY public.portfolios.id;
CREATE TABLE public.progress (
    id integer NOT NULL,
    student_id integer NOT NULL,
    feature text NOT NULL,
    completed_at timestamp with time zone DEFAULT now() NOT NULL
);
CREATE SEQUENCE public.progress_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE public.progress_id_seq OWNED BY public.progress.id;
CREATE TABLE public.quiz_attempts (
    id integer NOT NULL,
    student_id integer NOT NULL,
    score integer NOT NULL,
    passed boolean NOT NULL,
    answers jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);
CREATE SEQUENCE public.quiz_attempts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE public.quiz_attempts_id_seq OWNED BY public.quiz_attempts.id;
CREATE TABLE public.reflections (
    id integer NOT NULL,
    student_id integer NOT NULL,
    answers jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);
CREATE SEQUENCE public.reflections_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE public.reflections_id_seq OWNED BY public.reflections.id;
CREATE TABLE public.reminders (
    id integer NOT NULL,
    student_id integer NOT NULL,
    message text NOT NULL,
    read boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);
CREATE SEQUENCE public.reminders_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE public.reminders_id_seq OWNED BY public.reminders.id;
CREATE TABLE public.sessions (
    token text NOT NULL,
    role text NOT NULL,
    student_id integer,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);
CREATE TABLE public.settings (
    key text NOT NULL,
    value text NOT NULL
);
CREATE TABLE public.students (
    id integer NOT NULL,
    name text NOT NULL,
    pin_fails integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    last_seen_at timestamp with time zone DEFAULT now() NOT NULL
);
CREATE SEQUENCE public.students_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE public.students_id_seq OWNED BY public.students.id;
ALTER TABLE ONLY public.group_members ALTER COLUMN id SET DEFAULT nextval('public.group_members_id_seq'::regclass);
ALTER TABLE ONLY public.groups ALTER COLUMN id SET DEFAULT nextval('public.groups_id_seq'::regclass);
ALTER TABLE ONLY public.inequality_attempts ALTER COLUMN id SET DEFAULT nextval('public.inequality_attempts_id_seq'::regclass);
ALTER TABLE ONLY public.interviews ALTER COLUMN id SET DEFAULT nextval('public.interviews_id_seq'::regclass);
ALTER TABLE ONLY public.journals ALTER COLUMN id SET DEFAULT nextval('public.journals_id_seq'::regclass);
ALTER TABLE ONLY public.portfolios ALTER COLUMN id SET DEFAULT nextval('public.portfolios_id_seq'::regclass);
ALTER TABLE ONLY public.progress ALTER COLUMN id SET DEFAULT nextval('public.progress_id_seq'::regclass);
ALTER TABLE ONLY public.quiz_attempts ALTER COLUMN id SET DEFAULT nextval('public.quiz_attempts_id_seq'::regclass);
ALTER TABLE ONLY public.reflections ALTER COLUMN id SET DEFAULT nextval('public.reflections_id_seq'::regclass);
ALTER TABLE ONLY public.reminders ALTER COLUMN id SET DEFAULT nextval('public.reminders_id_seq'::regclass);
ALTER TABLE ONLY public.students ALTER COLUMN id SET DEFAULT nextval('public.students_id_seq'::regclass);
ALTER TABLE ONLY public.group_members
    ADD CONSTRAINT group_members_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.group_members
    ADD CONSTRAINT group_members_student_id_unique UNIQUE (student_id);
ALTER TABLE ONLY public.groups
    ADD CONSTRAINT groups_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.inequality_attempts
    ADD CONSTRAINT inequality_attempts_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.interviews
    ADD CONSTRAINT interviews_group_id_unique UNIQUE (group_id);
ALTER TABLE ONLY public.interviews
    ADD CONSTRAINT interviews_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.journals
    ADD CONSTRAINT journals_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.portfolios
    ADD CONSTRAINT portfolios_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.progress
    ADD CONSTRAINT progress_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.quiz_attempts
    ADD CONSTRAINT quiz_attempts_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.reflections
    ADD CONSTRAINT reflections_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.reflections
    ADD CONSTRAINT reflections_student_id_unique UNIQUE (student_id);
ALTER TABLE ONLY public.reminders
    ADD CONSTRAINT reminders_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (token);
ALTER TABLE ONLY public.settings
    ADD CONSTRAINT settings_pkey PRIMARY KEY (key);
ALTER TABLE ONLY public.students
    ADD CONSTRAINT students_name_unique UNIQUE (name);
ALTER TABLE ONLY public.students
    ADD CONSTRAINT students_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.group_members
    ADD CONSTRAINT group_members_group_id_groups_id_fk FOREIGN KEY (group_id) REFERENCES public.groups(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.group_members
    ADD CONSTRAINT group_members_student_id_students_id_fk FOREIGN KEY (student_id) REFERENCES public.students(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.inequality_attempts
    ADD CONSTRAINT inequality_attempts_group_id_groups_id_fk FOREIGN KEY (group_id) REFERENCES public.groups(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.inequality_attempts
    ADD CONSTRAINT inequality_attempts_student_id_students_id_fk FOREIGN KEY (student_id) REFERENCES public.students(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.interviews
    ADD CONSTRAINT interviews_group_id_groups_id_fk FOREIGN KEY (group_id) REFERENCES public.groups(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.journals
    ADD CONSTRAINT journals_group_id_groups_id_fk FOREIGN KEY (group_id) REFERENCES public.groups(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.journals
    ADD CONSTRAINT journals_student_id_students_id_fk FOREIGN KEY (student_id) REFERENCES public.students(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.portfolios
    ADD CONSTRAINT portfolios_group_id_groups_id_fk FOREIGN KEY (group_id) REFERENCES public.groups(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.portfolios
    ADD CONSTRAINT portfolios_student_id_students_id_fk FOREIGN KEY (student_id) REFERENCES public.students(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.progress
    ADD CONSTRAINT progress_student_id_students_id_fk FOREIGN KEY (student_id) REFERENCES public.students(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.quiz_attempts
    ADD CONSTRAINT quiz_attempts_student_id_students_id_fk FOREIGN KEY (student_id) REFERENCES public.students(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.reflections
    ADD CONSTRAINT reflections_student_id_students_id_fk FOREIGN KEY (student_id) REFERENCES public.students(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.reminders
    ADD CONSTRAINT reminders_student_id_students_id_fk FOREIGN KEY (student_id) REFERENCES public.students(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_student_id_students_id_fk FOREIGN KEY (student_id) REFERENCES public.students(id) ON DELETE CASCADE;
