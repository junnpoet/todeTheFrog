// Scoring constants per specification
export const SCORE_PER_SECOND = 0.1; // 1 point for every 10 seconds
export const SCORE_PER_KILL = 10;     // 10 points for each enemy defeated

export class ScoreSystem {
  constructor() {
    this.score = 0;
    this.displayedScore = -1;

    // Find or create UI container with class 'score'
    let element = document.querySelector('.score');
    if (!element) {
      element = document.createElement('div');
      element.className = 'score';
      document.body.appendChild(element);
    }
    this.element = element;
    this.updateUI();
  }

  addPoints(points) {
    this.score += points;
    this.updateUI();
  }

  onEnemyDefeated() {
    this.addPoints(SCORE_PER_KILL);
  }

  update(delta) {
    // Survival scoring: 0.1 points per second (1 point per 10s)
    this.score += SCORE_PER_SECOND * delta;
    this.updateUI();
  }

  getScore() {
    return Math.floor(this.score);
  }

  reset() {
    this.score = 0;
    this.displayedScore = -1;
    this.updateUI();
  }

  updateUI() {
    const rounded = Math.floor(this.score);
    if (rounded !== this.displayedScore) {
      this.displayedScore = rounded;
      this.element.textContent = `Score: ${rounded}`;
    }
  }
}

export function createScoreSystem() {
  return new ScoreSystem();
}

export default createScoreSystem;
