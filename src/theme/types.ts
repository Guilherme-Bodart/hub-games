export type ThemeName = 'neonParty' | 'sunsetPulse' | 'arcadeIce';

export type RawColors = {
  background: string;
  primary: string;
  secondary: string;
  accent: string;
  surface: string;
};

export type ThemeSemanticTokens = {
  bg: {
    app: string;
    surface: string;
    elevated: string;
    overlay: string;
  };
  text: {
    primary: string;
    secondary: string;
    muted: string;
    inverse: string;
  };
  border: {
    subtle: string;
    accent: string;
    focus: string;
  };
  button: {
    primary: {
      bg: string;
      text: string;
      glow: string;
    };
    secondary: {
      bg: string;
      text: string;
    };
    accent: {
      bg: string;
      text: string;
    };
    destructive: {
      bg: string;
      text: string;
    };
    ghost: {
      bg: string;
      text: string;
    };
  };
  card: {
    bg: string;
    border: string;
    radius: number;
    borderWidth: number;
  };
  input: {
    bg: string;
    border: string;
    text: string;
    placeholder: string;
  };
  badge: {
    successBg: string;
    successText: string;
    errorBg: string;
    errorText: string;
    warningBg: string;
    warningText: string;
    infoBg: string;
    infoText: string;
    hostBg: string;
    hostText: string;
    neutralBg: string;
    neutralText: string;
  };
  status: {
    success: string;
    error: string;
    warning: string;
    info: string;
  };
  shadow: {
    neon: string;
  };
  layout: {
    spacing: {
      xs: number;
      sm: number;
      md: number;
      lg: number;
      xl: number;
      xxl: number;
    };
    radius: {
      sm: number;
      md: number;
      lg: number;
      xl: number;
      full: number;
    };
    borderWidth: {
      subtle: number;
      medium: number;
      strong: number;
    };
    minTouchTarget: number;
  };
  elevation: {
    low: {
      shadowOpacity: number;
      shadowRadius: number;
      elevation: number;
    };
    medium: {
      shadowOpacity: number;
      shadowRadius: number;
      elevation: number;
    };
    high: {
      shadowOpacity: number;
      shadowRadius: number;
      elevation: number;
    };
  };
  motion: {
    duration: {
      instant: number;
      fast: number;
      normal: number;
      slow: number;
    };
    feedback: {
      pressedOpacity: number;
      disabledOpacity: number;
    };
  };
  game: {
    phase: {
      waiting: string;
      secrets: string;
      ordering: string;
      revealing: string;
      finished: string;
      reveal: string;
      clues: string;
      roundDecision: string;
      voting: string;
      guessing: string;
      result: string;
    };
    connection: {
      connected: string;
      reconnecting: string;
      error: string;
      offline: string;
    };
    result: {
      success: string;
      failure: string;
      pending: string;
    };
  };
  zIndex: {
    hud: number;
    floating: number;
    overlay: number;
    modal: number;
  };
  typography: {
    titleFamily: string;
    bodyFamily: string;
    numberFamily: string;
    titleWeight: '700';
    bodyWeight: '400';
    numberWeight: '800';
  };
};

export type ThemeTokens = {
  name: ThemeName;
  label: string;
  raw: RawColors;
  semantic: ThemeSemanticTokens;
};
