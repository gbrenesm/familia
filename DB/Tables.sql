CREATE TYPE genders_types AS ENUM ('mujer', 'hombre', 'no encontrado');
CREATE TYPE relations_types AS ENUM ('padre_hijx', 'madre_hijx', 'compañerxs');
CREATE TYPE event_types AS ENUM ('nacimiento', 'defunción', 'bautizo', 'matrimonio', 'otro');

CREATE TABLE persons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255),
    first_lastname VARCHAR(255) NOT NULL,
    second_lastname VARCHAR(255),
    gender genders_types,
    completed BOOLEAN DEFAULT false,

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP DEFAULT NULL
);


CREATE TABLE relations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type relations_types,
    first_person_id UUID NOT NULL,
    second_person_id UUID NOT NULL,

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),

    CONSTRAINT fk_first_person_id
      FOREIGN KEY (first_person_id)
      REFERENCES persons(id)
      ON UPDATE CASCADE,

    CONSTRAINT fk_second_person_id
      FOREIGN KEY (second_person_id)
      REFERENCES persons(id)
      ON UPDATE CASCADE
);

CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type event_types,
    date VARCHAR(255),
    place VARCHAR(255),
    state VARCHAR(255),
    country VARCHAR(255),
    description TEXT,

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP DEFAULT NULL
);

CREATE TABLE person_events (
    person_id UUID NOT NULL,
    event_id UUID NOT NULL,

    PRIMARY KEY (person_id, event_id),

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP DEFAULT NULL,

    CONSTRAINT fk_person_id
      FOREIGN KEY (person_id)
      REFERENCES persons(id)
      ON UPDATE CASCADE,

    CONSTRAINT fk_event_id
      FOREIGN KEY (event_id)
      REFERENCES events(id)
      ON UPDATE CASCADE
);


CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    url TEXT NOT NULL,
    person_id UUID NOT NULL,
    event_id UUID NOT NULL,

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP DEFAULT NULL,

    CONSTRAINT fk_documents_person_id
      FOREIGN KEY (person_id)
      REFERENCES persons(id)
      ON UPDATE CASCADE,

    CONSTRAINT fk_documents_event_id
      FOREIGN KEY (event_id)
      REFERENCES events(id)
      ON UPDATE CASCADE
);


CREATE TABLE photos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    url TEXT NOT NULL,
    description TEXT,
    person_id UUID NOT NULL,

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP DEFAULT NULL,

    CONSTRAINT fk_photos_person_id
      FOREIGN KEY (person_id)
      REFERENCES persons(id)
      ON UPDATE CASCADE
);
