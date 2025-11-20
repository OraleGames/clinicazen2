-- Insert sample categories
INSERT INTO categories (name, description) VALUES
('Terapia Energética', 'Terapias que trabajan con la energía del cuerpo'),
('Salud Mental', 'Terapias enfocadas en el bienestar emocional y mental'),
('Medicina Tradicional China', 'Prácticas ancestrales chinas para la salud'),
('Terapia Psicológica', 'Terapias basadas en la psicología moderna'),
('Medicina Alternativa', 'Enfoques no convencionales para la salud');

-- Insert sample services
INSERT INTO services (name, description, extended_description, image_url, price, category_id) VALUES
('Biomagnetismo', 'Terapia que utiliza imanes para equilibrar el pH del cuerpo', 'El Biomagnetismo es una terapia alternativa que busca restaurar el equilibrio del cuerpo utilizando imanes de diferentes polaridades para neutralizar patógenos y promover la autosanación.', '/images/biomagnetismo.jpg', 120.00, 1),
('Psicología Clínica', 'Rama de la psicología encargada de la evaluación, diagnóstico y tratamiento de trastornos mentales', 'La Psicología Clínica se centra en la comprensión y tratamiento de problemas mentales, emocionales y conductuales, utilizando terapias basadas en la evidencia.', '/images/psicologia-clinica.jpg', 150.00, 2),
('Hipnoterapia', 'Técnica terapéutica que utiliza estados alterados de consciencia para acceder al subconsciente', 'La hipnoterapia es una forma de psicoterapia que utiliza la hipnosis para crear un estado de atención enfocada y mayor susceptibilidad a la sugestión terapéutica.', '/images/hipnosis.jpg', 100.00, 4),
('Acupuntura', 'Técnica terapéutica que consiste en la inserción de agujas finas en puntos específicos del cuerpo', 'La acupuntura es una práctica de la medicina tradicional china que busca restaurar el equilibrio energético del cuerpo mediante la estimulación de puntos específicos.', '/images/acupuntura.jpg', 80.00, 3),
('Barras de Access', 'Técnica energética que consiste en tocar suavemente 32 puntos en la cabeza', 'Las Barras de Access es una técnica de sanación energética que busca liberar pensamientos, ideas, creencias, emociones y consideraciones limitantes.', '/images/barras-access.jpg', 90.00, 5);

-- Insert sample symptoms
INSERT INTO symptoms (name, description) VALUES
('Dolor', 'Dolor físico o emocional persistente'),
('Inflamación', 'Proceso inflamatorio en el cuerpo'),
('Fatiga', 'Cansancio extremo o falta de energía'),
('Ansiedad', 'Sentimientos de preocupación o nerviosismo'),
('Depresión', 'Estado de ánimo bajo persistente'),
('Trastornos del sueño', 'Dificultad para dormir o mantener el sueño'),
('Estrés', 'Respuesta del cuerpo a desafíos o presiones'),
('Fobias', 'Miedos intensos e irracionales'),
('Insomnio', 'Dificultad para conciliar el sueño'),
('Adicciones', 'Dependencia de sustancias o comportamientos');

-- Insert sample diseases
INSERT INTO diseases (name, description) VALUES
('Gastritis', 'Inflamación del revestimiento del estómago'),
('Colitis', 'Inflamación del colon'),
('Alergias', 'Reacciones del sistema inmunitario a sustancias'),
('Acidez estomacal', 'Sensación de ardor en el pecho'),
('Artritis', 'Inflamación de las articulaciones'),
('Fibromialgia', 'Dolor musculoesquelético generalizado'),
('Tiroides', 'Trastornos de la glándula tiroides'),
('Migrañas', 'Dolor de cabeza intenso y recurrente'),
('Dolor crónico', 'Dolor persistente a largo plazo'),
('Trastorno de Ansiedad Generalizada', 'Preocupación excesiva y crónica');

-- Link services with symptoms
INSERT INTO service_symptoms (service_id, symptom_id) VALUES
(1, 1), (1, 2), (1, 3), -- Biomagnetismo
(2, 4), (2, 5), (2, 6), -- Psicología Clínica
(3, 4), (3, 6), (3, 7), (3, 8), -- Hipnoterapia
(4, 1), (4, 6), (4, 9), -- Acupuntura
(5, 3), (5, 4), (5, 7); -- Barras de Access

-- Link services with diseases
INSERT INTO service_diseases (service_id, disease_id) VALUES
(1, 1), (1, 2), (1, 3), (1, 4), (1, 5), (1, 6), (1, 7), -- Biomagnetismo
(2, 8), (2, 9), (2, 10), -- Psicología Clínica
(3, 8), (3, 9), (3, 10), (3, 4), (3, 6), -- Hipnoterapia
(4, 8), (4, 9), (4, 5), (4, 3), -- Acupuntura
(5, 6), (5, 8), (5, 9); -- Barras de Access

-- Insert sample blog posts
INSERT INTO blog_posts (title, slug, content, excerpt, author_id, published) VALUES
('Los Beneficios del Biomagnetismo', 'los-beneficios-del-biomagnetismo', 'El biomagnetismo es una terapia alternativa que utiliza imanes para equilibrar el pH del cuerpo...', 'Descubre cómo el biomagnetismo puede mejorar tu salud de forma natural', NULL, true),
('Cómo Superar la Ansiedad con Terapias Holísticas', 'como-superar-la-ansiedad-con-terapias-holisticas', 'La ansiedad es uno de los problemas más comunes en la sociedad moderna...', 'Aprende técnicas naturales para manejar la ansiedad', NULL, true),
('La Acupuntura y sus Beneficios Comprobados', 'la-acupuntura-y-sus-beneficios-comprobados', 'La acupuntura ha sido utilizada por miles de años...', 'Conoce los beneficios científicamente comprobados de la acupuntura', NULL, true);