import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { GameSetupComponent } from './components/game-setup/game-setup.component';
import { GamePlayComponent } from './components/game-play/game-play.component';
import { CharacterCreationComponent } from './components/character-creation/character-creation.component';
import { Character } from './models/character.model';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  imports: [
    GameSetupComponent,
    GamePlayComponent,
    CharacterCreationComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  gameState = signal<'setup' | 'character-creation' | 'playing'>('setup');
  adventurePrompt = signal<string>('');
  characterDetails = signal<Character | null>(null);

  onGameStart(prompt: string): void {
    this.adventurePrompt.set(prompt);
    this.gameState.set('character-creation');
  }

  onCharacterCreated(character: Character): void {
    this.characterDetails.set(character);
    this.gameState.set('playing');
  }

  onGameReset(): void {
    this.adventurePrompt.set('');
    this.characterDetails.set(null);
    this.gameState.set('setup');
  }
}
