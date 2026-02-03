class GameService {
	constructor() {
		this.canvas = null;
		this.ctx = null;
		this.running = false;
		this.rafId = null;
		this.width = 0;
		this.height = 0;
	}

	init({ canvas }) {
		if (!canvas) {
			throw new Error("GameService.init: canvas is required");
		}

		this.canvas = canvas;
		this.ctx = canvas.getContext("2d");
	}

	start() {
		if (!this.canvas || !this.ctx) return;

		this.running = true;
		let last = performance.now();

		const loop = (now) => {
			if (!this.running) return;

			const dt = now - last;
			last = now;

			this.update(dt);
			this.draw();

			this.rafId = requestAnimationFrame(loop);
		};

		this.rafId = requestAnimationFrame(loop);
	}

	update(dt) {
		// logique du jeu
	}

	draw() {
		const { ctx, canvas } = this;

		ctx.clearRect(0, 0, canvas.width, canvas.height);
		ctx.fillStyle = "yellow";
		ctx.fillRect(42, 42, 100, 100);
	}

	destroy() {
		this.running = false;
		if (this.rafId) {
			cancelAnimationFrame(this.rafId);
		}

		this.canvas = null;
		this.ctx = null;
	}

	onResize(width, height) {
		this.width = width;
		this.height = height;
	}
}

export const gameService = new GameService();