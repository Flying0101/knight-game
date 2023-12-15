import Phaser from 'phaser'

import HelloWorldScene from './HelloWorldScene'

const config: Phaser.Types.Core.GameConfig = {
	type: Phaser.AUTO,
	parent: 'app',
	width: window.innerWidth * 1,
	height: window.innerHeight * 0.95,
	physics: {
		default: 'arcade',
		arcade: {
			gravity: { y: 400 },
		},
	},
	scene: [HelloWorldScene],
}

export default new Phaser.Game(config)
