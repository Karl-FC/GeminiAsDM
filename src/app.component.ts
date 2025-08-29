import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { GameSetupComponent } from './components/game-setup/game-setup.component';
import { GamePlayComponent } from './components/game-play/game-play.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  imports: [GameSetupComponent, GamePlayComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  gameState = signal<'setup' | 'playing'>('setup');
  adventurePrompt = signal<string>('');

  onGameStart(prompt: string): void {
    this.adventurePrompt.set(prompt);
    this.gameState.set('playing');
  }

  onGameReset(): void {
    this.adventurePrompt.set('');
    this.gameState.set('setup');
  }
}
