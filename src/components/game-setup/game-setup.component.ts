import { Component, ChangeDetectionStrategy, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-game-setup',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './game-setup.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GameSetupComponent {
  gameStart = output<string>();
  prompt = signal('');

  startAdventure() {
    this.gameStart.emit(this.prompt());
  }
  
  startRandomAdventure() {
    this.gameStart.emit('Begin a random adventure for me.');
  }
}
