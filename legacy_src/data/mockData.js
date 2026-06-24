/**
 * Mock data layer.
 *
 * Shape mirrors the backend JPA entities from the uploaded
 * "Course Module Schema": CategoryEntity -> CourseEntity -> ModuleEntity
 * -> SubmoduleEntity -> ContentEntity.
 *
 * Field names below match the entity fields 1:1 (id, title, slug,
 * moduleOrder, submoduleOrder, contentOrder, isActive, isPublished, type...)
 * so this file can be swapped for real API calls later with minimal
 * changes to the components that consume it.
 */

export const CONTENT_TYPES = [
  { value: 'heading', label: 'Heading' },
  { value: 'text', label: 'Text' },
  { value: 'code', label: 'Code' },
  { value: 'image', label: 'Image' },
  { value: 'video', label: 'Video' },
  { value: 'callout', label: 'Callout' },
  { value: 'table', label: 'Table' },
]

// ── CategoryEntity ──────────────────────────────────────────────────────
export const categories = [
  { id: 1, name: 'Programming & Development', icon: '💻', color: 'purple' },
  { id: 2, name: 'Data Science & AI', icon: '📊', color: 'blue' },
  { id: 3, name: 'Cloud & DevOps', icon: '☁️', color: 'teal' },
  { id: 4, name: 'Design', icon: '🎨', color: 'amber' },
  { id: 5, name: 'Business Skills', icon: '📈', color: 'rose' },
]

let _id = 1000
const nid = () => _id++

// Helper to build a ContentEntity
const content = (type, fields, contentOrder, isActive = true) => ({
  id: nid(),
  type,
  contentOrder,
  isActive,
  ...fields,
})

// Helper to build a SubmoduleEntity
const submodule = (title, slug, submoduleOrder, contents, isActive = true) => ({
  id: nid(),
  title,
  slug,
  submoduleOrder,
  isActive,
  contents,
})

// Helper to build a ModuleEntity
const moduleEntity = (title, description, moduleOrder, submodules, isActive = true) => ({
  id: nid(),
  title,
  description,
  moduleOrder,
  isActive,
  submodules,
})

// ── CourseEntity[] (with nested modules) ────────────────────────────────
export const initialCourses = [
  {
    id: 1,
    title: 'Full-Stack Java Development',
    slug: 'full-stack-java-development',
    shortDescription: 'Java, Spring Boot, REST APIs and relational data — from fundamentals to a deployable capstone.',
    level: 'Intermediate',
    language: 'English',
    duration: '10 weeks',
    icon: '☕',
    categoryId: 1,
    isActive: true,
    isPublished: true,
    modules: [
      moduleEntity('Java Fundamentals', 'Core syntax, types and control flow.', 1, [
        submodule('Variables, Data Types & Operators', 'java-variables-data-types', 1, [
          content('heading', { title: 'Introduction to Java Variables', headingLevel: 2 }, 1),
          content('text', { text: 'Java is a statically typed language — every variable must be declared with a type before use.' }, 2),
          content('code', { code: 'int score = 42;\nString name = "Arpit";', language: 'java' }, 3),
          content('callout', { title: 'Pro tip', text: 'Use camelCase for variable names to stay idiomatic.' }, 4),
        ]),
        submodule('Control Flow & Loops', 'java-control-flow-loops', 2, [
          content('heading', { title: 'if / else, switch, and loops', headingLevel: 2 }, 1),
          content('text', { text: 'Control-flow statements decide which block of code runs next.' }, 2),
          content('video', { videoUrl: 'https://cdn.xebialms.com/videos/java-loops.mp4', caption: 'Loops walkthrough (6 min)' }, 3),
        ]),
      ]),
      moduleEntity('Object-Oriented Programming', 'Classes, objects, inheritance and abstraction.', 2, [
        submodule('Classes & Objects', 'java-classes-objects', 1, [
          content('text', { text: 'A class is a blueprint; an object is an instance of that blueprint.' }, 1),
          content('code', { code: 'class Student {\n  String name;\n}', language: 'java' }, 2),
        ]),
        submodule('Inheritance & Polymorphism', 'java-inheritance-polymorphism', 2, [
          content('text', { text: 'Subclasses inherit fields and methods, and can override behavior.' }, 1),
          content('image', { imageUrl: 'https://cdn.xebialms.com/img/inheritance-diagram.png', alt: 'Inheritance diagram' }, 2),
        ]),
        submodule('Interfaces & Abstraction', 'java-interfaces-abstraction', 3, [
          content('text', { text: 'Interfaces define a contract without implementation detail.' }, 1),
        ], false),
      ]),
      moduleEntity('Spring Boot & REST APIs', 'Building production-style backend services.', 3, [
        submodule('Building REST Controllers', 'spring-rest-controllers', 1, [
          content('code', { code: '@GetMapping("/courses")\npublic List<Course> all() { ... }', language: 'java' }, 1),
          content('text', { text: '@RestController combines @Controller and @ResponseBody for JSON APIs.' }, 2),
        ]),
        submodule('Working with JPA & Hibernate', 'spring-jpa-hibernate', 2, [
          content('text', { text: 'Spring Data JPA maps entities like CourseEntity directly to database tables.' }, 1),
          content('table', { title: 'Common annotations', caption: '@Entity, @Id, @OneToMany, @ManyToOne' }, 2),
        ]),
      ]),
      moduleEntity('Capstone Project', 'Plan, build and present a full-stack application.', 4, [
        submodule('Project Setup & Planning', 'capstone-setup-planning', 1, [
          content('text', { text: 'Scope your capstone, sketch the schema, and set milestones.' }, 1),
        ]),
      ], false),
    ],
  },
  {
    id: 2,
    title: 'Python for Data Science',
    slug: 'python-for-data-science',
    shortDescription: 'NumPy, Pandas and visualization fundamentals for working with real datasets.',
    level: 'Beginner',
    language: 'English',
    duration: '6 weeks',
    icon: '🐍',
    categoryId: 2,
    isActive: true,
    isPublished: true,
    modules: [
      moduleEntity('Python Essentials', 'Syntax, data structures and functions.', 1, [
        submodule('Lists, Dicts & Tuples', 'python-lists-dicts-tuples', 1, [
          content('heading', { title: 'Core Data Structures', headingLevel: 2 }, 1),
          content('code', { code: "scores = {'math': 92, 'sci': 88}", language: 'python' }, 2),
        ]),
        submodule('Functions & Modules', 'python-functions-modules', 2, [
          content('text', { text: 'Functions group reusable logic; modules group reusable functions.' }, 1),
        ]),
      ]),
      moduleEntity('Data Analysis with Pandas', 'Cleaning and exploring tabular data.', 2, [
        submodule('DataFrames & Series', 'pandas-dataframes-series', 1, [
          content('text', { text: 'A DataFrame is Pandas\u2019 primary structure for labeled, tabular data.' }, 1),
          content('code', { code: 'df = pd.read_csv("interns.csv")\ndf.head()', language: 'python' }, 2),
        ]),
        submodule('Cleaning Real-World Data', 'pandas-cleaning-data', 2, [
          content('callout', { title: 'Watch out', text: 'Always check for nulls before running aggregations.' }, 1),
        ]),
      ]),
      moduleEntity('Visualization Basics', 'Telling stories with Matplotlib & Seaborn.', 3, [
        submodule('Charts that Communicate', 'viz-charts-communicate', 1, [
          content('image', { imageUrl: 'https://cdn.xebialms.com/img/seaborn-example.png', alt: 'Seaborn chart example' }, 1),
          content('video', { videoUrl: 'https://cdn.xebialms.com/videos/matplotlib-intro.mp4', caption: 'Matplotlib in 8 minutes' }, 2),
        ]),
      ]),
    ],
  },
  {
    id: 3,
    title: 'AWS Cloud Practitioner Essentials',
    slug: 'aws-cloud-practitioner-essentials',
    shortDescription: 'Core AWS services, billing models and the shared responsibility model.',
    level: 'Beginner',
    language: 'English',
    duration: '4 weeks',
    icon: '☁️',
    categoryId: 3,
    isActive: true,
    isPublished: false,
    modules: [
      moduleEntity('Cloud Concepts', 'What "the cloud" actually means.', 1, [
        submodule('On-Prem vs Cloud', 'aws-on-prem-vs-cloud', 1, [
          content('text', { text: 'The cloud trades capital expense for pay-as-you-go operating expense.' }, 1),
        ]),
        submodule('Shared Responsibility Model', 'aws-shared-responsibility', 2, [
          content('table', { title: 'AWS vs Customer responsibilities' }, 1),
        ]),
      ]),
      moduleEntity('Core Services', 'EC2, S3 and IAM at a glance.', 2, [
        submodule('Compute: EC2 Basics', 'aws-ec2-basics', 1, [
          content('text', { text: 'EC2 provides resizable virtual machines billed by the second.' }, 1),
        ]),
        submodule('Storage: S3 Basics', 'aws-s3-basics', 2, [
          content('text', { text: 'S3 stores objects in buckets with near-unlimited durability.' }, 1),
        ], false),
      ]),
      moduleEntity('Billing & Support', 'Pricing calculators and support tiers.', 3, [
        submodule('Pricing Models', 'aws-pricing-models', 1, [
          content('text', { text: 'On-Demand, Reserved and Spot pricing each suit different workloads.' }, 1),
        ]),
      ], false),
    ],
  },
  {
    id: 4,
    title: 'UI/UX Design Fundamentals',
    slug: 'ui-ux-design-fundamentals',
    shortDescription: 'Design thinking, wireframing and usability testing for digital products.',
    level: 'Beginner',
    language: 'English',
    duration: '5 weeks',
    icon: '🎨',
    categoryId: 4,
    isActive: true,
    isPublished: true,
    modules: [
      moduleEntity('Design Thinking', 'Empathize, define, ideate.', 1, [
        submodule('User Research Methods', 'design-user-research', 1, [
          content('text', { text: 'Interviews and surveys surface needs that analytics alone miss.' }, 1),
        ]),
      ]),
      moduleEntity('Wireframing & Prototyping', 'From sketches to clickable prototypes.', 2, [
        submodule('Low-Fidelity Wireframes', 'design-low-fi-wireframes', 1, [
          content('image', { imageUrl: 'https://cdn.xebialms.com/img/wireframe-sample.png', alt: 'Wireframe sample' }, 1),
        ]),
        submodule('Interactive Prototypes', 'design-interactive-prototypes', 2, [
          content('video', { videoUrl: 'https://cdn.xebialms.com/videos/figma-prototype.mp4', caption: 'Figma prototyping demo' }, 1),
        ]),
      ]),
      moduleEntity('Usability Testing', 'Validating designs with real users.', 3, [
        submodule('Running a Usability Session', 'design-usability-session', 1, [
          content('text', { text: 'Five participants typically surface most usability issues.' }, 1),
        ]),
      ]),
    ],
  },
  {
    id: 5,
    title: 'Business Communication Mastery',
    slug: 'business-communication-mastery',
    shortDescription: 'Professional writing, presentation skills and stakeholder communication.',
    level: 'Intermediate',
    language: 'English',
    duration: '3 weeks',
    icon: '📈',
    categoryId: 5,
    isActive: true,
    isPublished: true,
    modules: [
      moduleEntity('Professional Writing', 'Emails, memos and reports that land.', 1, [
        submodule('Structuring a Clear Email', 'biz-clear-email', 1, [
          content('text', { text: 'Lead with the ask, then give context — not the other way around.' }, 1),
        ]),
      ]),
      moduleEntity('Presenting with Confidence', 'Structuring and delivering a pitch.', 2, [
        submodule('Building a Narrative Arc', 'biz-narrative-arc', 1, [
          content('text', { text: 'Every strong pitch has a tension and a resolution.' }, 1),
        ]),
      ]),
    ],
  },
  {
    id: 6,
    title: 'React & Modern Frontend Engineering',
    slug: 'react-modern-frontend-engineering',
    shortDescription: 'Component architecture, hooks, routing and state management with React.',
    level: 'Advanced',
    language: 'English',
    duration: '8 weeks',
    icon: '⚛️',
    categoryId: 1,
    isActive: true,
    isPublished: false,
    modules: [
      moduleEntity('React Fundamentals', 'Components, props and JSX.', 1, [
        submodule('Thinking in Components', 'react-thinking-components', 1, [
          content('text', { text: 'Break the UI into small, single-purpose components before writing code.' }, 1),
          content('code', { code: 'function Badge({ label }) {\n  return <span>{label}</span>\n}', language: 'jsx' }, 2),
        ]),
      ]),
      moduleEntity('Hooks & State', 'useState, useEffect and custom hooks.', 2, [
        submodule('useState & useEffect', 'react-usestate-useeffect', 1, [
          content('text', { text: 'useEffect synchronizes a component with an external system.' }, 1),
        ]),
        submodule('Building Custom Hooks', 'react-custom-hooks', 2, [
          content('code', { code: 'function useToggle(initial=false) {\n  const [v,setV]=useState(initial)\n  return [v, () => setV(x=>!x)]\n}', language: 'jsx' }, 1),
        ]),
      ], false),
      moduleEntity('Routing & Data', 'React Router and fetching data.', 3, [
        submodule('Client-Side Routing', 'react-client-side-routing', 1, [
          content('text', { text: 'React Router swaps page components without a full reload.' }, 1),
        ]),
      ]),
    ],
  },
]
