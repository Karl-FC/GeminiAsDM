import { Component, ChangeDetectionStrategy, output, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Character, Stat } from '../../models/character.model';

@Component({
  selector: 'app-character-creation',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './character-creation.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CharacterCreationComponent {
  characterCreated = output<Character>();

  characterName = signal('');
  characterLore = signal('');

  stats = signal<Stat[]>([
    { name: 'Strength', value: 8 },
    { name: 'Dexterity', value: 8 },
    { name: 'Constitution', value: 8 },
    { name: 'Intelligence', value: 8 },
    { name: 'Wisdom', value: 8 },
    { name: 'Charisma', value: 8 },
  ]);

  readonly MAX_POINTS = 27;

  private pointCostMap: { [key: number]: number } = {
    8: 0, 9: 1, 10: 2, 11: 3, 12: 4, 13: 5, 14: 7, 15: 9
  };

  totalPointsSpent = computed(() => {
    return this.stats().reduce((total, stat) => total + this.pointCostMap[stat.value], 0);
  });

  pointsAvailable = computed(() => this.MAX_POINTS - this.totalPointsSpent());

  isCreationComplete = computed(() => {
      return this.characterName().trim().length > 0 && this.pointsAvailable() >= 0;
  });

  private updateStat(statName: Stat['name'], change: number): void {
    this.stats.update(currentStats => 
      currentStats.map(stat => {
        if (stat.name === statName) {
          const newValue = stat.value + change;
          if (newValue >= 8 && newValue <= 15) {
            const costToChange = (change > 0) 
              ? this.pointCostMap[newValue] - this.pointCostMap[stat.value]
              : this.pointCostMap[stat.value] - this.pointCostMap[newValue];
            
            if (change > 0 && this.pointsAvailable() < costToChange) {
              return stat; // Not enough points
            }
            return { ...stat, value: newValue };
          }
        }
        return stat;
      })
    );
  }

  increaseStat(statName: Stat['name']): void {
    this.updateStat(statName, 1);
  }

  decreaseStat(statName: Stat['name']): void {
    this.updateStat(statName, -1);
  }
  
  canIncrease(stat: Stat): boolean {
    if (stat.value >= 15) return false;
    const costToIncrease = this.pointCostMap[stat.value + 1] - this.pointCostMap[stat.value];
    return this.pointsAvailable() >= costToIncrease;
  }

  createCharacter(): void {
    if (this.isCreationComplete()) {
      this.characterCreated.emit({
        name: this.characterName(),
        lore: this.characterLore(),
        stats: this.stats()
      });
    }
  }
}
