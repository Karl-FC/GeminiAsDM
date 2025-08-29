export interface Stat {
  name: 'Strength' | 'Dexterity' | 'Constitution' | 'Intelligence' | 'Wisdom' | 'Charisma';
  value: number;
}

export interface Character {
  name: string;
  lore: string;
  stats: Stat[];
}
