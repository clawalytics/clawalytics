import { Router, type Request, type Response } from 'express';
import {
  handleDesktopCloseChoice,
  loadDesktopPreferences,
  notifyDesktopPreferencesChanged,
  saveDesktopPreferences,
  type DesktopCloseAction,
  type DesktopCloseChoiceAction,
  type DesktopLocale,
  type DesktopStartupMode,
} from '../services/desktop-service.js';

const router: Router = Router();

router.get('/preferences', (_req: Request, res: Response): void => {
  try {
    res.json(loadDesktopPreferences());
  } catch (error) {
    console.error('Error fetching desktop preferences:', error);
    res.status(500).json({ error: 'Failed to fetch desktop preferences' });
  }
});

router.post('/preferences', (req: Request, res: Response): void => {
  try {
    const updates = req.body as Partial<{
      locale: DesktopLocale;
      closeAction: DesktopCloseAction;
      launchOnStartup: boolean;
      startupMode: DesktopStartupMode;
    }>;

    const preferences = saveDesktopPreferences({
      locale: updates.locale,
      closeAction: updates.closeAction,
      launchOnStartup: updates.launchOnStartup,
      startupMode: updates.startupMode,
    });

    void notifyDesktopPreferencesChanged(preferences);
    res.json(preferences);
  } catch (error) {
    console.error('Error saving desktop preferences:', error);
    res.status(500).json({ error: 'Failed to save desktop preferences' });
  }
});

router.post('/window/close-choice', async (req: Request, res: Response): Promise<void> => {
  try {
    const { action, remember } = req.body as {
      action?: DesktopCloseChoiceAction;
      remember?: boolean;
    };

    if (!action || !['tray', 'quit', 'cancel'].includes(action)) {
      res.status(400).json({ error: 'Invalid close action' });
      return;
    }

    let preferences = loadDesktopPreferences();

    if (remember === true && action !== 'cancel') {
      preferences = saveDesktopPreferences({ closeAction: action });
      void notifyDesktopPreferencesChanged(preferences);
    }

    await handleDesktopCloseChoice(action);
    res.json(preferences);
  } catch (error) {
    console.error('Error handling desktop close choice:', error);
    res.status(500).json({ error: 'Failed to handle desktop close choice' });
  }
});

export default router;
