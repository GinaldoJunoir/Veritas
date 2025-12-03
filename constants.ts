import { AttributeKey, Skill } from './types';

export const INITIAL_ATTRIBUTES: Record<AttributeKey, number> = {
  DES: 1, CON: 1, INT: 1, PRE: 1, PER: 1, FOR: 1
};

// Full list of 41 skills from prompt
export const SKILL_LIST_TEMPLATE: Omit<Skill, 'training'>[] = [
  { name: 'Acrobacia', attrPrimary: 'DES', attrSecondary: 'CON' },
  { name: 'Agarrar', attrPrimary: 'FOR', attrSecondary: 'DES' },
  { name: 'Antropologia', attrPrimary: 'INT', attrSecondary: 'PER' },
  { name: 'Arqueologia', attrPrimary: 'INT', attrSecondary: 'PRE' },
  { name: 'Artes', attrPrimary: 'INT', attrSecondary: 'PRE' },
  { name: 'Atletismo', attrPrimary: 'CON', attrSecondary: 'DES' },
  { name: 'Cavalgar', attrPrimary: 'DES', attrSecondary: 'PRE' },
  { name: 'Ciência', attrPrimary: 'INT', attrSecondary: 'PRE' },
  { name: 'Conhecimento', attrPrimary: 'INT', attrSecondary: 'PRE' },
  { name: 'Criptografia', attrPrimary: 'INT', attrSecondary: 'PRE' },
  { name: 'Diplomacia', attrPrimary: 'PRE', attrSecondary: 'INT' },
  { name: 'Direito', attrPrimary: 'INT', attrSecondary: 'PRE' },
  { name: 'Dirigir', attrPrimary: 'DES', attrSecondary: 'INT' },
  { name: 'Disfarce', attrPrimary: 'PRE', attrSecondary: 'INT' },
  { name: 'Encontrar', attrPrimary: 'PER', attrSecondary: 'PRE' },
  { name: 'Engenharia', attrPrimary: 'INT', attrSecondary: 'PRE' },
  { name: 'Escutar', attrPrimary: 'PER', attrSecondary: 'PRE' },
  { name: 'Falsificação', attrPrimary: 'INT', attrSecondary: 'PER' },
  { name: 'Fortitude', attrPrimary: 'CON', attrSecondary: 'PRE' },
  { name: 'Furtividade', attrPrimary: 'DES', attrSecondary: 'INT' },
  { name: 'Geografia', attrPrimary: 'INT', attrSecondary: 'PRE' },
  { name: 'História', attrPrimary: 'INT', attrSecondary: 'PRE' },
  { name: 'Idioma Nativo', attrPrimary: 'INT', attrSecondary: 'PRE' },
  { name: 'Idiomas Diversos', attrPrimary: 'INT', attrSecondary: 'PRE' },
  { name: 'Intimidação', attrPrimary: 'PRE', attrSecondary: 'FOR' },
  { name: 'Intrusão', attrPrimary: 'DES', attrSecondary: 'INT' },
  { name: 'Lábia', attrPrimary: 'PRE', attrSecondary: 'INT' },
  { name: 'Lâminas', attrPrimary: 'FOR', attrSecondary: 'DES' },
  { name: 'Lutar', attrPrimary: 'FOR', attrSecondary: 'DES' },
  { name: 'Medicina', attrPrimary: 'INT', attrSecondary: 'DES' },
  { name: 'Mira', attrPrimary: 'DES', attrSecondary: 'PER' },
  { name: 'Natação', attrPrimary: 'DES', attrSecondary: 'CON' },
  { name: 'Persuasão', attrPrimary: 'PRE', attrSecondary: 'INT' },
  { name: 'Pilotar', attrPrimary: 'INT', attrSecondary: 'DES' },
  { name: 'Psicologia', attrPrimary: 'INT', attrSecondary: 'PRE' },
  { name: 'Primeiros Socorros', attrPrimary: 'DES', attrSecondary: 'INT' },
  { name: 'Reflexo', attrPrimary: 'DES', attrSecondary: 'PER' },
  { name: 'Religião', attrPrimary: 'INT', attrSecondary: 'PRE' },
  { name: 'Sobrevivência', attrPrimary: 'INT', attrSecondary: 'PRE' },
  { name: 'Sorte', attrPrimary: 'PRE', attrSecondary: 'PER' },
  { name: 'Tecnologia', attrPrimary: 'INT', attrSecondary: 'DES' },
  { name: 'Vontade', attrPrimary: 'PRE', attrSecondary: 'INT' },
];

export const JOBS_DATA = {
  "Acadêmico": {
    base: ["Conhecimento", "Encontrar"],
    variants: {
      "Arqueólogo": ["Arqueologia"],
      "Cientista": ["Ciência"],
      "Engenheiro": ["Engenharia"],
      "Geógrafo": ["Geografia"],
      "Historiador": ["História"],
      "Linguista": ["Idioma Nativo", "Idiomas Diversos"], // Choice
      "Mecânico": ["Tecnologia", "Dirigir"], // Choice
      "Psicólogo": ["Psicologia"],
      "Tecnologia da Informação": ["Tecnologia", "Criptografia"], // Choice
      "Sociólogo": ["Antropologia"]
    }
  },
  "Atleta": {
    base: ["Atletismo", "Encontrar"],
    variants: {
      "Acrobata": ["Acrobacia"],
      "Esgrimista": ["Lâminas"],
      "Hipista": ["Cavalgar"],
      "Lutador": ["Lutar"],
      "Nadador": ["Natação"],
      "Piloto": ["Dirigir", "Pilotar"] // Choice
    }
  },
  "Caçador": {
    base: ["Mira", "Sobrevivência"],
    variants: {
      "Indígena": ["Religião"],
      "Pescador": ["Natação"]
    }
  },
  "Criminoso": {
    base: ["Atletismo", "Furtividade"],
    variants: {
      "Arrependido": ["Intrusão", "Falsificação"], // Choice
      "Caçador de Recompensas": ["Lutar", "Mira"], // Choice
      "Cangaceiro": ["Mira"],
      "Trambiqueiro": ["Lábia", "Persuasão"] // Choice
    }
  },
  "Fazendeiro": {
    base: ["Religião", "Sobrevivência"],
    variants: {
      "Agricultor": ["Encontrar"],
      "Capataz": ["Intimidação"],
      "Criador": ["Ciência"], // Mapped 'Ciências' to 'Ciência'
      "Vaqueiro": ["Cavalgar"]
    }
  },
  "Homem da Lei": {
    base: ["Lábia", "Diplomacia"],
    variants: {
      "Bombeiro": ["Primeiros Socorros", "Lutar"], // Choice
      "Investigador": ["Encontrar", "Mira"], // Choice
      "Médico": ["Medicina"],
      "Pistoleiro": ["Mira"],
      "Policial": ["Lutar", "Mira"], // Choice
      "Socorrista": ["Primeiros Socorros"]
    }
  },
  "Jornalista": {
    base: ["Encontrar", "Lábia"],
    variants: {
      "Criminal": ["Diplomacia", "Direito"], // Choice
      "Fotojornalista": ["Intrusão", "Tecnologia"], // Choice
      "Investigativo": ["Escutar"],
      "Repórter": ["Conhecimento", "Tecnologia"] // Choice
    }
  },
  "Militar": {
    base: ["Lutar", "Mira"],
    variants: {
      "Combatente": ["Agarrar"],
      "Especialista": ["__ANY__"],
      "Técnico": ["Tecnologia"],
      "Artista Marcial": ["Reflexo"],
      "Médico": ["Medicina", "Primeiros Socorros"],
      "Cobaia": ["Sobrevivência"]
    }
  },
  "Religioso": {
    base: ["Encontrar", "Religião"],
    variants: {
      "Bispo": ["Conhecimento"],
      "Monge": ["Sobrevivência"],
      "Padre": ["Diplomacia", "História"], // Choice
      "Pastor": ["Persuasão"]
    }
  }
};