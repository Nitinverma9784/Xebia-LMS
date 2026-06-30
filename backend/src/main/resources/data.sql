-- 1. Insert Categories
INSERT INTO categories (name, icon, description, color, is_active, created_at, updated_at)
VALUES 
('Programming', '💻', 'Software engineering, coding, and backend development courses.', '#007ACC', true, NOW(), NOW()),
('Design', '🎨', 'UI/UX Design, Figma, and creative arts.', '#FF5733', true, NOW(), NOW());

-- 2. Insert Courses
INSERT INTO courses (
    title, slug, description, short_description, level, language, duration, 
    icon, thumbnail, banner_image, is_active, is_featured, category_id,
    meta_title, meta_description, robots, og_title, og_description, og_type,
    learning_outcomes, prerequisites, target_audience, course_highlights, career_opportunities,
    total_views, total_clicks, ctr, seo_score, is_published, allow_indexing, show_in_search,
    created_at, updated_at
) VALUES (
    'Java Programming Masterclass', 'java-programming-masterclass', 
    'Learn Java from scratch to advanced concepts including OOP, Streams, and Multithreading.',
    'Become a professional Java developer with real-world practices.', 
    'Beginner to Advanced', 'English', '45 hours',
    'java-icon.png', 'java-thumbnail.png', 'java-banner.png', true, true, 
    (SELECT id FROM categories WHERE name = 'Programming' LIMIT 1),
    'Java Programming Masterclass | Squarebrackets', 
    'Become a professional Java developer by learning OOP, Multi-threading, and Collections.',
    'index, follow', 'Java Masterclass', 'Comprehensive Java course', 'website',
    'Master core Java concepts, Write object-oriented clean code, Work with streams and lambda expressions',
    'No prior programming experience required', 
    'Beginner developers, computer science students, and career switchers',
    '45 hours of video content, Hands-on code exercises, Certificate of completion',
    'Java Software Engineer, Backend Developer, Application Architect',
    0, 0, 0.0, 85, true, true, true,
    NOW(), NOW()
), (
    'Figma UI/UX Design Fundamentals', 'figma-ui-ux-design-fundamentals',
    'Master UI/UX Design theory, wireframing, high-fidelity prototyping, and component libraries in Figma.',
    'Learn professional web design in Figma.',
    'Beginner', 'English', '20 hours',
    'figma-icon.png', 'figma-thumbnail.png', 'figma-banner.png', true, false, 
    (SELECT id FROM categories WHERE name = 'Design' LIMIT 1),
    'Figma UI/UX Design Fundamentals Course | Squarebrackets',
    'Learn wireframing, high-fidelity mockups, and interactive prototypes in Figma.',
    'index, follow', 'Figma Design Fundamentals', 'Comprehensive Figma course', 'website',
    'Create beautiful mockups, Understand UI/UX design theories, Build interactive prototypes',
    'A computer and a free Figma account',
    'Aspiring UI/UX designers, product managers, and developers looking to learn design',
    '20 hours of video lectures, 10 design challenges, downloadable asset packages',
    'UI/UX Designer, Product Designer, Interaction Designer',
    0, 0, 0.0, 80, true, true, true,
    NOW(), NOW()
);

-- 3. Insert Modules
INSERT INTO modules (title, description, module_order, is_active, course_id, created_at, updated_at)
VALUES 
('Introduction to Java Basics', 'Set up your IDE, write your first Hello World, and understand Java variables.', 1, true, 
 (SELECT id FROM courses WHERE slug = 'java-programming-masterclass' LIMIT 1), NOW(), NOW()),
('Object-Oriented Programming (OOP) in Java', 'Master Classes, Objects, Inheritance, Polymorphism, and Abstraction.', 2, true, 
 (SELECT id FROM courses WHERE slug = 'java-programming-masterclass' LIMIT 1), NOW(), NOW());

-- 4. Insert Submodules
INSERT INTO submodules (
    title, description, slug, meta_title, meta_description, 
    submodule_order, is_active, module_id, created_at, updated_at
) VALUES (
    'Classes and Objects Explained', 'Understand the blueprint concept of Class and instantiation into Objects.', 
    'classes-and-objects-java', 'Classes and Objects in Java | Java OOP Tutorial',
    'Learn how to declare classes and instantiate objects in Java with diagrams.',
    1, true, 
    (SELECT id FROM modules WHERE title = 'Object-Oriented Programming (OOP) in Java' LIMIT 1), NOW(), NOW()
), (
    'Inheritance and Polymorphism', 'Extend classes using the extends keyword and master method overriding.',
    'inheritance-and-polymorphism-java', 'Inheritance and Polymorphism in Java | Java OOP Tutorial',
    'Learn super keyword, method overriding, inheritance types, and dynamic binding.',
    2, true, 
    (SELECT id FROM modules WHERE title = 'Object-Oriented Programming (OOP) in Java' LIMIT 1), NOW(), NOW()
);

-- 5. Insert Contents
INSERT INTO contents (
    type, title, text, code, language, video_url, caption, 
    content_order, is_active, submodule_id, created_at, updated_at
) VALUES (
    'text', 'Defining Java Classes', 
    'A class in Java is a blueprint from which individual objects are created. It contains variables to represent state and methods to represent behavior.',
    NULL, NULL, NULL, NULL,
    1, true, 
    (SELECT id FROM submodules WHERE slug = 'classes-and-objects-java' LIMIT 1), NOW(), NOW()
), (
    'code', 'Example: Declaring a Class and Instantiation',
    NULL,
    'public class Car {\n    String color;\n    int speed;\n\n    void accelerate() {\n        speed += 10;\n    }\n}\n\n// Instantiation\nCar sportsCar = new Car();\nsportsCar.color = "Red";\nsportsCar.accelerate();',
    'java', NULL, NULL,
    2, true, 
    (SELECT id FROM submodules WHERE slug = 'classes-and-objects-java' LIMIT 1), NOW(), NOW()
), (
    'video', 'Classes vs Objects Video Overview',
    NULL, NULL, NULL,
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 
    'An intuitive video visualization of Java class instantiation.',
    3, true, 
    (SELECT id FROM submodules WHERE slug = 'classes-and-objects-java' LIMIT 1), NOW(), NOW()
);
