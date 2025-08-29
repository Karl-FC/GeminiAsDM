import { Component, ChangeDetectionStrategy, input, output, signal, effect, ElementRef, viewChild, afterNextRender } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { GeminiService } from '../../services/gemini.service';
import { Character } from '../../models/character.model';

interface Message {
  role: 'user' | 'model';
  text: string;
}

@Component({
  selector: 'app-game-play',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './game-play.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GamePlayComponent {
  initialPrompt = input.required<string>();
  character = input.required<Character>();
  gameReset = output<void>();

  adventureLog = signal<Message[]>([]);
  userInput = signal('');
  isLoading = signal(true);
  error = signal<string | null>(null);

  private adventureContainer = viewChild<ElementRef<HTMLDivElement>>('adventureContainer');
  private isInitialized = false;

  constructor(private geminiService: GeminiService) {
    afterNextRender(() => {
        this.initializeAdventure();
    });

    effect(() => {
      const container = this.adventureContainer();
      if (container) {
        this.scrollToBottom(container.nativeElement);
      }
    });
  }

  private scrollToBottom(element: HTMLElement): void {
    setTimeout(() => {
        element.scrollTop = element.scrollHeight;
    }, 0);
  }

  async initializeAdventure() {
    if (this.isInitialized) return;
    this.isInitialized = true;
    
    this.geminiService.startChat();

    const char = this.character();
    const characterSheet = `
My Character Sheet:
Name: ${char.name}
Backstory: ${char.lore || 'No backstory provided.'}
Abilities:
- Strength: ${char.stats.find(s => s.name === 'Strength')?.value}
- Dexterity: ${char.stats.find(s => s.name === 'Dexterity')?.value}
- Constitution: ${char.stats.find(s => s.name === 'Constitution')?.value}
- Intelligence: ${char.stats.find(s => s.name === 'Intelligence')?.value}
- Wisdom: ${char.stats.find(s => s.name === 'Wisdom')?.value}
- Charisma: ${char.stats.find(s => s.name === 'Charisma')?.value}
    `;

    const adventure = this.initialPrompt() || 'Begin a random adventure for me.';
    const fullPrompt = `Let's start the adventure.\n\n${characterSheet}\n\nAdventure Synopsis: ${adventure}`;
    
    // Display a friendlier message in the log
    this.adventureLog.set([{ role: 'user', text: `Let the adventure begin: ${adventure}` }]);
    await this.streamResponse(fullPrompt);
  }

  async sendAction(): Promise<void> {
    const currentInput = this.userInput().trim();
    if (!currentInput || this.isLoading()) {
      return;
    }
    this.userInput.set('');
    this.adventureLog.update(log => [...log, { role: 'user', text: currentInput }]);
    await this.streamResponse(currentInput);
  }

  private async streamResponse(prompt: string): Promise<void> {
    this.isLoading.set(true);
    this.error.set(null);
    
    try {
      const stream = await this.geminiService.sendMessageStream(prompt);
      let currentModelMessage = '';
      this.adventureLog.update(log => [...log, { role: 'model', text: '...' }]);

      for await (const chunk of stream) {
        currentModelMessage += chunk.text;
        this.adventureLog.update(log => {
          const newLog = [...log];
          newLog[newLog.length - 1] = { role: 'model', text: currentModelMessage + '...' };
          return newLog;
        });
      }

      this.adventureLog.update(log => {
        const newLog = [...log];
        newLog[newLog.length - 1] = { role: 'model', text: currentModelMessage };
        return newLog;
      });

    } catch (e: any) {
      console.error(e);
      this.error.set(e.message || 'An unknown error occurred.');
      this.adventureLog.update(log => [...log, { role: 'model', text: `A magical interference has occurred! ${this.error()}` }]);
    } finally {
      this.isLoading.set(false);
    }
  }

  resetGame(): void {
    this.gameReset.emit();
  }

  public formatMessage(text: string): string {
    return text.replace(/\n/g, '<br>');
  }
}
