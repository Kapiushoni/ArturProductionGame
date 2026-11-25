(() => { try { return game.fsmAplication.getActualState().getName() === 'game' && !!game.constructor.gameHolder.gameView; } catch { return false; } })()
