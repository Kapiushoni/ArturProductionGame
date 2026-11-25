(() => { try { return game.fsmAplication.getActualState().getName() === 'mainMenu'; } catch { return false; } })()
